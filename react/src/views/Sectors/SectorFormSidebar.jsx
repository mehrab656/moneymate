import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Form, Button, Row, Col, Table, InputGroup } from "react-bootstrap";
import { notification } from "../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";
import {
  useCreateSectorMutation,
  useGetSingleSectorDataQuery,
} from "../../api/slices/sectorSlice.js";
import { useGetBankDataQuery } from "../../api/slices/bankSlice.js";

const _initialSector = {
  id: null,
  name: "",
  bank_account_id: "",
  contract_start_date: "",
  contract_end_date: "",
  contract_period: 6,
  el_premises_no: "",
  el_business_acc_no: "",
  el_acc_no: "",
  el_billing_date: "",
  el_note: "",
  internet_acc_no: "",
  internet_billing_date: "",
  int_note: "",
};

const _initialPayments = [
  { paymentNumber: "", paymentDate: "", amount: "" },
];

const _initialChannels = [
  { channel_name: "", reference_id: "", listing_date: "" },
];

export default forwardRef(function SectorFormSidebar({ sectorId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [formData, setFormData] = useState(_initialSector);
  const [payments, setPayments] = useState(_initialPayments);
  const [channels, setChannels] = useState(_initialChannels);
  const [categoryNames, setCategoryNames] = useState([""]); // simple list of names
  const [bankAccounts, setBankAccounts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { closeSidebar } = useSidebarActions();
  const formId = formIdProp || "sector-form-sidebar-form";
  const [createSector] = useCreateSectorMutation();
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);

  const {
    data: singleSectorData,
    isFetching: singleSectorFetching,
    isError: singleSectorError,
  } = useGetSingleSectorDataQuery({ id: sectorId }, { skip: !sectorId });

  const {
    data: bankData,
    isFetching: bankFetching,
    isError: bankError,
  } = useGetBankDataQuery({ currentPage: "", pageSize: 100 });

  useEffect(() => {
    if (bankData?.data) {
      setBankAccounts(bankData.data);
    }
  }, [bankData]);

  useEffect(() => {
    if (singleSectorData?.data) {
      const s = singleSectorData.data;
      setFormData({
        id: s.id,
        name: s.name || "",
        bank_account_id: s.bank_account_id || s.payment_account_id || (s.account?.value ?? ""),
        contract_start_date: s.contract_start_date || "",
        contract_end_date: s.contract_end_date || "",
        contract_period: s.contract_period ?? 6,
        el_premises_no: s.el_premises_no || "",
        el_business_acc_no: s.el_business_acc_no || "",
        el_acc_no: s.el_acc_no || "",
        el_billing_date: s.el_billing_date || "",
        el_note: s.el_note || "",
        internet_acc_no: s.internet_acc_no || "",
        internet_billing_date: s.internet_billing_date || "",
        int_note: s.int_note || "",
      });
      // Try to parse arrays if present
      try {
        const p = Array.isArray(s.payments)
          ? s.payments
          : s.payments
          ? JSON.parse(s.payments)
          : [];
        const cheque = (p || []).filter((x) => x.type === 'cheque');
        setPayments(
          cheque && cheque.length > 0
            ? cheque.map((x) => ({
                paymentNumber: x.payment_number || x.paymentNumber || "",
                paymentDate: x.date || x.paymentDate || "",
                amount: x.amount ?? "",
              }))
            : _initialPayments
        );
      } catch (e) {
        setPayments(_initialPayments);
      }
      try {
        const c = Array.isArray(s.channels)
          ? s.channels
          : s.channels
          ? JSON.parse(s.channels)
          : [];
        setChannels(
          c && c.length > 0
            ? c.map((x) => ({
                channel_name: x.channel_name || "",
                reference_id: x.reference_id || "",
                listing_date: x.listing_date || "",
              }))
            : _initialChannels
        );
      } catch (e) {
        setChannels(_initialChannels);
      }
      // category names might be a simple array; fall back to one input
      try {
        const cn = Array.isArray(s.categoryName)
          ? s.categoryName
          : s.categoryName
          ? JSON.parse(s.categoryName)
          : [];
        setCategoryNames(cn.length > 0 ? cn : [""]);
      } catch (e) {
        setCategoryNames([""]);
      }
    }
  }, [singleSectorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      }
      return next;
    });
  };

  const handlePaymentChange = (e, index) => {
    const { name, value } = e.target;
    const next = [...payments];
    next[index][name] = value;
    setPayments(next);
  };
  const addPaymentRow = () => setPayments([...payments, { paymentNumber: "", paymentDate: "", amount: "" }]);
  const removePaymentRow = (index) => {
    const next = [...payments];
    next.splice(index, 1);
    setPayments(next.length > 0 ? next : _initialPayments);
  };

  const handleChannelChange = (e, index) => {
    const { name, value } = e.target;
    const next = [...channels];
    next[index][name] = value;
    setChannels(next);
  };
  const addChannelRow = () => setChannels([...channels, { channel_name: "", reference_id: "", listing_date: "" }]);
  const removeChannelRow = (index) => {
    const next = [...channels];
    next.splice(index, 1);
    setChannels(next.length > 0 ? next : _initialChannels);
  };

  const handleCategoryNameChange = (value, index) => {
    const next = [...categoryNames];
    next[index] = value;
    setCategoryNames(next);
  };
  const addCategoryRow = () => setCategoryNames([...categoryNames, ""]);
  const removeCategoryRow = (index) => {
    const next = [...categoryNames];
    next.splice(index, 1);
    setCategoryNames(next.length > 0 ? next : [""]);
  };

  const sectorSubmit = async (e, stay = false) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    // Basic fields
    fd.append("name", formData.name);
    fd.append("bank_account_id", formData.bank_account_id);
    fd.append("contract_start_date", formData.contract_start_date);
    fd.append("contract_end_date", formData.contract_end_date);

    // Contract period
    fd.append("contract_period", formData.contract_period);

    // Electricity
    fd.append("el_premises_no", formData.el_premises_no);
    fd.append("el_business_acc_no", formData.el_business_acc_no);
    fd.append("el_acc_no", formData.el_acc_no);
    fd.append("el_billing_date", formData.el_billing_date);
    fd.append("el_note", formData.el_note);

    // Internet
    fd.append("internet_acc_no", formData.internet_acc_no);
    fd.append("internet_billing_date", formData.internet_billing_date);
    fd.append("int_note", formData.int_note);

    // Payments
    if (payments && payments.length > 0) {
      payments.forEach((p) => {
        fd.append("payment_amount[]", p.amount);
        fd.append("payment_date[]", p.paymentDate);
        fd.append("payment_number[]", p.paymentNumber);
      });
    }

    // Channels
    if (channels && channels.length > 0) {
      channels.forEach((c) => {
        fd.append("channel_name[]", c.channel_name);
        fd.append("reference_id[]", c.reference_id);
        fd.append("listing_date[]", c.listing_date);
      });
    }

    // Categories
    if (categoryNames && categoryNames.length > 0) {
      categoryNames.forEach((name) => {
        if (name && name.trim() !== "") {
          fd.append("category_name[]", name);
        }
      });
    }

    const url = sectorId ? `/sector/${sectorId}` : `/sector/add`;
    try {
      const data = await createSector({ url, formData: fd }).unwrap();
      notification("success", data?.message, data?.description);
      onSuccess && onSuccess();
      if (stay && !sectorId) {
        // Reset for create & add more
        setFormData(_initialSector);
        setPayments(_initialPayments);
        setChannels(_initialChannels);
        setCategoryNames([""]);
      } else {
        closeSidebar();
      }
    } catch (err) {
      const errs = err?.errorData?.errors || {};
      setErrors(errs);
      notification("error", err?.message || "Error", err?.description || "Please fix the errors and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Expose imperative methods for sticky footer actions (Save / Save and Exit)
  useImperativeHandle(ref, () => ({
    save: () => {
      // Programmatic submit that keeps the sidebar open
      sectorSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      // Programmatic submit that closes the sidebar
      sectorSubmit({ preventDefault: () => {} }, false);
    },
  }));

  if (singleSectorFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center sector-form-sidebar-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sector-form-sidebar">
      <Form id={formId} onSubmit={(e) => sectorSubmit(e, true)}>
        {/* Sector Information */}
        <div className="mb-4">
          <h5 className="mb-3">Sector Information</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup className={errors.name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="sector_name" style={inputGroupTextStyle}>Sector Name *</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Sector Name"
                  aria-describedby="sector_name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {errors.name && <p className="error-message">{errors.name[0]}</p>}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.bank_account_id ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="payment_account" style={inputGroupTextStyle}>Payment Account *</InputGroup.Text>
                <Form.Select
                  aria-label="Payment Account"
                  aria-describedby="payment_account"
                  name="bank_account_id"
                  value={formData.bank_account_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Account</option>
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((account) => (
                      <option key={account.slug || account.id} value={account.slug || account.id}>
                        {account.bank_name} - {account.account_number}
                      </option>
                    ))
                  ) : (
                    <option disabled>No account was found</option>
                  )}
                </Form.Select>
              </InputGroup>
              {errors.bank_account_id && (
                <p className="error-message">{errors.bank_account_id[0]}</p>
              )}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors.contract_start_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="contract_start_date" style={inputGroupTextStyle}>Contract Start Date *</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Contract Start Date"
                  aria-describedby="contract_start_date"
                  name="contract_start_date"
                  value={formData.contract_start_date}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {errors.contract_start_date && (
                <p className="error-message">{errors.contract_start_date[0]}</p>
              )}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.contract_end_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="contract_end_date" style={inputGroupTextStyle}>Contract End Date *</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Contract End Date"
                  aria-describedby="contract_end_date"
                  name="contract_end_date"
                  value={formData.contract_end_date}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {errors.contract_end_date && (
                <p className="error-message">{errors.contract_end_date[0]}</p>
              )}
            </Col>

            <Col xs={12} md={6}>
              <InputGroup className={errors.contract_period ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="contract_period" style={inputGroupTextStyle}>Contract Period (months) *</InputGroup.Text>
                <Form.Select
                  aria-label="Contract Period (months)"
                  aria-describedby="contract_period"
                  name="contract_period"
                  value={formData.contract_period}
                  onChange={handleInputChange}
                  required
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </Form.Select>
              </InputGroup>
              {errors.contract_period && (
                <p className="error-message">{errors.contract_period[0]}</p>
              )}
            </Col>
          </Row>
        </div>

        {/* Electricity & Internet */}
        <div className="mb-4">
          <h5 className="mb-3">Electricity & Internet</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup className={errors.el_premises_no ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="el_premises_no" style={inputGroupTextStyle}>Electricity Premises No</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Electricity Premises No"
                  aria-describedby="el_premises_no"
                  name="el_premises_no"
                  value={formData.el_premises_no}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.el_premises_no && (
                <p className="error-message">{errors.el_premises_no[0]}</p>
              )}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.el_business_acc_no ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="el_business_acc_no" style={inputGroupTextStyle}>Electricity Business Acc No</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Electricity Business Acc No"
                  aria-describedby="el_business_acc_no"
                  name="el_business_acc_no"
                  value={formData.el_business_acc_no}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.el_business_acc_no && (
                <p className="error-message">{errors.el_business_acc_no[0]}</p>
              )}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.el_acc_no ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="el_acc_no" style={inputGroupTextStyle}>Electricity Acc No</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Electricity Acc No"
                  aria-describedby="el_acc_no"
                  name="el_acc_no"
                  value={formData.el_acc_no}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.el_acc_no && (
                <p className="error-message">{errors.el_acc_no[0]}</p>
              )}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.el_billing_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="el_billing_date" style={inputGroupTextStyle}>Electricity Billing Date</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Electricity Billing Date"
                  aria-describedby="el_billing_date"
                  name="el_billing_date"
                  value={formData.el_billing_date}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.el_billing_date && (
                <p className="error-message">{errors.el_billing_date[0]}</p>
              )}
            </Col>
            <Col xs={12}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="el_note" style={inputGroupTextStyle}>Electricity Note</InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={2}
                  aria-label="Electricity Note"
                  aria-describedby="el_note"
                  name="el_note"
                  value={formData.el_note}
                  onChange={handleInputChange}
                  className="sector-form-sidebar-mobile-textarea"
                />
              </InputGroup>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col xs={12} md={6}>
              <InputGroup className={errors.internet_acc_no ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="internet_acc_no" style={inputGroupTextStyle}>Internet Account No</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Internet Account No"
                  aria-describedby="internet_acc_no"
                  name="internet_acc_no"
                  value={formData.internet_acc_no}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.internet_acc_no && (
                <p className="error-message">{errors.internet_acc_no[0]}</p>
              )}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.internet_billing_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="internet_billing_date" style={inputGroupTextStyle}>Internet Billing Date</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Internet Billing Date"
                  aria-describedby="internet_billing_date"
                  name="internet_billing_date"
                  value={formData.internet_billing_date}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.internet_billing_date && (
                <p className="error-message">{errors.internet_billing_date[0]}</p>
              )}
            </Col>
            <Col xs={12}>
              <InputGroup className="mb-3" size="sm">
                <InputGroup.Text id="int_note" style={inputGroupTextStyle}>Internet Note</InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={2}
                  aria-label="Internet Note"
                  aria-describedby="int_note"
                  name="int_note"
                  value={formData.int_note}
                  onChange={handleInputChange}
                  className="sector-form-sidebar-mobile-textarea"
                />
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* Payments */}
        <div className="mb-4">
            <h5 className="mb-3">Payment Schedule</h5>
            <div className="d-none d-lg-block sector-form-sidebar-desktop-container">
              <Table size="sm" bordered className="sector-form-sidebar-table">
                <thead>
                  <tr>
                    <th>Payment Number</th>
                    <th>Payment Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, index) => (
                    <tr key={`payment-${index}`}>
                      <td className="sector-form-sidebar-cell">
                        <Form.Control
                          type="text"
                          name="paymentNumber"
                          value={p.paymentNumber}
                          onChange={(e) => handlePaymentChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          name="paymentDate"
                          value={p.paymentDate}
                          onChange={(e) => handlePaymentChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          name="amount"
                          min={0}
                          value={p.amount}
                          onChange={(e) => handlePaymentChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button variant="primary" size="sm" onClick={addPaymentRow}>
                            +
                          </Button>
                          {index > 0 && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removePaymentRow(index)}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Mobile layout */}
            <div className="d-lg-none sector-form-sidebar-mobile-container">
              {payments.map((p, index) => (
                <div key={`payment-card-${index}`} className="sector-card p-3 border rounded sector-form-sidebar-card">
                  <Row className="sector-form-sidebar-card-row g-2">
                    <Col xs={12}>
                      <Form.Label>Payment #{index + 1}</Form.Label>
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        type="text"
                        name="paymentNumber"
                        value={p.paymentNumber}
                        onChange={(e) => handlePaymentChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="paymentDate"
                        value={p.paymentDate}
                        onChange={(e) => handlePaymentChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        name="amount"
                        min={0}
                        value={p.amount}
                        onChange={(e) => handlePaymentChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
                      <Button variant="primary" size="sm" onClick={addPaymentRow}>+</Button>
                      {index > 0 && (
                        <Button variant="danger" size="sm" onClick={() => removePaymentRow(index)}>-</Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            {errors?.payments && <p className="error-message mt-2">{errors?.payments[0]}</p>}
          </div>

        {/* Channels */}
        <div className="mb-4">
            <h5 className="mb-3">Listing Channels</h5>
            <div className="d-none d-lg-block sector-form-sidebar-desktop-container">
              <Table size="sm" bordered className="sector-form-sidebar-table">
                <thead>
                  <tr>
                    <th>Channel Name</th>
                    <th>Reference ID</th>
                    <th>Listing Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((c, index) => (
                    <tr key={`channel-${index}`}>
                      <td className="sector-form-sidebar-cell">
                        <Form.Control
                          type="text"
                          name="channel_name"
                          value={c.channel_name}
                          onChange={(e) => handleChannelChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="reference_id"
                          value={c.reference_id}
                          onChange={(e) => handleChannelChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          name="listing_date"
                          value={c.listing_date}
                          onChange={(e) => handleChannelChange(e, index)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button variant="primary" size="sm" onClick={addChannelRow}>
                            +
                          </Button>
                          {index > 0 && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeChannelRow(index)}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Mobile layout */}
            <div className="d-lg-none sector-form-sidebar-mobile-container">
              {channels.map((c, index) => (
                <div key={`channel-card-${index}`} className="sector-card p-3 border rounded sector-form-sidebar-card">
                  <Row className="sector-form-sidebar-card-row g-2">
                    <Col xs={12}>
                      <Form.Label>Channel #{index + 1}</Form.Label>
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        type="text"
                        name="channel_name"
                        value={c.channel_name}
                        onChange={(e) => handleChannelChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="text"
                        name="reference_id"
                        value={c.reference_id}
                        onChange={(e) => handleChannelChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="listing_date"
                        value={c.listing_date}
                        onChange={(e) => handleChannelChange(e, index)}
                        size="sm"
                      />
                    </Col>
                    <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
                      <Button variant="primary" size="sm" onClick={addChannelRow}>+</Button>
                      {index > 0 && (
                        <Button variant="danger" size="sm" onClick={() => removeChannelRow(index)}>-</Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            {errors?.channels && <p className="error-message mt-2">{errors?.channels[0]}</p>}
          </div>

        {/* Categories */}
        <div className="mb-4">
            <h5 className="mb-3">Default Categories</h5>
            {categoryNames.map((name, index) => (
              <Row key={`cat-${index}`} className="g-2 align-items-center mb-2">
                <Col xs={12} md={10}>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Rent"
                    value={name}
                    onChange={(e) => handleCategoryNameChange(e.target.value, index)}
                  />
                </Col>
                <Col xs={12} md={2} className="d-flex gap-2 justify-content-end">
                  <Button variant="primary" size="sm" onClick={addCategoryRow}>+</Button>
                  {index > 0 && (
                    <Button variant="danger" size="sm" onClick={() => removeCategoryRow(index)}>-</Button>
                  )}
                </Col>
              </Row>
            ))}
            {errors?.categories && <p className="error-message mt-2">{errors?.categories[0]}</p>}
          </div>

        {/* Submit Buttons (hidden when using sticky footer) */}
        {!hideInternalFooter && (
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {sectorId ? (
                  <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                    {loading ? "Updating..." : "Update Sector"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={(e) => sectorSubmit(e, true)}
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
              </div>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
});
