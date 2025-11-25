import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axiosClient from "../../axios-client";
import { notification } from "../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";

const _initialWallet = {
  name: "",
  balance: "",
};

export default function WalletFormSidebar({ onSuccess }) {
  const [formData, setFormData] = useState(_initialWallet);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const { data } = await axiosClient.post(`/wallets`, {
        name: formData.name,
        balance: formData.balance,
      });
      notification("success", data?.message || "Success", data?.description || "Wallet created.");
      onSuccess?.();
      closeSidebar();
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

  return (
    <div className="p-3">
      <Form onSubmit={submit}>
        <div className="mb-4">
          <h5 className="mb-3">Add New Wallet</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Wallet Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {renderError("name")}
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
                {loading ? "Saving..." : "Save"}
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

