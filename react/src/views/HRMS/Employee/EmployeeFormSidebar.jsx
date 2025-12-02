import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";

const defaultEmployee = {
  first_name: "",
  last_name: "",
  user_name: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  emergency_contact: "",
  joining_date: "",
  role_id: "",
  position: "",
  basic_salary: "",
  accommodation_cost: "",
  profile_picture: "",
  id_copy: "",
};

const EmployeeFormSidebar = ({ employeeId = null, onSuccess }) => {
  const [employee, setEmployee] = useState(defaultEmployee);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const { closeSidebar } = useSidebarActions();

  const handleFileInputChange = (event, name) => {
    const file = event.target.files[0];
    setEmployee((prevState) => ({ ...prevState, [name]: file }));
  };

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/roles-by-company")
      .then(({ data }) => {
        setRoleList(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    axiosClient
      .get(`/employee/${employeeId}`)
      .then(({ data }) => {
        const emp = data?.data || {};
        setEmployee({
          first_name: emp.first_name || "",
          last_name: emp.last_name || "",
          user_name: emp.user_name || "",
          dob: emp.dob || "",
          gender: emp.gender || "",
          email: emp.email || "",
          phone: emp.phone || "",
          emergency_contact: emp.emergency_contact || "",
          joining_date: emp.joining_date || "",
          role_id: emp.role_id || "",
          position: emp.position || "",
          basic_salary: emp.basic_salary || "",
          accommodation_cost: emp.accommodation_cost || "",
          profile_picture: emp.profile_picture || "",
          id_copy: emp.id_copy || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [employeeId]);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(employee).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const url = employeeId ? `/employee/${employeeId}` : "/employee/add";
    axiosClient
      .post(url, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(({ data }) => {
        notification("success", data?.message, data?.description);
        setEmployee(defaultEmployee);
        setErrors({});
        if (onSuccess) onSuccess();
        closeSidebar();
      })
      .catch((err) => {
        if (err.response) {
          const error = err.response.data;
          notification("error", error?.message, error?.description);
          setErrors(error.errors || {});
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <Form onSubmit={submit}>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="first_name">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={employee.first_name}
                onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
              />
              {errors?.first_name && <small className="error-message mt-2">{errors?.first_name[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="last_name">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={employee.last_name}
                onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
              />
              {errors?.last_name && <small className="error-message mt-2">{errors?.last_name[0]}</small>}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="user_name">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                value={employee.user_name}
                onChange={(e) => setEmployee({ ...employee, user_name: e.target.value })}
              />
              {errors?.user_name && <small className="error-message mt-2">{errors?.user_name[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={employee.email}
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
              />
              {errors?.email && <small className="error-message mt-2">{errors?.email[0]}</small>}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="dob">
              <Form.Label>Date Of Birth</Form.Label>
              <Form.Control
                type="date"
                value={employee.dob}
                onChange={(e) => setEmployee({ ...employee, dob: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="gender">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                aria-label="gender"
                value={employee.gender || ""}
                onChange={(e) => setEmployee({ ...employee, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={employee.phone}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
              />
              {errors?.phone && <small className="error-message mt-2">{errors?.phone[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="emergency_contact">
              <Form.Label>Emergency Contact</Form.Label>
              <Form.Control
                type="text"
                value={employee.emergency_contact}
                onChange={(e) => setEmployee({ ...employee, emergency_contact: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12}>
            <Form.Group className="mb-3" controlId="role_id">
              <Form.Label>Employee Role</Form.Label>
              <Form.Select
                aria-label="role"
                value={employee.role_id || ""}
                onChange={(e) => setEmployee({ ...employee, role_id: e.target.value })}
              >
                <option value="">Select Role</option>
                {roleList.length > 0 ? (
                  roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))
                ) : (
                  <option value="">Select Role</option>
                )}
              </Form.Select>
              {errors?.role_id && <small className="error-message mt-2">{errors?.role_id[0]}</small>}
            </Form.Group>
          </Col>
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12} md={3}>
            <Form.Group className="mb-3" controlId="joining_date">
              <Form.Label>Joining Date</Form.Label>
              <Form.Control
                type="date"
                value={employee.joining_date}
                onChange={(e) => setEmployee({ ...employee, joining_date: e.target.value })}
              />
              {errors?.joining_date && <small className="error-message mt-2">{errors?.joining_date[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Form.Group className="mb-3" controlId="position">
              <Form.Label>Designation</Form.Label>
              <Form.Select
                aria-label="position"
                value={employee.position || ""}
                onChange={(e) => setEmployee({ ...employee, position: e.target.value })}
              >
                <option value="">Select Designation</option>
                <option value="supervisor">Supervisor</option>
                <option value="cleaner">Cleaner</option>
                <option value="driver">Driver</option>
                <option value="hr">HR</option>
                <option value="intern">Intern</option>
                <option value="accountant">Accountant</option>
                <option value="investor">Investor</option>
                <option value="others">Others</option>
              </Form.Select>
              {errors?.position && <small className="error-message mt-2">{errors?.position[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Form.Group className="mb-3" controlId="basic_salary">
              <Form.Label>Basic Salary</Form.Label>
              <Form.Control
                type="number"
                placeholder="i.g: 50 AED"
                value={employee.basic_salary}
                onChange={(e) => setEmployee({ ...employee, basic_salary: e.target.value })}
              />
              {errors?.basic_salary && <small className="error-message mt-2">{errors?.basic_salary[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Form.Group className="mb-3" controlId="accommodation_cost">
              <Form.Label>Accommodation Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="i.g: 1500 AED"
                value={employee.accommodation_cost}
                onChange={(e) => setEmployee({ ...employee, accommodation_cost: e.target.value })}
              />
              {errors?.accommodation_cost && (
                <small className="error-message mt-2">{errors?.accommodation_cost[0]}</small>
              )}
            </Form.Group>
          </Col>
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="profile_picture">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileInputChange(e, "profile_picture")} />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="id_copy">
              <Form.Label>Identity Copy</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileInputChange(e, "id_copy")} />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={closeSidebar} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {employeeId ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EmployeeFormSidebar;