import { Tab, Form, Card, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useUpdateEmploymentInfoMutation } from "../../../../api/slices/userSlice.js";
import { notification } from "../../../../components/ToastNotification.jsx";

const _initials = {
  id: null,
  role_as: "admin",
  employee_code: "",
  designation: "",
  department: "",
  date_of_joining: "",
  employment_type: "",
  salary: "",
  address: "",
  city: "",
  state: "",
  country: "",
  national_id: "",
  passport_no: "",
  emirates_id: "",
  visa_status: "",
  status: "active",
  passport_copy: null,
  emirate_id_copy: null,
  accommodation_cost: "",
};

export default function EmploymentInfo({ user }) {
  const [data, setData] = useState(_initials);
  const [btnText, setBtnText] = useState("Update");

  useEffect(() => {
    if (user) {
      setData({
        ...data,
        id: user.id,
        employee_code: user.employee_code || "MH15081996",
        designation: user.designation || "Operational Manage",
        department: user.department || "HR",
        date_of_joining: user.date_of_joining || "2024-01-10",
        employment_type: user.employment_type || "full-time",
        salary: user.salary || "12000",
        address: user.address || "Ajyad Properties, Block A, Apartment 402",
        city: user.city || "Dubai",
        state: user.state || "Jumeirah Village Circle",
        country: user.country || "UAE",
        national_id: user.national_id || "88128923",
        passport_no: user.passport_no || "A02049652",
        emirates_id: user.emirates_id || "784-1996-11615982",
        visa_status: user.visa_status || "residence",
        accommodation_cost: user.accommodation_cost || "2000",
      });
    }
  }, [user]);

  const [updateEmploymentData] = useUpdateEmploymentInfoMutation();

  const updateEmploymentInfo = async (event) => {
    event.preventDefault();
    setBtnText("Updating...");

    const formData = new FormData();
    formData.append("role_as", data.role_as);
    formData.append("employee_code", data.employee_code);
    formData.append("designation", data.designation);
    formData.append("department", data.department);
    formData.append("date_of_joining", data.date_of_joining);
    formData.append("employment_type", data.employment_type);
    formData.append("salary", data.salary);
    formData.append("address", data.address);
    formData.append("city", data.city);
    formData.append("state", data.state);
    formData.append("country", data.country);
    formData.append("national_id", data.national_id);
    formData.append("passport_no", data.passport_no);
    formData.append("emirates_id", data.emirates_id);
    formData.append("visa_status", data.visa_status);
    formData.append("status", data.status);
    formData.append("accommodation_cost", data.accommodation_cost);
    
    if (data.passport_copy) {
      formData.append("passport_copy", data.passport_copy);
    }
    if (data.emirate_id_copy) {
      formData.append("emirate_id_copy", data.emirate_id_copy);
    }

    try {
      const response = await updateEmploymentData({
        url: `/update-employment-details/${user.slug}`,
        formData,
      }).unwrap();
      notification("success", response?.message, response?.description);
      setBtnText("Update");
    } catch (err) {
      setBtnText("Try again");
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    }
  };

  return (
    <>
      <Tab.Pane eventKey="employment">
        <Card>
          <Card.Title className={"mb-5"}>Employment Information</Card.Title>
          <Form>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="employee_code">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Employee Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: MH15081996"
                    value={data.employee_code}
                    onChange={(e) => {
                      setData({ ...data, employee_code: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="designation">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Designation
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: Operational Manager"
                    value={data.designation}
                    onChange={(e) => {
                      setData({ ...data, designation: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="department">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Department
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: HR"
                    value={data.department}
                    onChange={(e) => {
                      setData({ ...data, department: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="date_of_joining">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Date of Joining
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={data.date_of_joining}
                    onChange={(e) => {
                      setData({ ...data, date_of_joining: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="employment_type">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Employment Type
                  </Form.Label>
                  <Form.Select
                    aria-label="employment_type"
                    value={data.employment_type}
                    onChange={(e) => {
                      setData({ ...data, employment_type: e.target.value });
                    }}
                  >
                    <option value="">Select Employment Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="salary">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Salary
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g: 12000"
                    value={data.salary}
                    onChange={(e) => {
                      setData({ ...data, salary: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Address
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="e.g: Ajyad Properties, Block A, Apartment 402"
                    value={data.address}
                    onChange={(e) => {
                      setData({ ...data, address: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={4} sm={4}>
                <Form.Group className="mb-3" controlId="city">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    City
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: Dubai"
                    value={data.city}
                    onChange={(e) => {
                      setData({ ...data, city: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={4} sm={4}>
                <Form.Group className="mb-3" controlId="state">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    State
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: Jumeirah Village Circle"
                    value={data.state}
                    onChange={(e) => {
                      setData({ ...data, state: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={4} sm={4}>
                <Form.Group className="mb-3" controlId="country">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Country
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: UAE"
                    value={data.country}
                    onChange={(e) => {
                      setData({ ...data, country: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="national_id">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    National ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: 88128923"
                    value={data.national_id}
                    onChange={(e) => {
                      setData({ ...data, national_id: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="passport_no">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Passport Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: A02049652"
                    value={data.passport_no}
                    onChange={(e) => {
                      setData({ ...data, passport_no: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="emirates_id">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Emirates ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g: 784-1996-11615982"
                    value={data.emirates_id}
                    onChange={(e) => {
                      setData({ ...data, emirates_id: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="visa_status">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Visa Status
                  </Form.Label>
                  <Form.Select
                    aria-label="visa_status"
                    value={data.visa_status}
                    onChange={(e) => {
                      setData({ ...data, visa_status: e.target.value });
                    }}
                  >
                    <option value="">Select Visa Status</option>
                    <option value="residence">Residence</option>
                    <option value="visit">Visit</option>
                    <option value="work">Work</option>
                    <option value="student">Student</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="accommodation_cost">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Accommodation Cost
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g: 2000"
                    value={data.accommodation_cost}
                    onChange={(e) => {
                      setData({ ...data, accommodation_cost: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Status
                  </Form.Label>
                  <Form.Select
                    aria-label="status"
                    value={data.status}
                    onChange={(e) => {
                      setData({ ...data, status: e.target.value });
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="passport_copy">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Passport 
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      setData({ ...data, passport_copy: e.target.files[0] });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="emirate_id_copy">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Emirates ID 
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      setData({ ...data, emirate_id_copy: e.target.files[0] });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button onClick={(e) => updateEmploymentInfo(e)} className="custom-btn">
              {btnText}
            </Button>
          </Form>
        </Card>
      </Tab.Pane>
    </>
  );
}