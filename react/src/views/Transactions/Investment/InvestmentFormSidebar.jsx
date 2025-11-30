import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import {
  useCreateInvestmentMutation,
  useGetSingleInvestmentDataQuery,
} from "../../../api/slices/investmentSlice.js";
import { useGetInvestorDataQuery } from "../../../api/slices/userSlice.js";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";

const _initialInvestment = {
  investor_id: "",
  account_id: "",
  amount: "",
  investment_date: "",
  note: "",
};

export default function InvestmentFormSidebar({ investmentId = null, onSuccess }) {
  const [formData, setFormData] = useState(_initialInvestment);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const { closeSidebar } = useSidebarActions();
  const [createInvestment] = useCreateInvestmentMutation();

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
    <div className="p-3">
      <Form onSubmit={(e) => investmentSubmit(e, false)}>
        <div className="mb-4">
          <h5 className="mb-3">Investment Information</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="investor_id">
                <Form.Label>Investor *</Form.Label>
                <Form.Select
                  name="investor_id"
                  value={formData.investor_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Investor</option>
                  {investors.length > 0 ? (
                    investors.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>No investor found</option>
                  )}
                </Form.Select>
                {errors?.investor_id && (
                  <p className="error-message">{errors?.investor_id[0]}</p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="account_id">
                <Form.Label>Bank Account *</Form.Label>
                <Form.Select
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Account</option>
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((acc) => (
                      <option key={acc.value} value={acc.value}>
                        {acc.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>No account found</option>
                  )}
                </Form.Select>
                {errors?.account_id && (
                  <p className="error-message">{errors?.account_id[0]}</p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="amount">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
                {errors?.amount && (
                  <p className="error-message">{errors?.amount[0]}</p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="investment_date">
                <Form.Label>Investment Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="investment_date"
                  value={formData.investment_date}
                  onChange={handleInputChange}
                  required
                />
                {errors?.investment_date && (
                  <p className="error-message">{errors?.investment_date[0]}</p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3" controlId="note">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                />
                {errors?.note && (
                  <p className="error-message">{errors?.note[0]}</p>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>

        <Row className="g-2">
          <Col xs={12}>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
              {investmentId ? (
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Investment"}
                </Button>
              ) : (
                <>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Saving..." : "Add Investment"}
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    disabled={loading}
                    onClick={(e) => investmentSubmit(e, true)}
                  >
                    {loading ? "Saving..." : "Save & Add Another"}
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
