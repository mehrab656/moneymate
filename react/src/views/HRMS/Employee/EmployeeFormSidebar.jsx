import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles } from "../../../styles/formThemeStyles.js";
import WizCard from "../../../components/WizCard.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import Select from "react-select";
import { isImageUrl } from "../../../helper/media.js";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";

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

export default forwardRef(function EmployeeFormSidebar({
  employeeId = null,
  onSuccess,
  formId: formIdProp = null,
  hideInternalFooter = true,
  showLabel = true,
  sidebarTitle = null,
  colXS = 12,
  colMD = 6,
  colSM = 12,
  footerActions = null,
}, ref) {
  const [employee, setEmployee] = useState(defaultEmployee);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const { closeSidebar } = useSidebarActions();
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const formId = formIdProp || "employee-form-sidebar-form";
  const formRef = useRef(null);
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const positionOptions = [
    { value: "supervisor", label: "Supervisor" },
    { value: "cleaner", label: "Cleaner" },
    { value: "driver", label: "Driver" },
    { value: "hr", label: "HR" },
    { value: "intern", label: "Intern" },
    { value: "accountant", label: "Accountant" },
    { value: "investor", label: "Investor" },
    { value: "others", label: "Others" },
  ];

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

  const employeeSubmit = (e, stay) => {
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
        if (!stay) {
          onSuccess?.();
          closeSidebar();
        } else {
          setEmployee(defaultEmployee);
          try { formRef.current?.reset(); } catch {}
        }
        setErrors({});
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

  useImperativeHandle(ref, () => ({
    save: () => {
      employeeSubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      employeeSubmit({ preventDefault: () => {} }, false);
    },
  }));

  return (
    <div className="px-2 employee-sidebar" style={{ fontSize: inputFontSize, overflowX: "hidden" }}>
      <MainLoader loaderVisible={loading} />
      {sidebarTitle && <h6>{sidebarTitle ? sidebarTitle : ""}</h6>}
      <WizCard className="animated fadeInDown">
      <Form ref={formRef} id={formId} onSubmit={(e) => employeeSubmit(e, Boolean(footerActions))}>
        <Row>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className={errors?.first_name ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_first_name" style={inputGroupTextStyle}>First Name</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_first_name"
                aria-label="First Name"
                type="text"
                value={employee.first_name}
                style={{ fontSize: inputFontSize }}
                placeholder="First Name"
                onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
              />
            </InputGroup>
            {errors?.first_name && <small className="error-message mt-2">{errors?.first_name[0]}</small>}
          </Col>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className={errors?.last_name ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_last_name" style={inputGroupTextStyle}>Last Name</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_last_name"
                aria-label="Last Name"
                type="text"
                value={employee.last_name}
                style={{ fontSize: inputFontSize }}
                placeholder="Last Name"
                onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
              />
            </InputGroup>
            {errors?.last_name && <small className="error-message mt-2">{errors?.last_name[0]}</small>}
          </Col>
        </Row>

        <Row>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className={errors?.user_name ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_user_name" style={inputGroupTextStyle}>User Name</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_user_name"
                aria-label="User Name"
                type="text"
                value={employee.user_name}
                style={{ fontSize: inputFontSize }}
                placeholder="User Name"
                onChange={(e) => setEmployee({ ...employee, user_name: e.target.value })}
              />
            </InputGroup>
            {errors?.user_name && <small className="error-message mt-2">{errors?.user_name[0]}</small>}
          </Col>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className={errors?.email ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_email" style={inputGroupTextStyle}>Email</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_email"
                aria-label="Email"
                type="email"
                value={employee.email}
                style={{ fontSize: inputFontSize }}
                placeholder="Email"
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
              />
            </InputGroup>
            {errors?.email && <small className="error-message mt-2">{errors?.email[0]}</small>}
          </Col>
        </Row>

        <Row>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className="mb-3" size="sm">
              {showLabel && <InputGroup.Text id="employee_dob" style={inputGroupTextStyle}>Date Of Birth</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_dob"
                aria-label="Date Of Birth"
                type="date"
                value={employee.dob}
                style={{ fontSize: inputFontSize }}
                placeholder="mm/dd/yyyy"
                onChange={(e) => setEmployee({ ...employee, dob: e.target.value })}
              />
            </InputGroup>
          </Col>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className="mb-3" size="sm">
              {showLabel && <InputGroup.Text id="employee_gender" style={inputGroupTextStyle}>Gender</InputGroup.Text>}
              <div style={{ flex: 1 }}>
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={genderOptions.find((opt) => opt.value === (employee.gender || "")) || null}
                  onChange={(opt) => setEmployee({ ...employee, gender: opt?.value || "" })}
                  options={genderOptions}
                  placeholder={"Select Gender"}
                />
              </div>
            </InputGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className={errors?.phone ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_phone" style={inputGroupTextStyle}>Phone</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_phone"
                aria-label="Phone"
                type="text"
                value={employee.phone}
                style={{ fontSize: inputFontSize }}
                placeholder="Phone"
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
              />
            </InputGroup>
            {errors?.phone && <small className="error-message mt-2">{errors?.phone[0]}</small>}
          </Col>
          <Col xs={colXS} md={colMD} sm={colSM}>
            <InputGroup className="mb-3" size="sm">
              {showLabel && <InputGroup.Text id="employee_emergency_contact" style={inputGroupTextStyle}>Emergency Contact</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_emergency_contact"
                aria-label="Emergency Contact"
                type="text"
                value={employee.emergency_contact}
                style={{ fontSize: inputFontSize }}
                placeholder="Emergency Contact"
                onChange={(e) => setEmployee({ ...employee, emergency_contact: e.target.value })}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6} sm={12}>
            <InputGroup className={errors?.role_id ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_role_id" style={inputGroupTextStyle}>Employee Role</InputGroup.Text>}
              <div style={{ flex: 1 }}>
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={
                    (roleList || [])
                      .map((r) => ({ value: r.id, label: r.role }))
                      .find((opt) => opt.value === (employee.role_id || "")) || null
                  }
                  onChange={(opt) => setEmployee({ ...employee, role_id: opt?.value || "" })}
                  options={(roleList || []).map((r) => ({ value: r.id, label: r.role }))}
                  placeholder={"Select Role"}
                />
              </div>
            </InputGroup>
            {errors?.role_id && <small className="error-message mt-2">{errors?.role_id[0]}</small>}
          </Col>
            <Col xs={12} md={6} sm={12}>
            <InputGroup className={errors?.position ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_position" style={inputGroupTextStyle}>Designation</InputGroup.Text>}
              <div style={{ flex: 1 }}>
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={positionOptions.find((opt) => opt.value === (employee.position || "")) || null}
                  onChange={(opt) => setEmployee({ ...employee, position: opt?.value || "" })}
                  options={positionOptions}
                  placeholder={"Select Designation"}
                />
              </div>
            </InputGroup>
            {errors?.position && <small className="error-message mt-2">{errors?.position[0]}</small>}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={4} sm={12}>
            <InputGroup className={errors?.joining_date ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_joining_date" style={inputGroupTextStyle}>Joining Date</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_joining_date"
                aria-label="Joining Date"
                type="date"
                value={employee.joining_date}
                style={{ fontSize: inputFontSize }}
                placeholder="mm/dd/yyyy"
                onChange={(e) => setEmployee({ ...employee, joining_date: e.target.value })}
              />
            </InputGroup>
            {errors?.joining_date && <small className="error-message mt-2">{errors?.joining_date[0]}</small>}
          </Col>
        
          <Col xs={12} md={4} sm={12}>
            <InputGroup className={errors?.basic_salary ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_basic_salary" style={inputGroupTextStyle}>Basic Salary</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_basic_salary"
                aria-label="Basic Salary"
                type="number"
                placeholder="i.g: 50 AED"
                value={employee.basic_salary}
                style={{ fontSize: inputFontSize }}
                onChange={(e) => setEmployee({ ...employee, basic_salary: e.target.value })}
              />
            </InputGroup>
            {errors?.basic_salary && <small className="error-message mt-2">{errors?.basic_salary[0]}</small>}
          </Col>
          <Col xs={12} md={4} sm={12}>
            <InputGroup className={errors?.accommodation_cost ? "mb-1" : "mb-3"} size="sm">
              {showLabel && <InputGroup.Text id="employee_accommodation_cost" style={inputGroupTextStyle}>Accommodation Cost</InputGroup.Text>}
              <Form.Control
                aria-describedby="employee_accommodation_cost"
                aria-label="Accommodation Cost"
                type="number"
                placeholder="i.g: 1500 AED"
                value={employee.accommodation_cost}
                style={{ fontSize: inputFontSize }}
                onChange={(e) => setEmployee({ ...employee, accommodation_cost: e.target.value })}
              />
            </InputGroup>
            {errors?.accommodation_cost && (
              <small className="error-message mt-2">{errors?.accommodation_cost[0]}</small>
            )}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6} sm={12}>
            <InputGroup className="mb-3" size="sm">
              <Form.Control
                aria-describedby="employee_profile_picture"
                type="file"
                onChange={(e) => handleFileInputChange(e, "profile_picture")}
                className="file-input-secondary"
                style={{
                  backgroundColor: theme.palette.background.paper,
                  '--cms-secondary-bg': theme.palette.secondary.main,
                  '--cms-secondary-contrast': theme.palette.getContrastText(theme.palette.secondary.main),
                }}
              />
            </InputGroup>
            {(employee.profile_picture) && (
              <div style={{ marginTop: 4 }}>
                {employee.profile_picture instanceof File ? (
                  <img
                    src={URL.createObjectURL(employee.profile_picture)}
                    alt="Uploaded"
                    style={{ width: "200px", height: "200px", borderRadius: "10px", objectFit: "cover" }}
                  />
                ) : (
                  isImageUrl(String(employee.profile_picture)) ? (
                    <img
                      src={String(employee.profile_picture)}
                      alt="Uploaded"
                      style={{ width: "200px", height: "200px", borderRadius: "10px", objectFit: "cover" }}
                    />
                  ) : (
                    <small>
                      Current attachment:{" "}
                      <a href={String(employee.profile_picture)} target="_blank" rel="noopener noreferrer">View</a>
                    </small>
                  )
                )}
              </div>
            )}
          </Col>
          <Col xs={12} md={6} sm={12}>
            <InputGroup className="mb-3" size="sm">
              <Form.Control
                aria-describedby="employee_id_copy"
                type="file"
                onChange={(e) => handleFileInputChange(e, "id_copy")}
                className="file-input-secondary"
                style={{
                  backgroundColor: theme.palette.background.paper,
                  '--cms-secondary-bg': theme.palette.secondary.main,
                  '--cms-secondary-contrast': theme.palette.getContrastText(theme.palette.secondary.main),
                }}
              />
            </InputGroup>
            {(employee.id_copy) && (
              <div style={{ marginTop: 4 }}>
                {employee.id_copy instanceof File ? (
                  <img
                    src={URL.createObjectURL(employee.id_copy)}
                    alt="Uploaded"
                    style={{ width: "200px", height: "200px", borderRadius: "10px", objectFit: "cover" }}
                  />
                ) : (
                  isImageUrl(String(employee.id_copy)) ? (
                    <img
                      src={String(employee.id_copy)}
                      alt="Uploaded"
                      style={{ width: "200px", height: "200px", borderRadius: "10px", objectFit: "cover" }}
                    />
                  ) : (
                    <small>
                      Current attachment:{" "}
                      <a href={String(employee.id_copy)} target="_blank" rel="noopener noreferrer">View</a>
                    </small>
                  )
                )}
              </div>
            )}
          </Col>
        </Row>

        {!hideInternalFooter && !footerActions && (
          <div
            className="sidebar-fixed-footer"
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "transparent",
              borderTop: "none",
              padding: "12px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              zIndex: 2,
            }}
          >
            <SidebarFooterButtons
              actions={
                employeeId
                  ? [
                      {
                        label: "Update",
                        type: "button",
                        disabled: loading,
                        onClick: () =>
                          employeeSubmit({ preventDefault: () => {} }, false),
                      },
                    ]
                  : [
                      {
                        label: "Save",
                        type: "button",
                        disabled: loading,
                        onClick: () =>
                          employeeSubmit({ preventDefault: () => {} }, true),
                      },
                      {
                        label: "Save and Exit",
                        type: "button",
                        disabled: loading,
                        onClick: () =>
                          employeeSubmit({ preventDefault: () => {} }, false),
                      },
                    ]
              }
            />
          </div>
        )}
      </Form>
      </WizCard>
    </div>
  );
});
