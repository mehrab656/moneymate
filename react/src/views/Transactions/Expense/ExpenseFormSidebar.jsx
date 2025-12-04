import React, { useEffect, useState, useContext } from "react";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button } from "react-bootstrap";
import {
  useCreateExpenseMutation,
  useGetSingleExpenseDataQuery,
} from "../../../api/slices/expenseSlice.js";
import Select from "react-select";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

const _initialExpense = {
  id: null,
  amount: "",
  refundable_amount: "",
  description: "",
  reference: "",
  date: "",
  note: "",
  attachment: "",
  account: null,
  category: null,
};

export default function ExpenseFormSidebar({
  expenseId,
  onSuccess,
  showLabel = "true",
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12,
}) {
  const [expense, setExpense] = useState(_initialExpense);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saveBtnTxt, setSaveBtnTxt] = useState("Save");
  const [errors, setErrors] = useState({});
  const { closeSidebar } = useSidebarActions();
  const { themeMode } = useContext(SettingsContext);

  // api calls
  const { data: getBankData } = useGetBankDataQuery({
    currentPage: "",
    pageSize: 100,
  });
  const { data: getCategoryListData, isFetching: categoryIsFetching } =
    useGetCategoryListDataQuery({ categoryType: "expense" });
  const { data: getSingleExpenseData } = useGetSingleExpenseDataQuery(
    { id: expenseId },
    { skip: !expenseId }
  );
  const [createExpense] = useCreateExpenseMutation();

  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const modifiedAccounts = getBankData.data.map(
        ({ id, bank_name, account_number }) => ({
          value: id,
          label: `${bank_name}(${account_number})`,
        })
      );
      setAccounts(modifiedAccounts);
    }
    if (getCategoryListData?.data?.length > 0) {
      const modifiedCategories = getCategoryListData.data.map((c) => ({
        value: c?.value ?? c?.id,
        label:
          c?.label ??
          c?.name ??
          c?.category_name ??
          String(c?.id ?? "Category"),
      }));
      setCategories(modifiedCategories);
      // Do NOT preselect a default category for create mode
    }
    if (expenseId && getSingleExpenseData?.data) {
      setExpense(getSingleExpenseData.data);
    }
  }, [expenseId, getSingleExpenseData, getBankData, getCategoryListData]);

  // Do NOT set automatic default date; user must choose explicitly in create mode

  const expenseSubmit = async (event, stay = false) => {
    event.preventDefault();
    setLoading(true);
    setSaveBtnTxt("Saving...");

    if (!expense?.account?.value) {
      setSaveBtnTxt("Save");
      setLoading(false);
      setErrors((prev) => ({ ...prev, account: ["Account is required."] }));
      notification("error", "Account required", "Please select an account.");
      return;
    }
    if (!expense?.category?.value) {
      setSaveBtnTxt("Save");
      setLoading(false);
      setErrors((prev) => ({ ...prev, category: ["Category is required."] }));
      notification("error", "Category required", "Please select a category.");
      return;
    }
    if (!expense?.date) {
      setSaveBtnTxt("Save");
      setLoading(false);
      setErrors((prev) => ({ ...prev, date: ["Date is required."] }));
      notification("error", "Date required", "Please select a date.");
      return;
    }
    if (!expense?.amount || Number(expense.amount) <= 0) {
      setSaveBtnTxt("Save");
      setLoading(false);
      setErrors((prev) => ({ ...prev, amount: ["Enter a positive amount."] }));
      notification("error", "Amount invalid", "Please enter a valid amount.");
      return;
    }

    const formData = new FormData();
    formData.append("account_id", expense.account.value);
    formData.append("amount", expense.amount);
    // Use `refundable_amount` for updates.
    // For creates, default `return_amount` to `refundable_amount` if provided,
    // otherwise fall back to the entered `amount`.
    if (expense?.id) {
      const refundableVal = Number(expense?.refundable_amount ?? 0);
      // Send BOTH to satisfy backend validation and DB mapping on update
      formData.append("refundable_amount", refundableVal);
      formData.append("return_amount", refundableVal);
    } else {
      const createVal = Number(
        expense?.refundable_amount !== undefined &&
          expense?.refundable_amount !== ""
          ? expense?.refundable_amount
          : expense?.amount ?? 0
      );
      // Send BOTH to satisfy possible backend expectations and DB mapping
      formData.append("return_amount", createVal);
      formData.append("refundable_amount", createVal);
    }
    formData.append("category_id", expense.category.value);
    formData.append("description", expense.description);
    formData.append("note", expense.note);
    formData.append("reference", expense.reference);
    formData.append("date", expense.date);
    if (expense.attachment) {
      formData.append("attachment", expense.attachment);
    }

    const url = expense.id ? `/expense/${expense.id}` : "/expense/add";
    try {
      const data = await createExpense({ url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (stay) {
        setExpense({ ..._initialExpense });
      } else {
        onSuccess?.();
        closeSidebar();
      }
    } catch (err) {
      setSaveBtnTxt("Save");
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setExpense({ ...expense, attachment: file });
  };

  // Enforce consistent font size for inputs and selects
  const inputFontSize = "0.875rem";
  const isDark = themeMode === "dark";
  const selectStyles = {
    control: (base) => ({
      ...base,
      fontSize: inputFontSize,
      minHeight: 38,
      backgroundColor: isDark ? "#1c1f24" : "#fff",
      borderColor: isDark ? "#3a4048" : "#c5ccd6",
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    input: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    }),
    menu: (base) => ({
      ...base,
      fontSize: inputFontSize,
      backgroundColor: isDark ? "#23262b" : "#fff",
    }),
    option: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
  };

  return (
    <div style={{ fontSize: "0.875rem" }}>
      <MainLoader loaderVisible={loading} />
      {sidebarTitle && <h6>{sidebarTitle ? sidebarTitle : ""}</h6>}
      <WizCard className="animated fadeInDown">
        <Form onSubmit={(e) => expenseSubmit(e, false)}>
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3" controlId="Expense Description">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Description
                  </Form.Label>
                )}
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={expense.description ?? ""}
                  name="description"
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({ ...expense, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="amount">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Amount
                  </Form.Label>
                )}
                <Form.Control
                  type="number"
                  placeholder="Expense Amount"
                  value={expense.amount}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({ ...expense, amount: e.target.value })
                  }
                />
                {errors.amount && (
                  <p className="error-message">{errors.amount[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="refundable_amount">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Refundable Amount
                  </Form.Label>
                )}
                <Form.Control
                  type="number"
                  placeholder="Refundable Amount"
                  value={expense.refundable_amount}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({
                      ...expense,
                      refundable_amount: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={colXS} md={colMD}>
              <Form.Group className="mb-3" controlId="account">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Account
                  </Form.Label>
                )}

                <Select
                  classNamePrefix="select"
                  value={expense.account}
                  isSearchable
                  name="account"
                  options={accounts}
                  styles={selectStyles}
                  placeholder={"Select Bank Account"}
                  onChange={(e) => {
                    setExpense({ ...expense, account: e });
                    if (errors.account && e?.value) {
                      const next = { ...errors };
                      delete next.account;
                      setErrors(next);
                    }
                  }}
                />
                {errors.account && (
                  <p className="error-message">{errors.account[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={colXS} md={colMD}>
              <Form.Group className="mb-3" controlId="category_id">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Category
                  </Form.Label>
                )}
                <Select
                  classNamePrefix="select"
                  value={expense.category}
                  isSearchable
                  name="category_id"
                  styles={selectStyles}
                  isLoading={categoryIsFetching}
                  options={categories}
                  onChange={(e) => {
                    setExpense({ ...expense, category: e });
                    if (errors.category && e?.value) {
                      const next = { ...errors };
                      delete next.category;
                      setErrors(next);
                    }
                  }}
                />
                {errors.category && (
                  <p className="error-message">{errors.category[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="date">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Date
                  </Form.Label>
                )}
                <Form.Control
                  type="date"
                  value={expense.date}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({ ...expense, date: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="reference">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Reference
                  </Form.Label>
                )}

                <Form.Control
                  type="text"
                  placeholder="i.g: 50 AED"
                  value={expense.reference ?? ""}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({ ...expense, reference: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={colXS} md={colMD}>
              <Form.Group className="mb-3" controlId="note">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Note
                  </Form.Label>
                )}

                <Form.Control
                  as="textarea"
                  rows={3}
                  value={expense.note ?? ""}
                  name="note"
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setExpense({ ...expense, note: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            <Col xs={colXS} md={colMD}>
              <Form.Group className="mb-3">
                {showLabel && <Form.Label>Add Attachment</Form.Label>}
                <Form.Control
                  type="file"
                  onChange={handleFileInputChange}
                  style={{ fontSize: inputFontSize }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {expense.id ? (
                  <Button
                    className={"btn-sm"}
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Expense"}
                  </Button>
                ) : (
                  <Button
                    className={"btn-sm"}
                    type="button"
                    variant="primary"
                    disabled={loading}
                    onClick={(e) => expenseSubmit(e, true)}
                  >
                    {loading ? "Saving..." : "Add Expense"}
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </WizCard>
    </div>
  );
}
