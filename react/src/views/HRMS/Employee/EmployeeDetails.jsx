import React, { useEffect, useState } from "react";
import { Row, Col, Image, Table } from "react-bootstrap";
import axiosClient from "../../../axios-client";

const EmployeeDetails = ({ employeeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-3" style={{ boxSizing: 'border-box' }}>
      <Row className="g-3 mb-3 align-items-center">
        <Col xs={12} md={3} className="text-center">
          <Image src={data.avatar} roundedCircle style={{ height: "80px", width: "80px", maxWidth: '100%' }} />
        </Col>
        <Col xs={12} md={9}>
          <div className="d-flex flex-column gap-1">
            <div>
              <strong>Name:</strong> {data.first_name} {data.last_name} ({data.user_name})
            </div>
            <div>
              <strong>Email:</strong> {data.email}
            </div>
            <div>
              <strong>Phone:</strong> {data.phone}
            </div>
            <div>
              <strong>Emergency Contact:</strong> {data.emergency_contact || "N/A"}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xs={12} md={3}>
          <div><strong>Joined:</strong> {data.joining_date || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>Designation:</strong> {data.position || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>Salary:</strong> {data.basic_salary || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>Accommodation:</strong> {data.accommodation_cost || "N/A"}</div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xs={12} md={3}>
          <div><strong>DOB:</strong> {data.dob || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>Gender:</strong> {data.gender || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>Role ID:</strong> {data.role_id || "N/A"}</div>
        </Col>
        <Col xs={12} md={3}>
          <div><strong>ID Copy:</strong> {data.id_copy ? data.id_copy : "N/A"}</div>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDetails;