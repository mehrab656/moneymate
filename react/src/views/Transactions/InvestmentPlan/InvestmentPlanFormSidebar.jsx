import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar/index.js";
import axiosClient from "../../../axios-client.js";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";

/**
 * Sidebar form for creating/updating Investment Plans
 * - Mirrors existing InvestmentPlanForm fields, adapted for GlobalSidebar
 */
export default function InvestmentPlanFormSidebar({ planId = null, onSuccess = () => {} }) {
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

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    axiosClient
      .get(`/investment-plan/${planId}`)
      .then(({ data }) => {
        // Expecting shape similar to { id, plan_name, user_id, date, start_date, end_date, purposes }
        const d = data?.data || data;
        setPlan({
          id: d?.id || planId,
          plan_name: d?.plan_name || "",
          userId: d?.user_id || null,
          date: d?.date || "",
          startDate: d?.start_date || "",
          endDate: d?.end_date || "",
        });
        if (Array.isArray(d?.purposes) && d.purposes.length) {
          setTableData(
            d.purposes.map((p) => ({
              purpose: p?.purpose ?? "",
              paymentTerms: p?.paymentTerms ?? "",
              amount: p?.amount ?? "",
              refundableAmount: p?.refundableAmount ?? "",
              remarks: p?.remarks ?? "",
            }))
          );
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

  const handleSubmit = (e) => {
    e.preventDefault();
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

    const req = plan.id
      ? axiosClient.post(`/investment-plan/${plan.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : axiosClient.post(`/investments/add-new-plan`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    req
      .then(({ data }) => {
        notification("success", plan.id ? "Plan updated" : "Plan added", "");
        setLoading(false);
        onSuccess();
        closeSidebar();
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors || {});
        }
        notification("error", "Operation failed", response?.data?.message || "");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: 16 }}>
      <MainLoader loaderVisible={loading} />
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6} xs={12} className="mb-3">
            <Form.Label className="custom-form-label">Plan Name</Form.Label>
            <Form.Control
              className="custom-form-control"
              type="text"
              value={plan.plan_name || ""}
              onChange={(e) => setPlan({ ...plan, plan_name: e.target.value })}
              placeholder="Plan Name"
            />
          </Col>
          <Col md={6} xs={12} className="mb-3">
            <Form.Label className="custom-form-label">Plan Date</Form.Label>
            <Form.Control
              className="custom-form-control"
              type="date"
              value={plan.date || ""}
              onChange={(e) => setPlan({ ...plan, date: e.target.value })}
            />
          </Col>
          <Col md={6} xs={12} className="mb-3">
            <Form.Label className="custom-form-label">Start Date (Contract Period)</Form.Label>
            <Form.Control
              className="custom-form-control"
              type="date"
              value={plan.startDate || ""}
              onChange={(e) => setPlan({ ...plan, startDate: e.target.value })}
            />
          </Col>
          <Col md={6} xs={12} className="mb-3">
            <Form.Label className="custom-form-label">End Date (Contract Period)</Form.Label>
            <Form.Control
              className="custom-form-control"
              type="date"
              value={plan.endDate || ""}
              onChange={(e) => setPlan({ ...plan, endDate: e.target.value })}
            />
          </Col>
        </Row>

        <div className="mt-3">
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Payment Terms</th>
                <th>Amount</th>
                <th>Refundable Amount</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      type="text"
                      value={row.purpose}
                      onChange={(e) => handleInputChange(e, index, "purpose")}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={row.paymentTerms}
                      onChange={(e) => handleInputChange(e, index, "paymentTerms")}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleInputChange(e, index, "amount")}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={row.refundableAmount}
                      onChange={(e) => handleInputChange(e, index, "refundableAmount")}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={row.remarks}
                      onChange={(e) => handleInputChange(e, index, "remarks")}
                    />
                  </td>
                  <td>
                    <div className="d-grid gap-2 d-md-flex">
                      <Button variant="danger" size="sm" onClick={() => removeRow(index)}>
                        -
                      </Button>
                      <Button variant="info" size="sm" onClick={addRow}>
                        +
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mt-3 d-flex justify-content-end">
          <Button type="submit" className="btn-add">
            {plan.id ? "Update Plan" : "Add Plan"}
          </Button>
        </div>
      </Form>
    </div>
  );
}