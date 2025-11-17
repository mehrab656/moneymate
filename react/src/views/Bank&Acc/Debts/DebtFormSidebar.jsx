import React, { useEffect, useState, useContext } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import { TextField } from "@mui/material";
import DatePicker from "react-datepicker";
import axiosClient from "../../../axios-client.js";
import { notification } from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";

const initialDebt = {
  id: null,
  amount: "",
  person: "",
  date: null,
  note: "",
  account_id: null,
  type: null,
};

export default function DebtFormSidebar({ debtId = null }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [debt, setDebt] = useState(initialDebt);
  const [accounts, setAccounts] = useState([]);
  const [types] = useState([
    { value: "lend", label: "Lend (Give Loan to Others)" },
    { value: "borrow", label: "Borrow (Taken Loan From Others)" },
  ]);
  const { closeSidebar, updateSidebar } = useSidebarActions();

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
        date: data.date ? new Date(data.date) : null,
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
    e.preventDefault();
    setErrors(null);
    setLoading(true);
    try {
      if (!debtId) {
        // Create
        const formData = new FormData();
        formData.append("amount", debt.amount);
        formData.append("date", debt.date ? new Date(debt.date.getTime() - debt.date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : "");
        formData.append("person", debt.person);
        formData.append("account_id", debt.account_id);
        formData.append("note", debt.note);
        formData.append("type", debt.type);

        const { data } = await axiosClient.post("/debts/store", formData);
        notification(data.status || "success", data.message || "Debt created", data.description || "");
      } else {
        // Update: only person, date, note
        const payload = {
          person: debt.person,
          date: debt.date ? new Date(debt.date.getTime() - debt.date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
          note: debt.note,
        };
        const { data } = await axiosClient.post(`/debts/${debtId}`, payload);
        notification(data.status || "success", data.message || "Debt updated", data.description || "");
      }
      closeSidebar();
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
      <Form onSubmit={onSubmit}>
        <div className="mb-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <TextField
                label="Amount"
                type="number"
                size="small"
                fullWidth
                value={debt.amount}
                disabled={!!debtId}
                onChange={(e) => setDebt((d) => ({ ...d, amount: e.target.value }))}
              />
              {renderError("amount")}
            </Col>
            <Col xs={12} md={6}>
              <TextField
                label="Person"
                type="text"
                size="small"
                fullWidth
                value={debt.person}
                onChange={(e) => setDebt((d) => ({ ...d, person: e.target.value }))}
              />
              {renderError("person")}
            </Col>
          </Row>
        </div>

        <div className="mb-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <DatePicker
                selected={debt.date}
                onChange={(date) => setDebt((d) => ({ ...d, date }))}
                className="form-control"
                placeholderText="Select date"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
              {renderError("date")}
            </Col>
            <Col xs={12} md={6}>
              <TextField
                label="Note"
                type="text"
                size="small"
                fullWidth
                value={debt.note}
                onChange={(e) => setDebt((d) => ({ ...d, note: e.target.value }))}
              />
              {renderError("note")}
            </Col>
          </Row>
        </div>

        <div className="mb-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <Select
                className="basic-single"
                classNamePrefix="select"
                value={accounts.find((a) => a.value === debt.account_id) || null}
                isSearchable
                isDisabled={!!debtId}
                options={accounts}
                onChange={(opt) => setDebt((d) => ({ ...d, account_id: opt?.value }))}
                placeholder="Select Bank Account"
              />
              {renderError("account_id")}
            </Col>
            <Col xs={12} md={6}>
              <Select
                classNamePrefix="select"
                value={types.find((t) => t.value === debt.type) || null}
                isSearchable
                isDisabled={!!debtId}
                options={types}
                onChange={(opt) => setDebt((d) => ({ ...d, type: opt?.value }))}
                placeholder="Select Debt Type"
              />
              {renderError("type")}
            </Col>
          </Row>
        </div>

        <Row className="g-2">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
              <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                {debtId ? (loading ? "Updating..." : "Update Debt") : (loading ? "Saving..." : "Save")}
              </Button>
              <Button type="button" variant="outline-secondary" onClick={closeSidebar}>
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}