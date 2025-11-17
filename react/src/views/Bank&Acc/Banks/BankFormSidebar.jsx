import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";

const _initialBank = {
  bank_name: "",
};

export default function BankFormSidebar({ bankId = null, onSuccess }) {
  const [formData, setFormData] = useState(_initialBank);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();

  // Prefill on edit
  useEffect(() => {
    let isMounted = true;
    if (bankId) {
      setLoading(true);
      axiosClient
        .get(`/bank-names/${bankId}`)
        .then(({ data }) => {
          if (!isMounted) return;
          setFormData({ bank_name: data?.bank_name || "" });
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          notification(
            "error",
            err?.response?.data?.message || "Failed to load bank",
            err?.response?.data?.description || ""
          );
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bankId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const bankSubmit = async (event, addMore) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (bankId) {
        const { data } = await axiosClient.put(`/bank-names/${bankId}`, formData);
        notification("success", data?.message || "Success", data?.description || "Bank updated.");
        onSuccess?.();
        closeSidebar();
      } else {
        const { data } = await axiosClient.post(`/bank-names`, formData);
        notification("success", data?.message || "Success", data?.description || "Bank created.");
        if (addMore) {
          setFormData(_initialBank);
        } else {
          onSuccess?.();
          closeSidebar();
        }
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

  if (loading && bankId && formData.bank_name === "") {
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
      <Form onSubmit={(e) => bankSubmit(e, false)}>
        <div className="mb-4">
          <h5 className="mb-3">{bankId ? "Update Bank" : "Create Bank"}</h5>
          <Row className="g-3">
            <Col xs={12} md={12}>
              <Form.Group className="mb-3" controlId="bank_name">
                <Form.Label>Bank Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  required
                />
                {errors?.bank_name && (
                  <p className="error-message mt-2">{errors.bank_name[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>

        <Row className="g-2">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
              {bankId ? (
                <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                  {loading ? "Updating..." : "Update Bank"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline-primary"
                    onClick={(e) => bankSubmit(e, true)}
                    disabled={loading}
                    className="flex-fill flex-sm-fill-0"
                  >
                    {loading ? "Creating..." : "Create & Add More"}
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                    {loading ? "Creating..." : "Create & Close"}
                  </Button>
                </>
              )}
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