import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";

const _initialBank = {
  bank_name: "",
};

export default function BankFormSidebar({ bankId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }) {
  const [formData, setFormData] = useState(_initialBank);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const formId = formIdProp || "bank-form-sidebar-form";

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

  const bankSubmit = async (event, addMoreParam) => {
    event?.preventDefault?.();
    const submitter = event?.nativeEvent?.submitter;
    const action = submitter?.getAttribute?.('data-action') || submitter?.value || '';
    const addMore = typeof addMoreParam === "boolean" ? addMoreParam : action === 'save';
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
      <MainLoader loaderVisible={loading} />
      <Form id={formId} onSubmit={(e) => bankSubmit(e)}>
        <Row>
          <Col xs={12} md={12}>
            <InputGroup className={errors.bank_name ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="bank_name" style={inputGroupTextStyle}>Bank Name *</InputGroup.Text>
              <Form.Control
                aria-describedby="bank_name"
                type="text"
                name="bank_name"
                placeholder="Enter bank name"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </InputGroup>
            {errors?.bank_name && (
              <p className="error-message mt-2">{errors.bank_name[0]}</p>
            )}
          </Col>
        </Row>

        {!hideInternalFooter && (
          <div className="form-actions">
            <div className="d-flex gap-2">
              {bankId ? (
                <Button
                  variant="warning"
                  type="submit"
                  data-action="save_exit"
                  disabled={loading}
                  className="flex-fill"
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
                    className="flex-fill"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    type="submit"
                    data-action="save_exit"
                    disabled={loading}
                    className="flex-fill"
                  >
                    Save and Exit
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}
