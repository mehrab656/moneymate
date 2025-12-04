import React, { useEffect, useState, useContext } from "react";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button } from "react-bootstrap";
import Select from "react-select";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import {
  useCreateIncomeMutation,
  useGetSingleIncomeDataQuery,
} from "../../../api/slices/incomeSlice.js";

const defaultReference = [
  { value: "air-bnb", label: "Airbnb" },
  { value: "booking", label: "Booking.com" },
  { value: "vrbo", label: "VRBO" },
  { value: "expedia", label: "Expedia" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "bankTransfer", label: "Bank Transfer" },
];

const defaultIncomeType = [
  { value: "reservation", label: "Reservation" },
  { value: "rent", label: "Rent" },
  { value: "electricity_bill", label: "Electricity Bill" },
  { value: "internet_bill", label: "Internet Bill" },
  { value: "service", label: "Service Provide" },
  { value: "others", label: "Others" },
];

const _initialIncome = {
  id: null,
  amount: "",
  description: "",
  reference: null,
  income_type: null,
  date: "",
  checkin_date: "",
  checkout_date: "",
  note: "",
  attachment: "",
  account: null,
  category: null,
};

export default function IncomeFormSidebar({
  incomeId,
  onSuccess,
  showLabel = "true",
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12,
}) {
  const [income, setIncome] = useState(_initialIncome);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const { closeSidebar } = useSidebarActions();
  const { themeMode } = useContext(SettingsContext);

  const { data: getBankData } = useGetBankDataQuery({
    currentPage: "",
    pageSize: 100,
  });
  const { data: getCategoryListData, isFetching: categoryIsFetching } =
    useGetCategoryListDataQuery({ categoryType: "income" });
  const { data: getSingleIncomeData } = useGetSingleIncomeDataQuery(
    { id: incomeId },
    { skip: !incomeId }
  );
  const [createIncome] = useCreateIncomeMutation();

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

  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const modifiedAccounts = getBankData.data.map(
        ({ id, bank_name, account_number, slug }) => ({
          value: slug ?? id,
          label: `${bank_name}(${account_number})`,
        })
      );
      setAccounts(modifiedAccounts);
    }
    if (getCategoryListData?.data?.length > 0) {
      const modifiedCategories = getCategoryListData.data.map((c) => ({
        value: c?.value ?? c?.id ?? c?.slug,
        label:
          c?.label ??
          c?.name ??
          c?.category_name ??
          String(c?.id ?? "Category"),
      }));
      setCategories(modifiedCategories);
    }
    if (incomeId && getSingleIncomeData?.data) {
      // The backend returns account/category/reference/income_type in {value,label} shape
      const serverIncome = getSingleIncomeData.data;
      setIncome((prev) => ({
        ...prev,
        ...serverIncome,
      }));
    }
  }, [incomeId, getSingleIncomeData, getBankData, getCategoryListData]);

  // Do NOT set automatic default date in create mode; user must choose
  // Keep date empty unless editing an existing record

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setIncome({ ...income, attachment: file });
  };

  const submitIncome = async (event, stay = false) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    if (!income?.account?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, account: ["Account is required."] }));
      notification("error", "Account required", "Please select an account.");
      return;
    }
    if (!income?.category?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, category: ["Category is required."] }));
      notification("error", "Category required", "Please select a category.");
      return;
    }
    if (!income?.amount || Number(income.amount) <= 0) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, amount: ["Enter a positive amount."] }));
      notification("error", "Amount invalid", "Please enter a valid amount.");
      return;
    }

    const formData = new FormData();
    formData.append("account", income.account.value);
    formData.append("income_type", income?.income_type?.value ?? "");
    formData.append("amount", income.amount);
    formData.append("category", income.category.value);
    formData.append("description", income.description ?? "");
    formData.append("note", income.note ?? "");
    formData.append("reference", income?.reference?.value ?? "");
    formData.append("date", income.date ?? "");
    formData.append("checkin_date", income.checkin_date ?? "");
    formData.append("checkout_date", income.checkout_date ?? "");
    if (income.attachment) {
      formData.append("attachment", income.attachment);
    }

    const url = incomeId ? `/income/${incomeId}` : "/income/add";
    try {
      const data = await createIncome({ url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (stay) {
        setIncome({ ..._initialIncome });
      } else {
        onSuccess?.();
        closeSidebar();
      }
    } catch (err) {
      if (err.status === 422) {
        setErrors(err?.errorData?.errors || {});
        notification(
          "error",
          err?.message || "Validation error",
          err?.description || "Please review the highlighted fields."
        );
      } else {
        notification(
          "error",
          err?.message || "An error occurred",
          err?.description || "Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const reservationSelected =
    (income?.income_type?.value ?? "") === "reservation";

  return (
    <div style={{ fontSize: "0.875rem" }}>
      <MainLoader loaderVisible={loading} />
      {sidebarTitle && <h6>{sidebarTitle ? sidebarTitle : ""}</h6>}
      <WizCard className="animated fadeInDown">
        <Form onSubmit={(e) => submitIncome(e, false)}>
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3" controlId="description">
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
                  value={income.description ?? ""}
                  name="description"
                  onChange={(e) =>
                    setIncome({ ...income, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={colXS} md={colMD} sm={colSM}>
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
                  placeholder="i.g: 50 AED"
                  value={income.amount}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setIncome({ ...income, amount: e.target.value })
                  }
                />
                {errors.amount && (
                  <p className="error-message">{errors.amount[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={colXS} md={colMD} sm={colSM}>
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
                  value={income.account}
                  isSearchable
                  name="account"
                  options={accounts}
                  styles={selectStyles}
                  placeholder={"Select Bank Account"}
                  onChange={(e) => {
                    setIncome({ ...income, account: e });
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
          </Row>

          <Row>
            <Col xs={colXS} md={colMD} sm={colSM}>
              <Form.Group className="mb-3" controlId="category">
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
                  value={income.category}
                  isSearchable
                  name="category"
                  isLoading={categoryIsFetching}
                  options={categories}
                  styles={selectStyles}
                  placeholder={"Select Category"}
                  onChange={(e) => {
                    setIncome({ ...income, category: e });
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
            <Col xs={colXS} md={colMD} sm={colSM}>
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
                  value={income.date}
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setIncome({ ...income, date: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={colXS} md={colMD} sm={colSM}>
              <Form.Group className="mb-3" controlId="reference">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Reference
                  </Form.Label>
                )}
                <Select
                  classNamePrefix="select"
                  value={income.reference}
                  isSearchable
                  name="reference"
                  options={defaultReference}
                  styles={selectStyles}
                  placeholder={"Select Reference"}
                  onChange={(e) => setIncome({ ...income, reference: e })}
                />
                {errors.reference && (
                  <p className="error-message">{errors.reference[0]}</p>
                )}
              </Form.Group>
            </Col>
            <Col xs={colXS} md={colMD} sm={colSM}>
              <Form.Group className="mb-3" controlId="income_type">
                {showLabel && (
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Income Type
                  </Form.Label>
                )}
                <Select
                  classNamePrefix="select"
                  value={income.income_type}
                  isSearchable
                  name="income_type"
                  options={defaultIncomeType}
                  styles={selectStyles}
                  placeholder={"Select Income Type"}
                  onChange={(e) => setIncome({ ...income, income_type: e })}
                />
                {errors.income_type && (
                  <p className="error-message">{errors.income_type[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          {reservationSelected && (
            <Row>
              <Col xs={colXS} md={colMD} sm={colSM}>
                <Form.Group className="mb-3" controlId="checkin_date">
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Check-in Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={income.checkin_date}
                    onChange={(e) =>
                      setIncome({ ...income, checkin_date: e.target.value })
                    }
                  />
                  {errors.checkin_date && (
                    <p className="error-message">{errors.checkin_date[0]}</p>
                  )}
                </Form.Group>
              </Col>
              <Col xs={colXS} md={colMD} sm={colSM}>
                <Form.Group className="mb-3" controlId="checkout_date">
                  <Form.Label
                    style={{ marginBottom: 0 }}
                    className="custom-form-label"
                  >
                    Check-out Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={income.checkout_date}
                    onChange={(e) =>
                      setIncome({ ...income, checkout_date: e.target.value })
                    }
                  />
                  {errors.checkout_date && (
                    <p className="error-message">{errors.checkout_date[0]}</p>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col xs={colXS} md={colMD} sm={colSM}>
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
                  value={income.note ?? ""}
                  name="note"
                  style={{ fontSize: inputFontSize }}
                  onChange={(e) =>
                    setIncome({ ...income, note: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col xs={colXS} md={colMD} sm={colSM}>
              <Form.Group className="mb-3">
                {showLabel && <Form.Label>Add Attachment</Form.Label>}
                <Form.Control
                  type="file"
                  onChange={handleFileInputChange}
                  style={{ fontSize: inputFontSize }}
                />
                {errors.attachment && (
                  <p className="error-message">{errors.attachment[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {incomeId ? (
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Updating..." : "Update Income"}
                  </Button>
                ) : (
                  <>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? "Saving..." : "Add Income"}
                    </Button>
                    {/* <Button
                      type="button"
                      variant="success"
                      disabled={loading}
                      onClick={(e) => submitIncome(e, true)}
                    >
                      {loading ? "Saving..." : "Save & Add Another"}
                    </Button> */}
                  </>
                )}
                {/* <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={closeSidebar}
                >
                  Cancel
                </Button> */}
              </div>
            </Col>
          </Row>
        </Form>
      </WizCard>
    </div>
  );
}
