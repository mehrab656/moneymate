import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Form, Row, Col, Button, Table, InputGroup } from "react-bootstrap";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar/index.js";
import axiosClient from "../../../axios-client.js";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";

/**
 * Sidebar form for creating/updating Investment Plans
 * - Mirrors existing InvestmentPlanForm fields, adapted for GlobalSidebar
 */
export default forwardRef(function InvestmentPlanFormSidebar({ planId = null, onSuccess = () => {}, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const { closeSidebar } = useSidebarActions();
  const { user } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState({
    id: planId || null,
    plan_name: "",
    userId: null,
    date: "",
    startDate: "",
    endDate: "",
  });
  const formId = formIdProp || "investment-plan-form-sidebar-form";

  const [tableData, setTableData] = useState([
    { purpose: "", paymentTerms: "", amount: "", refundableAmount: "", remarks: "" },
  ]);

  useEffect(() => {
    // Initialize default dates if empty
    if (!plan.date || !plan.startDate) {
      const today = new Date().toISOString().split("T")[0];
      setPlan((p) => ({ ...p, date: p.date || today, startDate: p.startDate || today }));
    }
    if (!plan.userId && user?.id) {
      setPlan((p) => ({ ...p, userId: user.id }));
    }
  }, [plan.date, plan.startDate]);

  // Load existing plan for editing
  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    axiosClient.get(`/investment-plan/${planId}`)
      .then(({ data }) => {
        const p = data?.data || data;
        setPlan({
          id: p?.id,
          plan_name: p?.plan_name || "",
          date: p?.plan_created_date || p?.date || "",
          startDate: p?.plan_start_date || p?.start_date || "",
          endDate: p?.plan_end_date || p?.end_date || "",
          userId: p?.user_id || user?.id || null,
        });

        // Load purposes if present
        let purposes = [];
        if (Array.isArray(p?.purposes)) {
          purposes = p.purposes;
        } else if (p?.purposes) {
          try { purposes = JSON.parse(p.purposes); } catch {}
        }
        if (purposes && purposes.length) {
          setTableData(purposes.map(x => ({
            purpose: x?.purpose || "",
            paymentTerms: x?.paymentTerms || "",
            amount: x?.amount || "",
            refundableAmount: x?.refundableAmount || "",
            remarks: x?.remarks || "",
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [planId]);

  const addRow = () => {
    setTableData((rows) => [
      ...rows,
      { purpose: "", paymentTerms: "", amount: "", refundableAmount: "", remarks: "" },
    ]);
  };

  const removeRow = (index) => {
    setTableData((rows) => rows.filter((_, i) => i !== index));
  };

  const handleInputChange = (event, index, key) => {
    const value = event.target.value;
    setTableData((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const planSubmit = async (e, stay = false) => {
    e?.preventDefault?.();
    setLoading(true);

    const formData = new FormData();
    if (plan.userId) formData.append("user_id", plan.userId);
    if (plan.plan_name) formData.append("plan_name", plan.plan_name);
    if (plan.date) formData.append("date", plan.date);
    if (plan.startDate) formData.append("start_date", plan.startDate);
    if (plan.endDate) formData.append("end_date", plan.endDate);

    // Serialize purposes array; backend previously received raw array in FormData
    // To maintain compatibility, send JSON string in a single field 'purposes'
    formData.append("purposes", JSON.stringify(tableData));

    try {
      const req = plan.id
        ? axiosClient.post(`/investment-plan/${plan.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
        : axiosClient.post(`/investments/add-new-plan`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { data } = await req;
      notification("success", plan.id ? "Plan updated" : "Plan added", "");
      onSuccess && onSuccess();
      if (stay && !plan.id) {
        // Reset for create & add more
        setPlan({ id: null, plan_name: "", userId: user?.id || null, date: plan.date, startDate: plan.startDate, endDate: plan.endDate });
        setTableData([{ purpose: "", paymentTerms: "", amount: "", refundableAmount: "", remarks: "" }]);
      } else {
        closeSidebar();
      }
    } catch (err) {
      const response = err?.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors || {});
      }
      notification("error", "Operation failed", response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  // Expose imperative methods for sticky footer actions
  useImperativeHandle(ref, () => ({
    save: () => {
      // keep sidebar open for create & add more
      planSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      // close sidebar after save
      planSubmit({ preventDefault: () => {} }, false);
    },
  }));

  return (
    <div style={{ padding: 16 }}>
      <MainLoader loaderVisible={loading} />
      <Form id={formId} onSubmit={(e) => planSubmit(e, true)}>
        <div className="mb-4">
          <h5 className="mb-3">Plan Information</h5>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <InputGroup className={errors.plan_name ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="plan_name_label">Plan Name *</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Plan Name"
                  aria-describedby="plan_name_label"
                  value={plan.plan_name || ""}
                  onChange={(e) => setPlan({ ...plan, plan_name: e.target.value })}
                  required
                />
              </InputGroup>
              {errors?.plan_name && <p className="error-message">{errors?.plan_name[0]}</p>}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="plan_date_label">Plan Date *</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Plan Date"
                  aria-describedby="plan_date_label"
                  value={plan.date || ""}
                  onChange={(e) => setPlan({ ...plan, date: e.target.value })}
                  required
                />
              </InputGroup>
              {errors?.date && <p className="error-message">{errors?.date[0]}</p>}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.start_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="start_date_label">Contract Start *</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Contract Start"
                  aria-describedby="start_date_label"
                  value={plan.startDate || ""}
                  onChange={(e) => setPlan({ ...plan, startDate: e.target.value })}
                  required
                />
              </InputGroup>
              {errors?.start_date && <p className="error-message">{errors?.start_date[0]}</p>}
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className={errors.end_date ? "mb-1" : "mb-3"} size="sm">
                <InputGroup.Text id="end_date_label">Contract End *</InputGroup.Text>
                <Form.Control
                  type="date"
                  aria-label="Contract End"
                  aria-describedby="end_date_label"
                  value={plan.endDate || ""}
                  onChange={(e) => setPlan({ ...plan, endDate: e.target.value })}
                  required
                />
              </InputGroup>
              {errors?.end_date && <p className="error-message">{errors?.end_date[0]}</p>}
            </Col>
          </Row>
        </div>

        <div className="mb-4">
          <h5 className="mb-3">Plan Purposes</h5>
          {/* Desktop layout */}
          <div className="d-none d-lg-block sector-form-sidebar-desktop-container">
            <Table size="sm" bordered className="sector-form-sidebar-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Payment Terms</th>
                  <th>Amount</th>
                  <th>Refundable Amount</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={`purpose-${index}`}>
                    <td className="sector-form-sidebar-cell">
                      <Form.Control
                        type="text"
                        value={row.purpose}
                        onChange={(e) => handleInputChange(e, index, "purpose")}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={row.paymentTerms}
                        onChange={(e) => handleInputChange(e, index, "paymentTerms")}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleInputChange(e, index, "amount")}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.refundableAmount}
                        onChange={(e) => handleInputChange(e, index, "refundableAmount")}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleInputChange(e, index, "remarks")}
                        size="sm"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <Button variant="primary" size="sm" onClick={addRow}>+</Button>
                        {index > 0 && (
                          <Button variant="danger" size="sm" onClick={() => removeRow(index)}>-</Button>
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
            {tableData.map((row, index) => (
              <div key={`purpose-card-${index}`} className="sector-card p-3 border rounded sector-form-sidebar-card">
                <Row className="sector-form-sidebar-card-row g-2">
                  <Col xs={12}>
                    <Form.Label>Purpose #{index + 1}</Form.Label>
                  </Col>
                  <Col xs={12}>
                    <Form.Control
                      type="text"
                      value={row.purpose}
                      onChange={(e) => handleInputChange(e, index, "purpose")}
                      size="sm"
                    />
                  </Col>
                  <Col xs={12}>
                    <Form.Control
                      type="text"
                      value={row.paymentTerms}
                      onChange={(e) => handleInputChange(e, index, "paymentTerms")}
                      size="sm"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleInputChange(e, index, "amount")}
                      size="sm"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      value={row.refundableAmount}
                      onChange={(e) => handleInputChange(e, index, "refundableAmount")}
                      size="sm"
                    />
                  </Col>
                  <Col xs={12}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={row.remarks}
                      onChange={(e) => handleInputChange(e, index, "remarks")}
                      size="sm"
                      className="sector-form-sidebar-mobile-textarea"
                    />
                  </Col>
                  <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
                    <Button variant="primary" size="sm" onClick={addRow}>+</Button>
                    {index > 0 && (
                      <Button variant="danger" size="sm" onClick={() => removeRow(index)}>-</Button>
                    )}
                  </Col>
                </Row>
              </div>
            ))}
          </div>
          {errors?.purposes && <p className="error-message mt-2">{errors?.purposes[0]}</p>}
        </div>
        {!hideInternalFooter && (
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                {plan.id ? (
                  <Button variant="primary" type="submit" disabled={loading} className="flex-fill flex-sm-fill-0">
                    {loading ? "Updating..." : "Update Plan"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={(e) => planSubmit(e, true)}
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
