import React, { useEffect, useState, useContext, useRef, useImperativeHandle, forwardRef } from "react";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { Col, Form, Row, Button, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import {
  useCreateIncomeMutation,
  useGetSingleIncomeDataQuery,
} from "../../../api/slices/incomeSlice.js";
import { isImageUrl } from "../../../helper/media.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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

const _initialIncome = () => ({
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
  attachment_preview_url: "",
  account: null,
  category: null,
});

export const INCOME_FORM_ID = "income-form-sidebar-form";

const IncomeFormSidebar = forwardRef(function IncomeFormSidebar({
  incomeId,
  onSuccess,
  showLabel = "true",
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12,
  footerActions = null,
  formId: formIdProp = null,
}, ref) {
  const [incomes, setIncomes] = useState([_initialIncome()]);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const { closeSidebar } = useSidebarActions();
  const { themeMode } = useContext(SettingsContext);
  const formRef = useRef(null);
  const formId = formIdProp || INCOME_FORM_ID;

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
    container: (base) => ({
      ...base,
      width: "100%",
      flex: 1,
      minWidth: 0,
    }),
    control: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      minHeight: 38,
      backgroundColor: isDark ? "#1c1f24" : "#fff",
      borderColor: isDark
        ? state.isFocused ? "#4a515b" : "#3a4048"
        : state.isFocused ? "#7aa2d2" : "#c5ccd6",
      boxShadow: "none",
      ":hover": {
        borderColor: isDark ? "#4a515b" : "#7aa2d2",
      },
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
    menuList: (base) => ({
      ...base,
      backgroundColor: isDark ? "#23262b" : "#fff",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      backgroundColor: isDark
        ? state.isSelected
          ? "#0C1A28"
          : state.isFocused
            ? "#2d3238"
            : "#23262b"
        : state.isSelected
          ? "#e7f0fb"
          : state.isFocused
            ? "#f2f2f2"
            : "#fff",
    }),
    // Ensure dropdown is above sticky footer
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Helpers to render/track errors per row like Expense form
  const errorMarginTop = 2;
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
      // Support single or multiple incomes from server
      const payload = getSingleIncomeData.data;
      const rows = Array.isArray(payload) ? payload : [payload];
      setIncomes(rows);
    }
  }, [incomeId, getSingleIncomeData, getBankData, getCategoryListData]);

  // Do NOT set automatic default date in create mode; user must choose
  // Keep date empty unless editing an existing record

  const addIncomes = () => {
    setIncomes([...incomes, _initialIncome()]);
  };

  const removeIncomes = (index) => {
    const updated = incomes.map((row) => ({ ...row }));
    const prevUrl = updated[index]?.attachment_preview_url;
    if (prevUrl) {
      try { URL.revokeObjectURL(prevUrl); } catch {}
    }
    updated.splice(index, 1);
    setIncomes(updated);
  };

  const handleIncomeInputChange = (e, index, fieldName) => {
    const updatedRows = incomes.map((row) => ({ ...row }));
    if (e && e.target) {
      const { name, value } = e.target;
      updatedRows[index][name] = value;
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
        if (next[name]) delete next[name];
        return next;
      });
    } else {
      const name = fieldName;
      const option = e;
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
      updatedRows[index][name] = normalized;
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
        if (next[name]) delete next[name];
        return next;
      });
    }
    setIncomes(updatedRows);
  };

  const handleFileInputChange = (event, index, name) => {
    const file = event.target.files[0];
    const updatedRows = incomes.map((row) => ({ ...row }));
    const prevUrl = updatedRows[index]?.attachment_preview_url;
    if (prevUrl) {
      try { URL.revokeObjectURL(prevUrl); } catch {}
    }
    updatedRows[index][name] = file || "";
    updatedRows[index].attachment_preview_url = file ? URL.createObjectURL(file) : "";
    setIncomes(updatedRows);

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

  const submitIncome = async (event, stay = false) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    // Minimal client-side validation for first row (others handled server-side)
    const first = incomes[0] || {};
    if (!first?.account?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, account: ["Account is required."] }));
      notification("error", "Account required", "Please select an account.");
      return;
    }
    if (!first?.category?.value) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, category: ["Category is required."] }));
      notification("error", "Category required", "Please select a category.");
      return;
    }
    if (!first?.amount || Number(first.amount) <= 0) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, amount: ["Enter a positive amount."] }));
      notification("error", "Amount invalid", "Please enter a valid amount.");
      return;
    }

    const formData = new FormData();
    // Keep JSON payload unchanged in shape but EXCLUDE attachment field
    const jsonIncomes = incomes.map((inc) => {
      const out = { ...inc };
      if ("attachment" in out) delete out.attachment;
      return out;
    });
    formData.append("incomes", JSON.stringify(jsonIncomes));
    // Append files so they serialize correctly alongside JSON
    incomes.forEach((inc, idx) => {
      if (inc.attachment instanceof File) {
        formData.append(`attachments_${idx}`, inc.attachment);
      }
    });

    const url = incomeId ? `/income/${incomeId}` : "/income/add";
    try {
      const data = await createIncome({ url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (stay) {
        // Revoke any object URLs before resetting
        try {
          incomes.forEach((inc) => {
            if (inc?.attachment_preview_url) URL.revokeObjectURL(inc.attachment_preview_url);
          });
        } catch {}
        try { formRef.current?.reset(); } catch {}
        setIncomes([_initialIncome()]);
        setErrors({});
      } else {
        onSuccess?.();
        closeSidebar();
      }
    } catch (err) {
      const payload = err?.errorData;
      let serverErrors = null;
      if (payload && typeof payload === "object") {
        if (payload.errors && typeof payload.errors === "object") serverErrors = payload.errors;
        else serverErrors = payload;
      }
      if (serverErrors && typeof serverErrors === "object") setErrors(serverErrors);
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Expose imperative API for parent to trigger internal actions
  useImperativeHandle(ref, () => ({
    addIncomes,
  }));

  return (
    <div className="px-2" style={{ fontSize: "0.875rem", overflowX: "hidden" }}>
      <MainLoader loaderVisible={loading} />
      {sidebarTitle && <h6>{sidebarTitle ? sidebarTitle : ""}</h6>}
      <WizCard className="animated fadeInDown">
        <Form ref={formRef} id={formId} onSubmit={(e) => submitIncome(e, Boolean(footerActions))}>
          <div>
            {incomes.map((income, index) => (
              <div key={`income-row-${index}`}>
                <Row>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className="mb-3" size="sm">
                      {showLabel && <InputGroup.Text>Description</InputGroup.Text>}
                      <Form.Control
                        as="textarea"
                        aria-label="Description"
                        placeholder={"Description"}
                        value={income.description ?? ""}
                        name="description"
                        style={{ fontSize: inputFontSize }}
                        onChange={(e) => handleIncomeInputChange(e, index)}
                      />
                    </InputGroup>
                    {renderFieldErrors(index, "description")}
                  </Col>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className="mb-3" size="sm">
                      {showLabel && <InputGroup.Text>Note</InputGroup.Text>}
                      <Form.Control
                        as="textarea"
                        aria-label="Note"
                        placeholder={"Note"}
                        value={income.note ?? ""}
                        name="note"
                        style={{ fontSize: inputFontSize }}
                        onChange={(e) => handleIncomeInputChange(e, index)}
                      />
                    </InputGroup>
                    {renderFieldErrors(index, "note")}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6} sm={12}>
                    <InputGroup className={hasFieldError(index, "amount") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="amount">Amount</InputGroup.Text>}
                      <Form.Control
                        placeholder="Income Amount"
                        aria-label="Income Amount"
                        aria-describedby="amount"
                        name={"amount"}
                        type="number"
                        value={income.amount}
                        onChange={(e) => handleIncomeInputChange(e, index)}
                      />
                    </InputGroup>
                    {renderFieldErrors(index, "amount")}
                  </Col>
                  <Col xs={12} md={6} sm={12}>
                    <InputGroup className={hasFieldError(index, "date") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="date">Date</InputGroup.Text>}
                      <Form.Control
                        placeholder="Date"
                        aria-label="Date"
                        aria-describedby="date"
                        name="date"
                        type="date"
                        value={income.date}
                        onChange={(e) => handleIncomeInputChange(e, index)}
                      />
                    </InputGroup>
                    {renderFieldErrors(index, "date")}
                  </Col>
                </Row>
                <Row>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className={hasFieldError(index, "account") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="account">Bank Account</InputGroup.Text>}
                      <div style={{ flex: 1 }}>
                        <Select
                          classNamePrefix="select"
                          value={income.account}
                          isSearchable
                          name="account"
                          options={accounts}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={"Select account"}
                          onChange={(e) => handleIncomeInputChange(e, index, "account")}
                        />
                      </div>
                    </InputGroup>
                    {renderFieldErrors(index, "account")}
                  </Col>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className={hasFieldError(index, "category") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="category_id">Category</InputGroup.Text>}
                      <div style={{ flex: 1 }}>
                        <Select
                          classNamePrefix="select"
                          value={income.category}
                          isSearchable
                          name="category"
                          isLoading={categoryIsFetching}
                          options={categories}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={"Select Category"}
                          onChange={(e) => handleIncomeInputChange(e, index, "category")}
                        />
                      </div>
                    </InputGroup>
                    {renderFieldErrors(index, "category")}
                  </Col>
                </Row>
                <Row>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className={hasFieldError(index, "reference") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="reference">Reference</InputGroup.Text>}
                      <div style={{ flex: 1 }}>
                        <Select
                          classNamePrefix="select"
                          value={income.reference}
                          isSearchable
                          name="reference"
                          options={defaultReference}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={"Select Reference"}
                          onChange={(e) => handleIncomeInputChange(e, index, "reference")}
                        />
                      </div>
                    </InputGroup>
                    {renderFieldErrors(index, "reference")}
                  </Col>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className={hasFieldError(index, "income_type") ? "mb-1" : "mb-3"} size="sm">
                      {showLabel && <InputGroup.Text id="income_type">Income Type</InputGroup.Text>}
                      <div style={{ flex: 1 }}>
                        <Select
                          classNamePrefix="select"
                          value={income.income_type}
                          isSearchable
                          name="income_type"
                          options={defaultIncomeType}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={"Select Income Type"}
                          onChange={(e) => handleIncomeInputChange(e, index, "income_type")}
                        />
                      </div>
                    </InputGroup>
                    {renderFieldErrors(index, "income_type")}
                  </Col>
                </Row>

                {(income?.income_type?.value ?? "") === "reservation" && (
                  <Row>
                    <Col xs={colXS} md={colMD} sm={colSM}>
                      <InputGroup className={hasFieldError(index, "checkin_date") ? "mb-1" : "mb-3"} size="sm">
                        {showLabel && <InputGroup.Text id="checkin_date">Check-in Date</InputGroup.Text>}
                        <Form.Control
                          placeholder="Check-in Date"
                          aria-label="Check-in Date"
                          aria-describedby="checkin_date"
                          name="checkin_date"
                          type="date"
                          value={income.checkin_date}
                          onChange={(e) => handleIncomeInputChange(e, index)}
                        />
                      </InputGroup>
                      {renderFieldErrors(index, "checkin_date")}
                    </Col>
                    <Col xs={colXS} md={colMD} sm={colSM}>
                      <InputGroup className={hasFieldError(index, "checkout_date") ? "mb-1" : "mb-3"} size="sm">
                        {showLabel && <InputGroup.Text id="checkout_date">Check-out Date</InputGroup.Text>}
                        <Form.Control
                          placeholder="Check-out Date"
                          aria-label="Check-out Date"
                          aria-describedby="checkout_date"
                          name="checkout_date"
                          type="date"
                          value={income.checkout_date}
                          onChange={(e) => handleIncomeInputChange(e, index)}
                        />
                      </InputGroup>
                      {renderFieldErrors(index, "checkout_date")}
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col xs={colXS} md={colMD} sm={colSM}>
                    <InputGroup className={hasFieldError(index, "attachment") ? "mb-1" : "mb-3"} size="sm">
                      <Form.Control
                        placeholder="Add Attachment"
                        aria-label="Add Attachment"
                        name="attachment"
                        type="file"
                        onChange={(e) => handleFileInputChange(e, index, "attachment")}
                        style={{ fontSize: inputFontSize }}
                      />
                    </InputGroup>
                    {renderFieldErrors(index, "attachment")}
                    {(income.attachment || income.attachment_preview_url) && (
                      <div style={{ marginTop: 4 }}>
                        {income.attachment instanceof File ? (
                          income.attachment_preview_url ? (
                            <img
                              src={income.attachment_preview_url}
                              alt="Uploaded"
                              style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "10px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <small>Selected file: {income.attachment.name}</small>
                          )
                        ) : (
                          typeof income.attachment === "string" && income.attachment.trim() ? (
                            isImageUrl(income.attachment) ? (
                              <img
                                src={income.attachment}
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
                                <a href={income.attachment} target="_blank" rel="noopener noreferrer">View</a>
                              </small>
                            )
                          ) : null
                        )}
                      </div>
                    )}
                  </Col>
                  {index > 0 && (
                    <Col xs={colXS} md={colMD}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeIncomes(index)}
                        className="flex-shrink-0 float-end"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Col>
                  )}
                </Row>
                {index < incomes.length - 1 && (<hr />)}
              </div>
            ))}
          </div>

          {footerActions && (
            <div
              className="sidebar-fixed-footer"
              style={{
                position: "sticky",
                bottom: 0,
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
      </WizCard>
    </div>
  );
});

export default IncomeFormSidebar;
