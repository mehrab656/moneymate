import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles } from "../../../styles/formThemeStyles.js";
import Select from "react-select";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import BankFormSidebar from "../Banks/BankFormSidebar.jsx";

const _initialAccount = {
  id: null,
  bank_name_id: "",
  account_name: "",
  account_number: "",
  balance: "",
};

export default function AccountFormSidebar({ accountId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false, initialData = null }) {
  const [formData, setFormData] = useState(_initialAccount);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { closeSidebar, showLargeContent } = useSidebarActions();
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const selectStyles = createSelectStyles(theme);
  const formId = formIdProp || "account-form-sidebar-form";

  useEffect(() => {
    if (initialData && !accountId) {
      setFormData({ ..._initialAccount, ...initialData });
    }
  }, [initialData, accountId]);

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

  const accountSubmit = async (event) => {
    event?.preventDefault?.();
    const submitter = event?.nativeEvent?.submitter;
    const action = submitter?.getAttribute?.('data-action') || submitter?.value || '';
    const addMore = action === 'save';
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
        if (addMore) {
          setFormData(_initialAccount);
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
      <MainLoader loaderVisible={loading} />
      <Form id={formId} onSubmit={accountSubmit}>
        <div className="mb-4">
          <h5 className="mb-3">{accountId ? "Update Bank Account" : "Add New Bank Account / Wallet"}</h5>
          <Row className="g-3">
            <Col xs={12} md={12}>
              <InputGroup className={errors.account_name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="account_name" style={inputGroupTextStyle}>Account Holder *</InputGroup.Text>
                <Form.Control
                  aria-describedby="account_name"
                  type="text"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {renderError("account_name")}
            </Col>
            <Col xs={12} md={12}>
              <InputGroup className={errors.bank_name_id ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="bank_name_id" style={inputGroupTextStyle}>Bank *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="bank_name_id">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    isSearchable={false}
                    value={
                      [{ value: "", label: "Select a bank" }]
                        .concat([{ value: "__ADD__", label: "Add New Bank" }])
                        .concat((banks || []).map((b) => ({ value: String(b.id), label: b.bank_name })))
                        .find((opt) => String(opt.value) === String(formData.bank_name_id || ""))
                        || null
                    }
                    options={
                      [{ value: "__ADD__", label: "Add New Bank" }]
                        .concat((banks || []).map((b) => ({ value: String(b.id), label: b.bank_name })))
                    }
                    placeholder={"Select a bank"}
                    onChange={(opt) => {
                      if (!opt) return;
                      if (opt.value === "__ADD__") {
                        const reopenAccountForm = () => {
                          const accFormId = "account-form-global-return";
                          showLargeContent(
                            accountId ? "Update Bank Account" : "Add New Bank Account",
                            <AccountFormSidebar
                              accountId={accountId ?? null}
                              formId={accFormId}
                              hideInternalFooter={true}
                              initialData={formData}
                              onSuccess={onSuccess}
                            />,
                            {
                              width: "xl",
                              footerActions: (
                                <SidebarFooterButtons
                                  actions={[
                                    { label: accountId ? "Update" : "Save", type: "submit", formId: accFormId, 'data-action': accountId ? 'save_exit' : 'save' },
                                    { label: "Save and Exit", type: "submit", formId: accFormId, 'data-action': 'save_exit' },
                                  ]}
                                />
                              )
                            }
                          );
                        };
                        const bankFormId = "bank-form-global-from-account";
                        showLargeContent(
                          "Add New Bank",
                          <BankFormSidebar
                            bankId={null}
                            formId={bankFormId}
                            hideInternalFooter={true}
                            onSuccess={() => {
                              axiosClient
                                .get("/all-bank")
                                .then(({ data }) => {
                                  const nextBanks = data?.data || [];
                                  setBanks(nextBanks);
                                })
                                .catch(() => {});
                              reopenAccountForm();
                            }}
                          />,
                          {
                            width: "xl",
                            footerActions: (
                              <SidebarFooterButtons
                                actions={[
                                  { label: "Save", type: "submit", formId: bankFormId, 'data-action': 'save' },
                                  { label: "Save and Exit", type: "submit", formId: bankFormId, 'data-action': 'save_exit' },
                                  { label: "Back to Account", type: "button", onClick: () => reopenAccountForm() },
                                ]}
                              />
                            )
                          }
                        );
                      } else {
                        setFormData({ ...formData, bank_name_id: opt.value });
                        if (errors.bank_name_id) {
                          const next = { ...errors };
                          delete next.bank_name_id;
                          setErrors(next);
                        }
                      }
                    }}
                  />
                </div>
              </InputGroup>
              {renderError("bank_name_id")}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors.account_number ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="account_number" style={inputGroupTextStyle}>Account No. *</InputGroup.Text>
                <Form.Control
                  aria-describedby="account_number"
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {renderError("account_number")}
            </Col>

            <Col xs={12} md={6}>
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
                {accountId ? (
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
