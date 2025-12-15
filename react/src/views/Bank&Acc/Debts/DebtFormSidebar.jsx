import React, { useEffect, useState, useContext } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import Select from "react-select";
import axiosClient from "../../../axios-client.js";
import { useDispatch } from "react-redux";
import { debtSlice } from "../../../api/slices/debtSlice.js";
import { notification } from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";

const initialDebt = {
  id: null,
  amount: "",
  person: "",
  date: "",
  note: "",
  account_id: null,
  type: null,
};

export default function DebtFormSidebar({ debtId = null, formId: formIdProp = null, hideInternalFooter = false }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [debt, setDebt] = useState(initialDebt);
  const [accounts, setAccounts] = useState([]);
  const [types] = useState([
    { value: "lend", label: "Lend (Give Loan to Others)" },
    { value: "borrow", label: "Borrow (Taken Loan From Others)" },
  ]);
  const { closeSidebar, updateSidebar } = useSidebarActions();
  const theme = useTheme();
  const selectStyles = createSelectStyles(theme);
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const companySelectStyles = {
    ...selectStyles,
    control: (base, state) => {
      const baseStyles = selectStyles.control(base, state);
      return {
        ...baseStyles,
        borderColor: theme.palette.divider,
        boxShadow: "none",
      };
    },
  };
  const formId = formIdProp || "debt-form-sidebar-form";

  const { data: getBankData } = useGetBankDataQuery({ currentPage: "", pageSize: 100 });

  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const modifiedAccounts = getBankData.data.map(({ id, bank_name, account_number }) => ({
        value: id,
        label: `${bank_name} (${account_number})`,
      }));
      setAccounts(modifiedAccounts);
    }
  }, [getBankData]);

  const loadDebtForEdit = async () => {
    if (!debtId) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/debts/${debtId}`);
      // Disable amount, account, type on edit (backend updates only person, date, note)
      setDebt({
        id: data.id,
        amount: data.amount,
        person: data.person || "",
        date: data.date || "",
        note: data.note || "",
        account_id: data.account_id,
        type: data.type,
      });
      updateSidebar({ title: `Edit ${data.type === 'borrow' ? 'Borrow' : 'Lend'} (ID: ${data.id})` });
    } catch (err) {
      notification("error", err?.message || "Failed to load debt", err?.description || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debtId) {
      loadDebtForEdit();
    } else {
      updateSidebar({ title: "Add New Debt" });
    }
  }, [debtId]);

  const renderError = (field) => (errors?.[field] ? <p className="error-message">{errors[field][0]}</p> : null);

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setErrors(null);
    setLoading(true);
    const submitter = e?.nativeEvent?.submitter;
    const action = submitter?.getAttribute?.('data-action') || submitter?.value || '';
    const addMore = action === 'save';
    try {
      if (!debtId) {
        // Create
        const formData = new FormData();
        formData.append("amount", debt.amount);
        formData.append("date", debt.date || "");
        formData.append("person", debt.person);
        formData.append("account_id", debt.account_id);
        formData.append("note", debt.note);
        formData.append("type", debt.type);

        const { data } = await axiosClient.post("/debts/store", formData);
        notification(data.status || "success", data.message || "Debt created", data.description || "");
        // Ensure the debts list refreshes immediately
        dispatch(debtSlice.util.invalidateTags(["debt"]));
        if (addMore) {
          setDebt(initialDebt);
          setErrors(null);
        }
      } else {
        // Update: only person, date, note
        const payload = {
          person: debt.person,
          date: debt.date || null,
          note: debt.note,
        };
        const { data } = await axiosClient.post(`/debts/${debtId}`, payload);
        notification(data.status || "success", data.message || "Debt updated", data.description || "");
        // Ensure the debts list refreshes immediately
        dispatch(debtSlice.util.invalidateTags(["debt"]));
      }
      if (debtId || !addMore) {
        closeSidebar();
      }
    } catch (error) {
      const response = error?.response;
      if (response?.data?.errors) {
        setErrors(response.data.errors);
      }
      notification("error", error?.message || "Error", error?.description || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <MainLoader loaderVisible={loading} />
      <Form id={formId} onSubmit={onSubmit}>
        <Row className="g-2">
          <Col xs={12} md={6}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_amount" style={inputGroupTextStyle}>Amount</InputGroup.Text>
              <Form.Control
                aria-describedby="debt_amount"
                type="number"
                size="sm"
                className="custom-form-control"
                placeholder="Amount"
                value={debt.amount}
                disabled={!!debtId}
                onChange={(e) => setDebt((d) => ({ ...d, amount: e.target.value }))}
              />
            </InputGroup>
            {renderError("amount")}
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_person" style={inputGroupTextStyle}>Person</InputGroup.Text>
              <Form.Control
                aria-describedby="debt_person"
                type="text"
                size="sm"
                className="custom-form-control"
                placeholder="Person"
                value={debt.person}
                onChange={(e) => setDebt((d) => ({ ...d, person: e.target.value }))}
              />
            </InputGroup>
            {renderError("person")}
          </Col>
        </Row>

        <Row className="g-2">
          <Col xs={12} md={12}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_date" style={inputGroupTextStyle}>Date</InputGroup.Text>
              <Form.Control
                aria-describedby="debt_date"
                type="date"
                size="sm"
                className="custom-form-control"
                value={debt.date || ""}
                onChange={(e) => setDebt((d) => ({ ...d, date: e.target.value }))}
              />
            </InputGroup>
            {renderError("date")}
          </Col>
          <Col xs={12} md={12}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_note" style={inputGroupTextStyle}>Note</InputGroup.Text>
              <Form.Control
                aria-describedby="debt_note"
                as="textarea"
                rows={3}
                size="sm"
                className="custom-form-control"
                placeholder="Note"
                value={debt.note}
                onChange={(e) => setDebt((d) => ({ ...d, note: e.target.value }))}
              />
            </InputGroup>
            {renderError("note")}
          </Col>
        </Row>

        <Row className="g-2">
          <Col xs={12} md={12}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_account_id" style={inputGroupTextStyle}>Bank Account</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  styles={companySelectStyles}
                  value={accounts.find((a) => a.value === debt.account_id) || null}
                  isSearchable
                  isDisabled={!!debtId}
                  options={accounts}
                  onChange={(opt) => setDebt((d) => ({ ...d, account_id: opt?.value }))}
                  placeholder="Select Bank Account"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </InputGroup>
            {renderError("account_id")}
          </Col>
          <Col xs={12} md={12}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="debt_type" style={inputGroupTextStyle}>Debt Type</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={companySelectStyles}
                  value={types.find((t) => t.value === debt.type) || null}
                  isSearchable
                  isDisabled={!!debtId}
                  options={types}
                  onChange={(opt) => setDebt((d) => ({ ...d, type: opt?.value }))}
                  placeholder="Select Debt Type"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </InputGroup>
            {renderError("type")}
          </Col>
        </Row>

        {!hideInternalFooter && (
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {debtId ? (
                  <Button
                    variant="warning"
                    type="submit"
                    data-action="save_exit"
                    disabled={loading}
                    className="flex-fill flex-sm-fill-0"
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      type="submit"
                      data-action="save"
                      disabled={loading}
                      className="flex-fill flex-sm-fill-0"
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      type="submit"
                      data-action="save_exit"
                      disabled={loading}
                    >
                      Save and Exit
                    </Button>
                  </>
                )}
                <Button type="button" variant="outline-secondary" onClick={closeSidebar}>
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
}
