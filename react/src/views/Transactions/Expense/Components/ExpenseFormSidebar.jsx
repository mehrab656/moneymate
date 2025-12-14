import React, { useEffect, useState, useContext, useImperativeHandle, forwardRef, useRef } from "react";
import WizCard from "../../../../components/WizCard.jsx";
import MainLoader from "../../../../components/loader/MainLoader.jsx";
import { notification } from "../../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button, InputGroup } from "react-bootstrap";
import {
  useCreateExpenseMutation,
  useGetSingleExpenseDataQuery,
} from "../../../../api/slices/expenseSlice.js";
import Select from "react-select";
import { useGetBankDataQuery } from "../../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../../api/slices/categorySlice.js";
import { useSidebarActions } from "../../../../components/GlobalSidebar/index.js";
import { SettingsContext } from "../../../../contexts/SettingsContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { isImageUrl } from "../../../../helper/media.js";
import { useTheme, alpha } from "@mui/material/styles";
import { createSelectStyles } from "../../../../styles/formThemeStyles.js";


const _initialExpense = () => ({
  description: "",
  note: "",
  amount: "",
  refundable_amount: "",
  account: null,
  category: null,
  date: "",
  reference: "",
  attachment: "",
  attachment_preview_url: "",
});

export const EXPENSE_FORM_ID = "expense-form-sidebar-form";

const ExpenseFormSidebar = forwardRef(function ExpenseFormSidebar({
  expenseId = null,
  onSuccess,
  showLabel = "true",
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12, formType='single',
  footerActions = null,
      formId: formIdProp = null,
}, ref) {
  const [expenses, setExpenses] = useState([_initialExpense()]);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saveBtnTxt, setSaveBtnTxt] = useState("Save");
  const [errors, setErrors] = useState({});

  const renderFieldErrors = (idx, field) => {
    try {
      const msgs = [];
      const e = errors || {};
      const dotKey = `${idx}.${field}`;
      const pushVals = (val) => {
        if (Array.isArray(val)) msgs.push(...val);
        else if (val) msgs.push(String(val));
      };
      if (e[dotKey]) pushVals(e[dotKey]);
      if (e[idx] && typeof e[idx] === "object" && e[idx][field]) pushVals(e[idx][field]);
      if (e[field]) pushVals(e[field]);
      const cleaned = msgs.map((m) => m.replaceAll(`${idx}.`, ""));
      if (!cleaned.length) return null;
      return (
        <div className="text-danger" style={{ fontSize: "0.85rem", marginTop: errorMarginTop }}>
          {cleaned.map((m, i) => (
            <div key={`ferr-${idx}-${field}-${i}`}>{m}</div>
          ))}
        </div>
      );
    } catch {
      return null;
    }
  };
  const hasFieldError = (idx, field) => {
    const e = errors || {};
    return Boolean(
      e[`${idx}.${field}`] ||
      (e[idx] && typeof e[idx] === "object" && e[idx][field]) ||
      e[field]
    );
  };
  const { closeSidebar } = useSidebarActions();
  const { themeMode } = useContext(SettingsContext);
  const theme = useTheme();
  const formRef = useRef(null);
  const loadedExpenseIdRef = useRef(null);

  const formId = formIdProp || EXPENSE_FORM_ID;

  const addExpenses = () => {
    setExpenses([...expenses, _initialExpense()]);
  };

  const removeExpenses = (index) => {
    const updatedExpenses = [...expenses];
    // Revoke any object URL for the row being removed to prevent leaks
    const prevUrl = updatedExpenses[index]?.attachment_preview_url;
    if (prevUrl) {
      try { URL.revokeObjectURL(prevUrl); } catch {}
    }
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  };
  const handleExpenseInputChange = (e, index, fieldName) => {
    // Clone row objects to avoid mutating frozen/cache-backed objects
    const updatedExpenses = expenses.map((row) => ({ ...row }));

    // Native inputs use event.target; react-select passes the selected option object
    if (e && e.target) {
      const { name, value } = e.target;
      updatedExpenses[index][name] = value;
      // Clear any server-side error for this field at this index
      setErrors((prev) => {
        if (!prev || typeof prev !== "object") return prev;
        const next = { ...prev };
        const key = `${index}.${name}`;
        if (next[key]) delete next[key];
        if (next[index] && typeof next[index] === "object") {
          const nested = { ...next[index] };
          if (nested[name]) delete nested[name];
          if (Object.keys(nested).length) next[index] = nested; else delete next[index];
        }
        if (next[name]) delete next[name]; // fallback for non-indexed keys
        return next;
      });
    } else {
      const name = fieldName; // explicit field name for react-select
      const option = e;
      // Normalize to always store { value, label } for selects
      const normalized =
        option && typeof option === "object"
          ? {
              value: option?.value ?? option?.slug ?? option?.id ?? null,
              label:
                option?.label ??
                option?.name ??
                option?.category_name ??
                String(option?.id ?? ""),
            }
          : { value: option ?? null, label: String(option ?? "") };
      updatedExpenses[index][name] = normalized;
      // Clear any server-side error for this select at this index
      setErrors((prev) => {
        if (!prev || typeof prev !== "object") return prev;
        const next = { ...prev };
        const key = `${index}.${name}`;
        if (next[key]) delete next[key];
        if (next[index] && typeof next[index] === "object") {
          const nested = { ...next[index] };
          if (nested[name]) delete nested[name];
          if (Object.keys(nested).length) next[index] = nested; else delete next[index];
        }
        if (next[name]) delete next[name]; // fallback for non-indexed keys
        return next;
      });
    }
    setExpenses(updatedExpenses);
  };
  const handleFileInputChange = (event, index, name) => {
    const file = event.target.files[0];
    const updatedExpenses = expenses.map((row) => ({ ...row }));
    // Cleanup any previous preview URL before setting a new file
    const prevUrl = updatedExpenses[index]?.attachment_preview_url;
    if (prevUrl) {
      try { URL.revokeObjectURL(prevUrl); } catch {}
    }
    updatedExpenses[index][name] = file;
    updatedExpenses[index].attachment_preview_url = file ? URL.createObjectURL(file) : "";
    setExpenses(updatedExpenses);

    // Clear any server-side error for this attachment field
    setErrors((prev) => {
      if (!prev || typeof prev !== "object") return prev;
      const next = { ...prev };
      const key1 = `${index}.${name}`;
      if (next[key1]) delete next[key1];
      if (next[index] && typeof next[index] === "object") {
        const nested = { ...next[index] };
        if (nested[name]) delete nested[name];
        if (Object.keys(nested).length) next[index] = nested; else delete next[index];
      }
      if (next[name]) delete next[name];
      return next;
    });
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

  // Populate accounts and categories when API results arrive.
  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const modifiedAccounts = getBankData.data.map(
        ({ slug, id, bank_name, account_number }) => ({
          value: slug ?? id ?? account_number ?? null,
          label: `${bank_name}(${account_number})`,
        })
      );
      setAccounts(modifiedAccounts);
    }
    if (getCategoryListData?.data?.length > 0) {
      const modifiedCategories = getCategoryListData.data.map((c) => {
        const label =
          c?.label ?? c?.name ?? c?.category_name ?? String(c?.id ?? "Category");
        let val = c?.slug ?? c?.id ?? c?.value ?? null;
        if (val && String(val).trim() === String(label).trim()) {
          val = c?.slug ?? c?.id ?? null;
        }
        return { value: val, label };
      });
      setCategories(modifiedCategories);
    }
  }, [getBankData, getCategoryListData]);

  // Load initial expense rows for edit mode, without clobbering user edits
  useEffect(() => {
    if (expenseId && getSingleExpenseData?.data) {
      const payload = getSingleExpenseData.data;
      const rows = Array.isArray(payload) ? payload : [payload];
      if (loadedExpenseIdRef.current !== expenseId) {
        loadedExpenseIdRef.current = expenseId;
        setExpenses(rows);
      }
    }
  }, [expenseId, getSingleExpenseData]);

  // Expose imperative API for parent to trigger internal actions
  useImperativeHandle(ref, () => ({
    addExpenses,
  }));

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

    const formData = new FormData();

    // Build payloads per endpoint shape:
    // - Create: send `expenses` array JSON with optional attachments_* files
    // - Update: send flattened fields expected by UpdateExpenseRequest
    const isUpdate = Boolean(expenseId);
    if (isUpdate) {
      const row = expenses[0] || {};
      const accountSlug = row?.account?.value ?? "";
      const categorySlug = row?.category?.value ?? "";
      const amountVal = row?.amount ?? "";
      const returnAmount = row?.refundable_amount ?? 0; // backend requires `return_amount`

      if (accountSlug) formData.append("account_id", accountSlug);
      if (categorySlug) formData.append("category_id", categorySlug);
      if (amountVal !== undefined && amountVal !== null) formData.append("amount", amountVal);
      formData.append("return_amount", returnAmount);
      if (row?.description !== undefined) formData.append("description", row.description ?? "");
      if (row?.note !== undefined) formData.append("note", row.note ?? "");
      if (row?.reference !== undefined) formData.append("reference", row.reference ?? "");
      if (row?.date !== undefined) formData.append("date", row.date ?? "");
      if (row?.attachment instanceof File) {
        formData.append("attachment", row.attachment);
      }
    } else {
      // Create flow: keep JSON payload unchanged in shape but EXCLUDE attachment field
      const jsonExpenses = expenses.map((exp) => {
        const out = { ...exp };
        if ("attachment" in out) delete out.attachment;
        return out;
      });
      formData.append("expenses", JSON.stringify(jsonExpenses));
      // Only append attachments so files serialize correctly alongside JSON
      expenses.forEach((exp, idx) => {
        if (exp.attachment instanceof File) {
          formData.append(`attachments_${idx}`, exp.attachment);
        }
      });
    }

    const url = isUpdate ? `/expense/${expenseId}` : "/expense/add";
    try {
      const data = await createExpense({ url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (stay) {
        // Revoke any object URLs before resetting to avoid memory leaks
        try {
          expenses.forEach((exp) => {
            if (exp?.attachment_preview_url) URL.revokeObjectURL(exp.attachment_preview_url);
          });
        } catch {}
        try { formRef.current?.reset(); } catch {}
        setExpenses([_initialExpense()]);
        setErrors({});
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
      // Capture server-side validation errors to render under each row.
      // Some backends return `{ errors: {...} }`, others return the errors object directly.
      const payload = err?.errorData;
      let serverErrors = null;
      if (payload && typeof payload === "object") {
        if (payload.errors && typeof payload.errors === "object") {
          serverErrors = payload.errors;
        } else {
          serverErrors = payload; // raw errors object (e.g., {"0.description": [..]})
        }
      }
      // Remap backend keys to local field names for inline display
      if (serverErrors && typeof serverErrors === "object") {
        const remapped = {};
        Object.entries(serverErrors).forEach(([key, val]) => {
          let newKey = key;
          // Map top-level keys
          if (key === "account_id") newKey = "account";
          else if (key === "category_id") newKey = "category";
          else if (key === "return_amount") newKey = "refundable_amount";
          // Map indexed keys like "0.account_id" -> "0.account"
          else if (/\.account_id$/.test(key)) newKey = key.replace(/\.account_id$/, ".account");
          else if (/\.category_id$/.test(key)) newKey = key.replace(/\.category_id$/, ".category");
          else if (/\.return_amount$/.test(key)) newKey = key.replace(/\.return_amount$/, ".refundable_amount");
          remapped[newKey] = val;
        });
        setErrors(remapped);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enforce consistent font size for inputs and selects
  const inputFontSize = "0.875rem";
  const errorMarginTop = 2;
  const selectStyles = createSelectStyles(theme, inputFontSize);

  // isImageUrl imported from helper/media.js

  return (
    <div className="px-2 expense-sidebar" style={{ fontSize: "0.875rem", overflowX: "hidden" }}>
      <MainLoader loaderVisible={loading} />
      {sidebarTitle && <h6>{sidebarTitle ? sidebarTitle : ""}</h6>}
      <Form ref={formRef} id={formId} onSubmit={(e) => expenseSubmit(e, Boolean(footerActions))}>
        <div className="sidebar-scroll-content">
        {expenses.map((expense, index) => (
          <div>
            <Row>
              <Col xs={colXS} md={colMD} sm={colSM}>
                <InputGroup className={hasFieldError(index, "description") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && <InputGroup.Text style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Description</InputGroup.Text>}
                  <Form.Control
                    as="textarea"
                    aria-label="Description"
                    placeholder={"Description"}
                    value={expense.description ?? ""}
                    name="description"
                    style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
                {renderFieldErrors(index, "description")}
              </Col>
              <Col xs={colXS} md={colMD} sm={colSM}>
                <InputGroup className="mb-3" size={"sm"}>
                  {showLabel && <InputGroup.Text style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Note</InputGroup.Text>}
                  <Form.Control
                    as="textarea"
                    aria-label="Note"
                    placeholder={"Note"}
                    value={expense.note ?? ""}
                    name="note"
                    style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <InputGroup className={hasFieldError(index, "amount") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="amount" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Amount</InputGroup.Text>
                  )}
                  <Form.Control
                    placeholder="Expense Amount"
                    aria-label="Expense Amount"
                    aria-describedby="amount"
                    name={"amount"}
                    type="number"
                    value={expense.amount}
                    // style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
                {renderFieldErrors(index, "amount")}
              </Col>

              <Col xs={12} md={6}>
                <InputGroup className={hasFieldError(index, "refundable_amount") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="refundable_amount" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>
                      Refundable Amount
                    </InputGroup.Text>
                  )}
                  <Form.Control
                    placeholder="Refundable Amount"
                    aria-label="Refundable Amount"
                    aria-describedby="refundable_amount"
                    name="refundable_amount"
                    type="number"
                    value={expense.refundable_amount}
                    // style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
                {renderFieldErrors(index, "refundable_amount")}
              </Col>
            </Row>
            <Row>
              <Col xs={colXS} md={colMD}>
                <InputGroup className={hasFieldError(index, "account") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="account" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Bank Account</InputGroup.Text>
                  )}
                  <Select
                    classNamePrefix="select"
                    value={expense.account}
                    isSearchable={false}
                    name="account"
                    options={accounts}
                    styles={selectStyles}
                    placeholder={"Select account"}
                    onChange={(option) => {
                      handleExpenseInputChange(option, index, 'account');
                      if (errors.account && option?.value) {
                        const next = { ...errors };
                        delete next.account;
                        setErrors(next);
                      }
                    }}
                  />
                </InputGroup>
                {renderFieldErrors(index, "account")}
              </Col>
              <Col xs={colXS} md={colMD}>
                <InputGroup className={hasFieldError(index, "category") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="category_id" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Category</InputGroup.Text>
                  )}
                  <Select
                    classNamePrefix="select"
                    value={expense.category}
                    isSearchable={false}
                    name="category"
                    styles={selectStyles}
                    isLoading={categoryIsFetching}
                    options={categories}
                    placeholder={"Select Category"}
                    onChange={(option) => {
                      handleExpenseInputChange(option, index, 'category');
                      if (errors.category && option?.value) {
                        const next = { ...errors };
                        delete next.category;
                        setErrors(next);
                      }
                    }}
                  />
                </InputGroup>
                {renderFieldErrors(index, "category")}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <InputGroup className={hasFieldError(index, "date") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="date" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Date</InputGroup.Text>
                  )}
                  <Form.Control
                    placeholder="Date"
                    aria-label="Date"
                    aria-describedby="date"
                    name="date"
                    type="date"
                    value={expense.date}
                    // style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
                {renderFieldErrors(index, "date")}
              </Col>
              <Col xs={12} md={6}>
                <InputGroup className={hasFieldError(index, "reference") ? "mb-1" : "mb-3"} size={"sm"}>
                  {showLabel && (
                    <InputGroup.Text id="reference" style={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main) }}>Reference</InputGroup.Text>
                  )}
                  <Form.Control
                    placeholder="Reference"
                    aria-label="Reference"
                    aria-describedby="reference"
                    name="reference"
                    type="text"
                    value={expense.reference}
                    // style={{ fontSize: inputFontSize }}
                    onChange={(e) => handleExpenseInputChange(e, index)}
                  />
                </InputGroup>
                {renderFieldErrors(index, "reference")}
              </Col>
            </Row>
            <Row>
              <Col xs={colXS} md={colMD}>
                <InputGroup className={hasFieldError(index, "attachment") ? "mb-1" : "mb-3"} size={"sm"}>
                  
                  <Form.Control
                    placeholder="Add Attachment"
                    aria-label="Add Attachment"
                    aria-describedby="attachment"
                    name="attachment"
                    type="file"
                    accept="image/*"
                    className="file-input-secondary"
                    style={{
                      backgroundColor: theme.palette.background.paper,
                      '--cms-secondary-bg': theme.palette.secondary.main,
                      '--cms-secondary-contrast': theme.palette.getContrastText(theme.palette.secondary.main),
                    }}
                    onChange={(e) => {
                      handleFileInputChange(e, index, "attachment");
                    }}
                  />
                </InputGroup>
                {/* Attachment preview for edit and selection */}
                {(expense.attachment || expense.attachment_preview_url) && (
                  <div style={{ marginTop: 4 }}>
                    {expense.attachment instanceof File ? (
                      expense.attachment_preview_url ? (
                        <img
                          src={expense.attachment_preview_url}
                          alt="Uploaded"
                          style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "10px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <small>Selected file: {expense.attachment.name}</small>
                      )
                    ) : (
                      typeof expense.attachment === "string" && expense.attachment.trim() ? (
                        isImageUrl(expense.attachment) ? (
                          <img
                            src={expense.attachment}
                            alt="Uploaded"
                            style={{
                              width: "200px",
                              height: "200px",
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <small>
                            Current attachment: {" "}
                            <a href={expense.attachment} target="_blank" rel="noopener noreferrer">View</a>
                          </small>
                        )
                      ) : null
                    )}
                  </div>
                )}
                {renderFieldErrors(index, "attachment")}
              </Col>
              {index > 0 && (
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
              )}
            </Row>
            {index < expenses.length - 1 && (
              <hr />
            )}
          </div>
        ))}
        </div>
        {/* Local footer actions (e.g., Quick Expense) via prop */}
        {footerActions && (
          <div
            className="sidebar-fixed-footer"
            style={{
              position: "sticky",
              bottom: 0,
              // No background or border for Quick Expense local footer
              backgroundColor: "transparent",
              borderTop: "none",
              padding: "12px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              zIndex: 2,
            }}
          >
            {footerActions}
          </div>
        )}
      </Form>
    </div>
  );
});

export default ExpenseFormSidebar;
