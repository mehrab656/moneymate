import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import {
  useCreateInvestmentMutation,
  useGetSingleInvestmentDataQuery,
} from "../../../api/slices/investmentSlice.js";
import { useGetInvestorDataQuery } from "../../../api/slices/userSlice.js";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";
import Select from "react-select";

const _initialInvestment = {
  investor_id: "",
  account_id: "",
  amount: "",
  investment_date: "",
  note: "",
};

export default forwardRef(function InvestmentFormSidebar({ investmentId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [formData, setFormData] = useState(_initialInvestment);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createInvestment] = useCreateInvestmentMutation();
  const formId = formIdProp || "investment-form-sidebar-form";
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);

  // API calls
  const {
    data: getSingleInvestmentData,
    isFetching: singleInvestmentFetching,
    isError: singleInvestmentDataError,
  } = useGetSingleInvestmentDataQuery({ id: investmentId }, { skip: !investmentId });

  const {
    data: getInvestorData,
    isFetching: investorIsFetching,
  } = useGetInvestorDataQuery({ currentPage: "", pageSize: 100 });

  const {
    data: getBankData,
    isFetching: bankIsFetching,
  } = useGetBankDataQuery({ currentPage: "", pageSize: 100 });

  // Prefill on edit using resource shape and bank account list
  useEffect(() => {
    if (getSingleInvestmentData?.data && investmentId) {
      const inv = getSingleInvestmentData.data;
      // Try to match numeric account_id to slug from loaded bank accounts
      const matchedAccountSlug = bankAccounts.find(
        (a) => typeof inv?.account_id !== 'undefined' && a.account_id === inv.account_id
      )?.value;

      setFormData({
        investor_id: String(inv?.investor?.value ?? inv?.investor_slug ?? inv?.investor_id ?? ""),
        account_id: String(matchedAccountSlug ?? ""),
        amount: inv?.amount ?? "",
        investment_date: inv?.investment_date ?? "",
        note: inv?.note ?? "",
      });
    }
  }, [getSingleInvestmentData, investmentId, bankAccounts]);

  // Load investors
  useEffect(() => {
    if (getInvestorData?.data?.length > 0) {
      const list = getInvestorData.data.map(({ slug, full_name }) => ({
        value: slug,
        label: full_name,
      }));
      setInvestors(list);
    }
  }, [getInvestorData]);

  // Load bank accounts (id is slug; include numeric account_id for matching)
  useEffect(() => {
    if (getBankData?.data?.length > 0) {
      const accounts = getBankData.data.map(({ id, account_id, bank_name, account_number }) => ({
        value: String(id),
        account_id: account_id,
        label: `${bank_name} (${account_number})`,
      }));
      setBankAccounts(accounts);
    }
  }, [getBankData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const investmentSubmit = async (event, stay) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const _formData = new FormData();
    _formData.append("account_id", formData.account_id);
    _formData.append("amount", formData.amount);
    _formData.append("investor_id", formData.investor_id);
    _formData.append("note", formData.note);
    _formData.append("investment_date", formData.investment_date);

    const url = investmentId ? `/investment/${investmentId}` : `/investment/add`;

    try {
      const data = await createInvestment({ url, formData: _formData }).unwrap();
      notification("success", data?.message, data?.description);

      if (!stay) {
        onSuccess?.();
        closeSidebar();
      } else {
        setFormData(_initialInvestment);
      }
    } catch (err) {
      if (err.status === 406) {
        notification("error", err?.message || "Duplicate investment", err?.description || "");
      } else if (err.status === 422) {
        setErrors(err.errorData?.errors || {});
        notification("error", err?.message || "Validation error");
      } else {
        notification(
          "error",
          err?.message || "An error occurred",
          err?.description || "Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: () => {
      investmentSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      investmentSubmit({ preventDefault: () => {} }, false);
    },
  }));

  if (singleInvestmentFetching || investorIsFetching || bankIsFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="company-form-sidebar">
      <Form id={formId} onSubmit={(e) => investmentSubmit(e, true)}>
        <div>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup className={errors?.investor_id ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="investment_investor" style={inputGroupTextStyle}>Investor *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="investment_investor">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
                    value={
                      investors?.length
                        ? investors.find((opt) => opt.value === (formData?.investor_id || "")) || null
                        : null
                    }
                    onChange={(opt) => setFormData({ ...formData, investor_id: opt?.value || "" })}
                    options={investors}
                    placeholder={"Select Investor"}
                  />
                </div>
              </InputGroup>
              {errors?.investor_id && (<p className="error-message">{errors?.investor_id[0]}</p>)}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors?.account_id ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="investment_account" style={inputGroupTextStyle}>Bank Account *</InputGroup.Text>
                <div className="flex-grow-1" aria-describedby="investment_account">
                  <Select
                    classNamePrefix="select"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
                    value={
                      bankAccounts?.length
                        ? bankAccounts.find((opt) => String(opt.value) === String(formData?.account_id || "")) || null
                        : null
                    }
                    onChange={(opt) => setFormData({ ...formData, account_id: opt?.value || "" })}
                    options={bankAccounts}
                    placeholder={"Select Account"}
                  />
                </div>
              </InputGroup>
              {errors?.account_id && (<p className="error-message">{errors?.account_id[0]}</p>)}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors?.amount ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="investment_amount" style={inputGroupTextStyle}>Amount *</InputGroup.Text>
                <Form.Control
                  aria-describedby="investment_amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {errors?.amount && (<p className="error-message">{errors?.amount[0]}</p>)}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors?.investment_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="investment_date_lbl" style={inputGroupTextStyle}>Investment Date *</InputGroup.Text>
                <Form.Control
                  aria-describedby="investment_date_lbl"
                  type="date"
                  name="investment_date"
                  value={formData.investment_date}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {errors?.investment_date && (<p className="error-message">{errors?.investment_date[0]}</p>)}
            </Col>

            <Col xs={12}>
              <InputGroup className={errors?.note ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="investment_note" style={inputGroupTextStyle}>Note</InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={3}
                  aria-describedby="investment_note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors?.note && (<p className="error-message">{errors?.note[0]}</p>)}
            </Col>
          </Row>
        </div>

        {!hideInternalFooter && (
          <div className="form-actions">
            <div className="d-flex gap-2">
              {investmentId ? (
                <Button
                  variant="warning"
                  onClick={(e) => investmentSubmit(e, false)}
                  disabled={loading}
                  className="flex-fill"
                >
                  Update
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={(e) => investmentSubmit(e, true)}
                    disabled={loading}
                    className="flex-fill"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => investmentSubmit(e, false)}
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
})
