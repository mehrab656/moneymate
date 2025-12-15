import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Image } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

const EmployeeDetails = ({ employeeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { applicationSettings } = useContext(SettingsContext);
  const { default_currency } = applicationSettings || {};

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    axiosClient
      .get(`/employee/${employeeId}`)
      .then(({ data }) => setData(data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) {
    return <div className="text-center p-4">Loading employee details...</div>;
  }
  if (!data) {
    return <div className="text-center p-4">No employee data available</div>;
  }

  const labelStyle = {
    flex: "0 0 140px",
    fontWeight: 600,
    marginRight: 12,
    color: "#6c757d",
    whiteSpace: "normal",
  };

  const valueStyle = {
    flex: "1 1 auto",
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  const Stat = ({ label, value }) => (
    <div className="d-flex" style={{ marginBottom: 8, alignItems: "center", justifyContent: "space-between" }}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value ?? "N/A"}</span>
    </div>
  );

  const FieldRow = ({ label, value }) => (
    <Row className="mb-2" style={{ alignItems: "center" }}>
      <Col xs={6} style={{ color: "#6c757d", fontWeight: 600 }}>{label}</Col>
      <Col xs={6} style={{ textAlign: "right", fontWeight: 500 }}>{value ?? "N/A"}</Col>
    </Row>
  );

  const isImageUrl = (url) => {
    if (!url) return false;
    const u = String(url).toLowerCase();
    return u.endsWith(".png") || u.endsWith(".jpg") || u.endsWith(".jpeg") || u.endsWith(".gif") || u.startsWith("http");
  };

  const formatDate = (val) => {
    const s = String(val || "").trim();
    if (!s) return "N/A";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };
  const formatMoney = (val) => {
    const n = Number(val);
    if (!isFinite(n)) return "N/A";
    return `${default_currency || ""} ${n.toLocaleString()}`;
  };
  const formatText = (val) => {
    const s = String(val || "").trim();
    if (!s) return "N/A";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div
      className="p-3"
      style={{
        boxSizing: "border-box",
        overflowX: "hidden",
        maxWidth: "100%",
      }}
    >
      <Row className="g-3 mb-3 align-items-center">
        <Col xs={12} md={3} className="text-center">
          <Image
            src={data.avatar}
            roundedCircle
            style={{ height: "96px", width: "96px", maxWidth: "100%", objectFit: "cover" }}
          />
          <div className="mt-2" style={{ fontWeight: 700 }}>
            {data.first_name} {data.last_name}
          </div>
          <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>
            @{data.user_name}
          </div>
        </Col>
        <Col xs={12} md={9}>
          <div className="p-2 border rounded">
            <FieldRow label="Email" value={data.email} />
            <FieldRow label="Phone" value={data.phone} />
            <FieldRow label="Emergency Contact" value={data.emergency_contact} />
            <FieldRow label="Gender" value={formatText(data.gender)} />
            <FieldRow label="DOB" value={formatDate(data.dob)} />
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xs={12} md={6}>
          <div className="p-3 border rounded" style={{ height: "100%" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Employment</div>
            <FieldRow label="Joined" value={formatDate(data.joining_date)} />
            <FieldRow label="Designation" value={formatText(data.position)} />
            <FieldRow label="Role" value={data.role_id || "N/A"} />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="p-3 border rounded" style={{ height: "100%" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Compensation</div>
            <FieldRow label="Salary" value={formatMoney(data.basic_salary)} />
            <FieldRow label="Accommodation" value={formatMoney(data.accommodation_cost)} />
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} md={6}>
          <div className="p-3 border rounded">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Identity Copy</div>
            {data.id_copy ? (
              isImageUrl(data.id_copy) ? (
                <Image
                  src={data.id_copy}
                  style={{ width: "100%", maxWidth: "100%", height: "auto", borderRadius: 8, objectFit: "cover" }}
                />
              ) : (
                <a href={data.id_copy} target="_blank" rel="noopener noreferrer">
                  View Attachment
                </a>
              )
            ) : (
              <div style={{ color: "#6c757d" }}>Not provided</div>
            )}
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="p-3 border rounded">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Extras</div>
            <Stat label="Company" value={data.company_id} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDetails;
