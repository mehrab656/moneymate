import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import axiosClient from "../../../axios-client.js";

/**
 * Sidebar-friendly Investment Plan Details
 * - Accepts `planId` or a `data` object
 */
export default function InvestmentPlanDetails({ planId = null, data = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(data || null);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    axiosClient
      .get(`/investment-plan/${planId}`)
      .then(({ data }) => {
        setPlan(data?.data || data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load plan details");
        setLoading(false);
      });
  }, [planId]);

  if (loading) {
    return (
      <Box p={3} display="flex" alignItems="center" justifyContent="center">
        Loading plan details...
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} color="error.main">
        {error}
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box p={3}>No plan data available.</Box>
    );
  }

  const purposes = Array.isArray(plan?.purposes)
    ? plan.purposes
    : (() => { try { return JSON.parse(plan?.purposes || '[]'); } catch { return []; } })();

  return (
    <Box p={3}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Investment Plan Details</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>Plan Name:</strong> {plan?.plan_name || "N/A"}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Plan Date:</strong> {plan?.plan_created_date || plan?.date || "N/A"}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Start Date:</strong> {plan?.plan_start_date || plan?.start_date || plan?.startDate || "N/A"}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>End Date:</strong> {plan?.plan_end_date || plan?.end_date || plan?.endDate || "N/A"}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Amount:</strong> {plan?.amount ?? "N/A"}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Return Amount:</strong> {plan?.return_amount ?? "N/A"}
      </div>
      {plan?.note && (
        <div style={{ marginBottom: 16 }}>
          <strong>Note:</strong> {plan?.note}
        </div>
      )}

      <h3 style={{ marginTop: 16, marginBottom: 8 }}>Purposes</h3>
      {purposes.length === 0 ? (
        <div>No purposes provided.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table table-bordered custom-table">
            <thead>
              <tr className="text-center">
                <th>Purpose</th>
                <th>Payment Terms</th>
                <th>Amount</th>
                <th>Refundable Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {purposes.map((p, idx) => (
                <tr key={idx} className="text-center">
                  <td>{p?.purpose ?? ""}</td>
                  <td>{p?.paymentTerms ?? ""}</td>
                  <td>{p?.amount ?? ""}</td>
                  <td>{p?.refundableAmount ?? ""}</td>
                  <td>{p?.remarks ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}
