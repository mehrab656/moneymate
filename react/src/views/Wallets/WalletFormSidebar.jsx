import React, { useState } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import axiosClient from "../../axios-client";
import { notification } from "../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

const _initialWallet = {
  name: "",
  balance: "",
};

export default function WalletFormSidebar({ onSuccess, formId: formIdProp = null, hideInternalFooter = false }) {
  const [formData, setFormData] = useState(_initialWallet);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const formId = formIdProp || "wallet-form-sidebar-form";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submit = async (event) => {
    event?.preventDefault?.();
    const submitter = event?.nativeEvent?.submitter;
    const action = submitter?.getAttribute?.("data-action") || submitter?.value || "";
    const addMore = action === "save";
    setLoading(true);
    setErrors({});
    try {
      const { data } = await axiosClient.post(`/wallets`, {
        name: formData.name,
        balance: formData.balance,
      });
      notification("success", data?.message || "Success", data?.description || "Wallet created.");
      if (addMore) {
        setFormData(_initialWallet);
      } else {
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

  return (
    <div className="p-3">
      <MainLoader loaderVisible={loading} />
      <Form id={formId} onSubmit={submit}>
        <div className="mb-4">
          <h5 className="mb-3">Add New Wallet</h5>
          <Row className="g-3">
            <Col xs={12} md={12}>
              <InputGroup className={errors.name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="name" style={inputGroupTextStyle}>Wallet Name *</InputGroup.Text>
                <Form.Control
                  aria-describedby="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {renderError("name")}
            </Col>

            <Col xs={12} md={12}>
              <InputGroup className={errors.balance ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="balance" style={inputGroupTextStyle}>Initial Balance *</InputGroup.Text>
                <Form.Control
                  aria-describedby="balance"
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {renderError("balance")}
            </Col>
          </Row>
        </div>

        {!hideInternalFooter && (
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
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
