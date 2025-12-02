import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";

const _initialAccount = {
  id: null,
  bank_name_id: "",
  account_name: "",
  account_number: "",
  balance: "",
};

export default function AccountFormSidebar({ accountId = null, onSuccess }) {
  const [formData, setFormData] = useState(_initialAccount);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();

  // Load banks for select
  useEffect(() => {
    let isMounted = true;
    axiosClient
      .get("/all-bank")
      .then(({ data }) => {
        if (!isMounted) return;
        setBanks(data?.data || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Prefill on edit
  useEffect(() => {
    let isMounted = true;
    if (accountId) {
      setLoading(true);
      axiosClient
        .get(`/bank-account/${accountId}`)
        .then(({ data }) => {
          if (!isMounted) return;
          setFormData({
            id: data?.id ?? accountId,
            bank_name_id: data?.bank_name_id ?? "",
            account_name: data?.account_name ?? "",
            account_number: data?.account_number ?? "",
            balance: data?.balance ?? "",
          });
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          const resp = err?.response?.data;
          notification(
            "error",
            resp?.message || "Failed to load account",
            resp?.description || ""
          );
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [accountId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (accountId || formData.id) {
        const { data } = await axiosClient.put(
          `/bank-account/${accountId ?? formData.id}`,
          {
            bank_name_id: formData.bank_name_id,
            account_name: formData.account_name,
            account_number: formData.account_number,
            balance: formData.balance,
          }
        );
        notification("success", data?.message || "Success", data?.description || "Account updated.");
        onSuccess?.();
        closeSidebar();
      } else {
        const { data } = await axiosClient.post(`/bank-account/add`, {
          bank_name_id: formData.bank_name_id,
          account_name: formData.account_name,
          account_number: formData.account_number,
          balance: formData.balance,
        });
        notification("success", data?.message || "Success", data?.description || "Account created.");
        onSuccess?.();
        closeSidebar();
      }
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.errors) {
        setErrors(resp.errors);
      }
      notification("error", resp?.message || "Error", resp?.description || "Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors?.[field] ? (
      <p className="error-message mt-2">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</p>
    ) : null;

  if (loading && (accountId || formData.id) && formData.account_name === "") {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <Form onSubmit={submit}>
        <div className="mb-4">
          <h5 className="mb-3">{accountId ? "Update Bank Account" : "Add New Bank Account / Wallet"}</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="account_name">
                <Form.Label>Account Holder Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleInputChange}
                  required
                />
                {renderError("account_name")}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="bank_name_id">
                <Form.Label>Bank Name *</Form.Label>
                <Form.Select
                  name="bank_name_id"
                  value={formData.bank_name_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a bank</option>
                  {banks.length > 0 ? (
                    banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bank_name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No bank found</option>
                  )}
                </Form.Select>
                {renderError("bank_name_id")}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="account_number">
                <Form.Label>Account Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  required
                />
                {renderError("account_number")}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="balance">
                <Form.Label>Initial Balance *</Form.Label>
                <Form.Control
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  required
                />
                {renderError("balance")}
              </Form.Group>
            </Col>
          </Row>
        </div>

        <Row className="g-2">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
              <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                {loading ? (accountId ? "Updating..." : "Saving...") : (accountId ? "Update Account" : "Save")}
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