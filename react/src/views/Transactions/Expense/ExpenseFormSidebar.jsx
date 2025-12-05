import React, { useEffect, useState, useContext } from "react";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button,InputGroup } from "react-bootstrap";
import {
  useCreateExpenseMutation,
  useGetSingleExpenseDataQuery,
} from "../../../api/slices/expenseSlice.js";
import Select from "react-select";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faTrash} from "@fortawesome/free-solid-svg-icons";

const _initialExpense = [{
  amount: "",
  refundable_amount: "",
  description: "",
  reference: "",
  date: "",
  note: "",
  attachment: "",
  account: null,
  category: null,
}];

export default function ExpenseFormSidebar({
  expenseId=null,
  onSuccess,
  showLabel = "true",
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12,
}) {
  const [expenses, setExpenses] = useState(_initialExpense);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saveBtnTxt, setSaveBtnTxt] = useState("Save");
  const [errors, setErrors] = useState({});
  const { closeSidebar } = useSidebarActions();
  const { themeMode } = useContext(SettingsContext);

  const addExpenses = () => {
    setExpenses([
      ...expenses,
      {
        amount: "",
        refundable_amount: "",
        description: "",
        reference: "",
        date: "",
        note: "",
        attachment: "",
        account: null,
        category: null,
      },
    ]);
  };

  const removeExpenses = (index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  };
  const handleExpenseInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedExpenses = [...expenses];
    updatedExpenses[index][name] = value;
    setExpenses(updatedExpenses);
  };
  const handleFileInputChange = (event,index,name) => {
    const file = event.target.files[0];
    const updatedExpenses = [...expenses];
    updatedExpenses[index][name] = file;
    setExpenses(updatedExpenses);

  };
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

    // if (!expense?.account?.value) {
    //   setSaveBtnTxt("Save");
    //   setLoading(false);
    //   setErrors((prev) => ({ ...prev, account: ["Account is required."] }));
    //   notification("error", "Account required", "Please select an account.");
    //   return;
    // }
    // if (!expense?.category?.value) {
    //   setSaveBtnTxt("Save");
    //   setLoading(false);
    //   setErrors((prev) => ({ ...prev, category: ["Category is required."] }));
    //   notification("error", "Category required", "Please select a category.");
    //   return;
    // }
    // if (!expense?.date) {
    //   setSaveBtnTxt("Save");
    //   setLoading(false);
    //   setErrors((prev) => ({ ...prev, date: ["Date is required."] }));
    //   notification("error", "Date required", "Please select a date.");
    //   return;
    // }
    // if (!expense?.amount || Number(expense.amount) <= 0) {
    //   setSaveBtnTxt("Save");
    //   setLoading(false);
    //   setErrors((prev) => ({ ...prev, amount: ["Enter a positive amount."] }));
    //   notification("error", "Amount invalid", "Please enter a valid amount.");
    //   return;
    // }

    const formData  = new FormData();
    // formData.append("account_id", expense.account.value);
    // formData.append("amount", expense.amount);
    // Use `refundable_amount` for updates.
    // For creates, default `return_amount` to `refundable_amount` if provided,
    // otherwise fall back to the entered `amount`.
    if (expenseId) {
      const refundableVal = Number(expense?.refundable_amount ?? 0);
      // Send BOTH to satisfy backend validation and DB mapping on update
      formData.append("refundable_amount", refundableVal);
      formData.append("return_amount", refundableVal);
    } else {
      // const createVal = Number(
      //   expense?.refundable_amount !== undefined &&
      //     expense?.refundable_amount !== ""
      //     ? expense?.refundable_amount
      //     : expense?.amount ?? 0
      // );
      // // Send BOTH to satisfy possible backend expectations and DB mapping
      // formData.append("return_amount", createVal);
      // formData.append("refundable_amount", createVal);
    }
    // formData.append("category_id", expense.category.value);
    // formData.append("description", expense.description);
    // formData.append("note", expense.note);
    // formData.append("reference", expense.reference);
    // formData.append("date", expense.date);

    // if (expense.attachment) {
    //   formData.append("attachment", expense.attachment);
    // }
    formData.append('expenses',JSON.stringify(expenses))

    const url = expenseId ? `/expense/${expenseId}` : "/expense/add";
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
        <Form>
          {expenses.map((expense,index) => (
                  <div>
                    <Row>
                      <Col xs={colXS} md={colMD} sm={colSM}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {showLabel &&
                              <InputGroup.Text>Description</InputGroup.Text>
                          }
                          <Form.Control as="textarea" aria-label="Description"
                                        placeholder={"Description"}
                                        value={expense.description ?? ""}
                                        name="note"
                                        style={{fontSize: inputFontSize}}
                                        onChange={(e) => handleExpenseInputChange(e,index)}
                          />
                        </InputGroup>
                      </Col>
                      <Col xs={colXS} md={colMD} sm={colSM}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {showLabel &&
                              <InputGroup.Text>Note</InputGroup.Text>
                          }
                          <Form.Control as="textarea" aria-label="Note"
                                        placeholder={"Note"}
                                        value={expense.note ?? ""}
                                        name="note"
                                        style={{fontSize: inputFontSize}}
                                        onChange={(e) => handleExpenseInputChange(e,index)}

                          />
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {
                              showLabel &&
                              <InputGroup.Text id="amount">Amount</InputGroup.Text>
                          }
                          <Form.Control
                              placeholder="Expense Amount"
                              aria-label="Expense Amount"
                              aria-describedby="amount"
                              type="number"
                              value={expense.amount}
                              // style={{ fontSize: inputFontSize }}
                              onChange={(e) => handleExpenseInputChange(e,index)}

                          />
                          {errors.amount && (
                              <p className="error-message">{errors.amount[0]}</p>
                          )}
                        </InputGroup>
                      </Col>

                      <Col xs={12} md={6}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {
                              showLabel &&
                              <InputGroup.Text id="refundable_amount">Refundable Amount</InputGroup.Text>
                          }
                          <Form.Control
                              placeholder="Refundable Amount"
                              aria-label="Refundable Amount"
                              aria-describedby="refundable_amount"
                              type="number"
                              value={expense.refundable_amount}
                              // style={{ fontSize: inputFontSize }}
                              onChange={(e) => handleExpenseInputChange(e,index)}

                          />
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={colXS} md={colMD}>
                        <Form.Group className="mb-3" controlId="account">
                          <Select
                              classNamePrefix="select"
                              value={expense.account}
                              isSearchable
                              name="account"
                              options={accounts}
                              styles={selectStyles}
                              placeholder={"Select Bank Account"}
                              onChange={(e) => {
                                handleExpenseInputChange(e,index);
                                if (errors.account && e?.value) {
                                  const next = {...errors};
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
                        <InputGroup className="mb-3" size={'sm'}>
                          {
                              showLabel &&
                              <InputGroup.Text id="category_id">Category</InputGroup.Text>
                          }
                          <Select
                              classNamePrefix="select"
                              value={expense.category}
                              isSearchable
                              name="category_id"
                              styles={selectStyles}
                              isLoading={categoryIsFetching}
                              options={categories}
                              onChange={(e) => {
                                handleExpenseInputChange(e,index);
                                if (errors.category && e?.value) {
                                  const next = {...errors};
                                  delete next.category;
                                  setErrors(next);
                                }
                              }}
                          />
                          {errors.category && (
                              <p className="error-message">{errors.category[0]}</p>
                          )}
                        </InputGroup>

                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {
                              showLabel &&
                              <InputGroup.Text id="date">Date</InputGroup.Text>
                          }
                          <Form.Control
                              placeholder="Date"
                              aria-label="Date"
                              aria-describedby="date"
                              type="date"
                              value={expense.date}
                              // style={{ fontSize: inputFontSize }}
                              onChange={(e) =>
                                  handleExpenseInputChange(e,index)
                              }
                          />
                        </InputGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <InputGroup className="mb-3" size={'sm'}>
                          {
                              showLabel &&
                              <InputGroup.Text id="reference">Reference</InputGroup.Text>
                          }
                          <Form.Control
                              placeholder="Reference"
                              aria-label="Reference"
                              aria-describedby="reference"
                              type="text"
                              value={expense.date}
                              // style={{ fontSize: inputFontSize }}
                              onChange={(e) =>
                                  handleExpenseInputChange(e,index)
                              }
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={colXS} md={colMD}>
                        <InputGroup className="mb-3" size={'sm'}>
                          <Form.Control
                              placeholder="Add Attachment"
                              aria-label="Add Attachment"
                              aria-describedby="reference"
                              type="file"
                              onChange={(e)=>{
                                handleFileInputChange(e,index,'attachment')
                              }}
                          />
                        </InputGroup>

                      </Col>
                      {
                        index >0 &&
                          <Col xs={colXS} md={colMD}>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeExpenses(index)}
                                className="flex-shrink-0 float-end"

                            >
                              <FontAwesomeIcon icon={faTrash} />

                            </Button>
                          </Col>
                      }
                    </Row>
                    <hr/>
                  </div>
              )
          )}
        </Form>
      <Row className="g-2">
        <Col xs={12}>
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
            {expenseId ? (
                <Button
                    className={"primary-theme-btn btn-sm"}
                    type="submit"
                    variant="primary"
                    disabled={loading}
                >
                  {loading ? "Updating..." : "Update Expense"}
                </Button>
            ) : (
                <>
                  <Button
                      className={"primary-theme-btn btn-sm"}
                      type="button"
                      variant="primary"
                      onClick={addExpenses}
                  >
                    {"Add More"}
                  </Button>
                  <Button
                      className={"primary-theme-btn btn-sm"}
                      type="button"
                      variant="primary"
                      disabled={loading}
                      onClick={(e) => expenseSubmit(e, true)}
                  >
                    {loading ? "Saving..." : "Submit"}
                  </Button>
                </>

            )}
          </div>
        </Col>
      </Row>

    </div>
  );
}
