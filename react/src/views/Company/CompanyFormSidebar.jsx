import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { notification } from "../../components/ToastNotification.jsx";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { useCreateCompanyMutation, useGetSingleCompanyDataQuery } from "../../api/slices/companySlice.js";
import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../styles/formThemeStyles.js";
import { isImageUrl } from "../../helper/media.js";

const companyActivities = [
  "vacation homes rental",
  "grocery",
  "real estate",
  "printing",
  "shop",
  "restaurant",
  "super shop",
  "cleaning service",
  "management service",
];

const _initialCompany = {
  id: null,
  name: null,
  phone: null,
  email: null, // Set default value to an empty string
  address: null, // Set default value to an empty string
  activity: null,
  license_no: null,
  issue_date: null,
  expiry_date: null,
  registration_number: null,
  logo: null,
};

export default forwardRef(function CompanyFormSidebar({ companyId = null, onSuccess, formId: formIdProp = null, hideInternalFooter = false }, ref) {
  const [companyData, setCompanyData] = useState(_initialCompany);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { closeSidebar } = useSidebarActions();
  const [createCompany] = useCreateCompanyMutation();
  const formId = formIdProp || "company-form-sidebar-form";
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  
  // api call
  const {
    data: getSingleCompanyData,
    isFetching: singleCompanyFetching,
    isError: singleCompanyDataError,
  } = useGetSingleCompanyDataQuery({ id: companyId }, { skip: !companyId });

  useEffect(() => {
    // RTK query returns the entire API response; our payload is under `data`
    const payload = getSingleCompanyData?.data;
    if (companyId && payload) {
      setCompanyData((prevCompany) => ({
        ...prevCompany,
        ...payload,
      }));
    }
  }, [getSingleCompanyData]);

  // Initialize required dates in state if missing to prevent validation errors during edit
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const normalize = (v) => (v && v !== "null" ? v : null);
    const issue = normalize(companyData?.issue_date);
    const expiry = normalize(companyData?.expiry_date);
    const updates = {};
    // If issue_date is missing (create or edit), set to today
    if (!issue) {
      updates.issue_date = todayStr;
    }
    // If expiry_date is missing (create or edit), set to tomorrow
    if (!expiry) {
      updates.expiry_date = tomorrowStr;
    }
    // Keep legacy `date` default when it's an empty string
    if (companyData?.date === "") {
      updates.date = todayStr;
    }
    if (Object.keys(updates).length) {
      setCompanyData((prev) => ({ ...prev, ...updates }));
    }
  }, [companyId, companyData?.issue_date, companyData?.expiry_date, companyData?.date]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData({
        ...companyData,
        logo: file,
      });
    }
  };

  // Determine logo preview URL from either File or stored filename/full URL
  const logoPreviewUrl = useMemo(() => {
    const logo = companyData?.logo;
    if (!logo || logo === "null") return null;
    try {
      if (logo instanceof File) {
        return URL.createObjectURL(logo);
      }
      if (typeof logo === "string") {
        const trimmed = logo.trim();
        if (
          trimmed.startsWith("http://") ||
          trimmed.startsWith("https://") ||
          trimmed.startsWith("/")
        ) {
          return trimmed;
        }
        const base = window.__APP_CONFIG__?.VITE_APP_BASE_URL || "";
        return `${base}/storage/files/company/${trimmed}`;
      }
      return null;
    } catch {
      return null;
    }
  }, [companyData?.logo]);

  const companySubmit = async (event, stay) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    
    const {
      name,
      phone,
      email,
      address,
      activity,
      license_no,
      issue_date,
      expiry_date,
      registration_number,
      logo,
    } = companyData;
    // Frontend validations for required fields and normalization
    const nameTrimmed = (name || "").trim();
    const phoneTrimmed = (phone || "").trim();
    const emailTrimmed = (email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const nextErrors = {};
    if (!nameTrimmed) {
      nextErrors.name = ["Company name is required."];
    }
    if (!phoneTrimmed) {
      nextErrors.phone = ["A company phone number is required."];
    }
    if (!emailTrimmed) {
      nextErrors.email = ["Valid company email is required"];
    } else if (!emailRegex.test(emailTrimmed)) {
      nextErrors.email = ["Email must be a valid email address."];
    } else if (emailTrimmed.length > 32) {
      nextErrors.email = ["Email may not be greater than 32 characters."];
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      notification("error", "Validation error", "Please review the highlighted fields.");
      setLoading(false);
      return;
    }
    
    let formData = new FormData();
    formData.append("name", nameTrimmed);
    formData.append("phone", phoneTrimmed);
    formData.append("email", emailTrimmed);
    formData.append("address", address);
    formData.append("activity", activity);
    formData.append("license_no", license_no);
    // Validate required issue_date
    if (!issue_date) {
      const fieldErrors = { ...errors, issue_date: ["Issue date is required."] };
      setErrors(fieldErrors);
      notification("error", "Validation error", "Issue date is required.");
      setLoading(false);
      return;
    }
    formData.append("issue_date", issue_date);
    // Validate required expiry_date
    if (!expiry_date) {
      const fieldErrors = { ...errors, expiry_date: ["Expiry date is required."] };
      setErrors(fieldErrors);
      notification("error", "Validation error", "Expiry date is required.");
      setLoading(false);
      return;
    }
    // Extra validation: dates must not be the same
    if (issue_date === expiry_date) {
      const fieldErrors = {
        ...errors,
        expiry_date: ["Expiry date must be different from issue date."],
      };
      setErrors(fieldErrors);
      notification("error", "Validation error", "Issue and expiry date cannot be the same.");
      setLoading(false);
      return;
    }
    formData.append("expiry_date", expiry_date);
    formData.append("registration_number", registration_number);
    if (logo instanceof File) {
      formData.append("logo", logo);
    }

    // Update should target uid when available, otherwise fall back to numeric id
    const updateKey = companyData?.uid || companyId;
    const url = companyId ? `/company/update/${updateKey}` : "/addCompany";
    
    try {
      const data = await createCompany({ url: url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      
      if (!stay) {
        onSuccess?.();
        closeSidebar(); // Close the sidebar
      } else {
        setCompanyData(_initialCompany);
      }
    } catch (err) {
      // Map backend validation errors to local state for field-level display
      // Support both axios-shaped and fetchBaseQuery-shaped error payloads
      const fieldErrors = (err?.errorData?.errors || err?.data?.errors || {});
      setErrors(fieldErrors);

      // Still show a toast for summary context
      notification(
        "error",
        err?.message || "Validation error",
        err?.description || "Please review the highlighted fields."
      );
    } finally {
      setLoading(false);
    }
  };

  // Expose imperative methods for sticky footer actions
  useImperativeHandle(ref, () => ({
    save: () => {
      // Programmatic submit that keeps the sidebar open
      companySubmit({ preventDefault: () => {} }, true);
    },
    saveAndExit: () => {
      // Programmatic submit that closes the sidebar
      companySubmit({ preventDefault: () => {} }, false);
    },
  }));

  if (singleCompanyFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="company-form-sidebar">
      <Form id={formId} onSubmit={(e) => companySubmit(e, true)}>
        <Row>
          <Col xs={12} md={6}>
            <InputGroup className={errors.name ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_name" style={inputGroupTextStyle}>Company Name *</InputGroup.Text>
              <Form.Control
                aria-describedby="company_name"
                type="text"
                placeholder="Enter company name"
                value={companyData.name || ""}
                onChange={(ev) => setCompanyData({ ...companyData, name: ev.target.value })}
                required
              />
            </InputGroup>
            {errors.name && (<p className="error-message">{errors.name[0]}</p>)}
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className={errors.phone ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_phone" style={inputGroupTextStyle}>Phone *</InputGroup.Text>
              <Form.Control
                aria-describedby="company_phone"
                type="text"
                placeholder="Enter phone number"
                maxLength={16}
                value={companyData.phone || ""}
                onChange={(ev) => setCompanyData({ ...companyData, phone: ev.target.value })}
                required
              />
            </InputGroup>
            {errors.phone && (<p className="error-message">{errors.phone[0]}</p>)}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <InputGroup className={errors.email ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_email" style={inputGroupTextStyle}>Email *</InputGroup.Text>
              <Form.Control
                aria-describedby="company_email"
                type="email"
                placeholder="Enter email address"
                value={companyData.email || ""}
                onChange={(ev) => setCompanyData({ ...companyData, email: ev.target.value })}
                required
              />
            </InputGroup>
            {errors.email && (<p className="error-message">{errors.email[0]}</p>)}
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className={errors.activity ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_activity" style={inputGroupTextStyle}>Activity</InputGroup.Text>
              <Form.Select
                aria-describedby="company_activity"
                value={companyData.activity || ""}
                onChange={(ev) => setCompanyData({ ...companyData, activity: ev.target.value })}
              >
                <option value="">Select activity</option>
                {companyActivities.map((activity, index) => (
                  <option key={index} value={activity}>{activity}</option>
                ))}
              </Form.Select>
            </InputGroup>
            {errors.activity && (<p className="error-message">{errors.activity[0]}</p>)}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <InputGroup className={errors.license_no ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_license_no" style={inputGroupTextStyle}>License No.</InputGroup.Text>
              <Form.Control
                aria-describedby="company_license_no"
                type="text"
                placeholder="Enter license number"
                value={
                  companyData.license_no === "null" || companyData.license_no === null
                    ? ""
                    : companyData.license_no
                }
                onChange={(ev) => setCompanyData({ ...companyData, license_no: ev.target.value })}
              />
            </InputGroup>
            {errors.license_no && (<p className="error-message">{errors.license_no[0]}</p>)}
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className={errors.registration_number ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_registration_number" style={inputGroupTextStyle}>Registration No.</InputGroup.Text>
              <Form.Control
                aria-describedby="company_registration_number"
                type="text"
                placeholder="Enter registration number"
                value={
                  companyData.registration_number === "null" || companyData.registration_number === null
                    ? ""
                    : companyData.registration_number
                }
                onChange={(ev) => setCompanyData({ ...companyData, registration_number: ev.target.value })}
              />
            </InputGroup>
            {errors.registration_number && (<p className="error-message">{errors.registration_number[0]}</p>)}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <InputGroup className={errors.issue_date ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_issue_date" style={inputGroupTextStyle}>Issue Date *</InputGroup.Text>
              <Form.Control
                aria-describedby="company_issue_date"
                type="date"
                value={companyData.issue_date || ""}
                onChange={(ev) => setCompanyData({ ...companyData, issue_date: ev.target.value || null })}
              />
            </InputGroup>
            {errors.issue_date && (<p className="error-message">{errors.issue_date[0]}</p>)}
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className={errors.expiry_date ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_expiry_date" style={inputGroupTextStyle}>Expiry Date *</InputGroup.Text>
              <Form.Control
                aria-describedby="company_expiry_date"
                type="date"
                value={companyData.expiry_date || ""}
                onChange={(ev) => setCompanyData({ ...companyData, expiry_date: ev.target.value || null })}
              />
            </InputGroup>
            {errors.expiry_date && (<p className="error-message">{errors.expiry_date[0]}</p>)}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={12}>
            <InputGroup className={errors.address ? "mb-1" : "mb-3"} size="sm">
              <InputGroup.Text id="company_address" style={inputGroupTextStyle}>Address</InputGroup.Text>
              <Form.Control
                aria-describedby="company_address"
                as="textarea"
                rows={3}
                placeholder="Enter company address"
                value={companyData.address || ""}
                onChange={(ev) => setCompanyData({ ...companyData, address: ev.target.value })}
              />
            </InputGroup>
            {errors.address && (<p className="error-message">{errors.address[0]}</p>)}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <InputGroup className={errors.logo ? "mb-1" : "mb-3"} size="sm">
              <Form.Control
                aria-describedby="company_logo"
                type="file"
                onChange={handleFileInputChange}
                accept="image/*"
                placeholder="Add Attachment"
                aria-label="Add Attachment"
                name="logo"
                className="file-input-secondary"
                style={{
                  backgroundColor: theme.palette.background.paper,
                  '--cms-secondary-bg': theme.palette.secondary.main,
                  '--cms-secondary-contrast': theme.palette.getContrastText(theme.palette.secondary.main),
                }}
              />
            </InputGroup>
            {(companyData.logo || logoPreviewUrl) && (
              <div style={{ marginTop: 4 }}>
                {companyData.logo instanceof File ? (
                  logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Uploaded"
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <small>Selected file: {companyData.logo.name}</small>
                  )
                ) : (
                  logoPreviewUrl && (isImageUrl(logoPreviewUrl) ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Uploaded"
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <small>
                      Current attachment:{" "}
                      <a href={logoPreviewUrl} target="_blank" rel="noopener noreferrer">View</a>
                    </small>
                  ))
                )}
              </div>
            )}
            {errors.logo && (<p className="error-message">{errors.logo[0]}</p>)}
          </Col>
        </Row>

        {/* Form Actions (hidden when using sticky footer) */}
        {!hideInternalFooter && (
          <div className="form-actions">
            <div className="d-flex gap-2">
              {companyData.id ? (
                <Button
                  variant="warning"
                  onClick={(e) => companySubmit(e, false)}
                  disabled={loading}
                  className="flex-fill"
                >
                  Update
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={(e) => companySubmit(e, true)}
                    disabled={loading}
                    className="flex-fill"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => companySubmit(e, false)}
                    disabled={loading}
                    className="flex-fill"
                  >
                    Save and Exit
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Form>
    </div>
  );
});
