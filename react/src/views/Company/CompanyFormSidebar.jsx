import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { notification } from "../../components/ToastNotification.jsx";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { useCreateCompanyMutation, useGetSingleCompanyDataQuery } from "../../api/slices/companySlice.js";

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

export default function CompanyFormSidebar({ companyId = null, onSuccess }) {
  const [companyData, setCompanyData] = useState(_initialCompany);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { closeSidebar } = useSidebarActions();
  const [createCompany] = useCreateCompanyMutation();
  
  // api call
  const {
    data: getSingleCompanyData,
    isFetching: singleCompanyFetching,
    isError: singleCompanyDataError,
  } = useGetSingleCompanyDataQuery({ id: companyId }, { skip: !companyId });

  useEffect(() => {
    if (companyId && getSingleCompanyData) {
      setCompanyData((prevCompany) => ({
        ...prevCompany,
        ...getSingleCompanyData,
        date: getSingleCompanyData.date || "", // Set to empty string if the value is null or undefined
      }));
    }
  }, [getSingleCompanyData]);

  // set some default data
  useEffect(() => {
    if (companyData?.date === "") {
      setCompanyData({
        ...companyData,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [companyData?.date]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData({
        ...companyData,
        logo: file,
      });
    }
  };

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
    
    let formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("activity", activity);
    formData.append("license_no", license_no);
    formData.append("issue_date", issue_date);
    formData.append("expiry_date", expiry_date);
    formData.append("registration_number", registration_number);
    formData.append("logo", logo);

    const url = companyId? `/company/update/${companyId}` : "/addCompany";
    
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
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

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
      <Form onSubmit={(e) => companySubmit(e, false)}>
        {/* Company Name */}
        <Form.Group className="form-group">
          <Form.Label>Company Name *</Form.Label>
          <Form.Control
            type="text"
            value={companyData.name || ""}
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                name: ev.target.value,
              })
            }
            placeholder="Enter company name"
            required
          />
          {errors.name && (
            <p className="error-message">{errors.name[0]}</p>
          )}
        </Form.Group>

        {/* Phone */}
        <Form.Group className="form-group">
          <Form.Label>Phone *</Form.Label>
          <Form.Control
            type="text"
            value={companyData.phone || ""}
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                phone: ev.target.value,
              })
            }
            placeholder="Enter phone number"
            required
          />
          {errors.phone && (
            <p className="error-message">{errors.phone[0]}</p>
          )}
        </Form.Group>

        {/* Email */}
        <Form.Group className="form-group">
          <Form.Label>Email *</Form.Label>
          <Form.Control
            type="email"
            value={companyData.email || ""}
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                email: ev.target.value,
              })
            }
            placeholder="Enter email address"
            required
          />
          {errors.email && (
            <p className="error-message">{errors.email[0]}</p>
          )}
        </Form.Group>

        {/* Address */}
        <Form.Group className="form-group">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={companyData.address || ""}
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                address: ev.target.value,
              })
            }
            placeholder="Enter company address"
          />
          {errors.address && (
            <p className="error-message">{errors.address[0]}</p>
          )}
        </Form.Group>

        {/* Activity */}
        <Form.Group className="form-group">
          <Form.Label>Activity</Form.Label>
          <Form.Select
            value={companyData.activity || ""}
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                activity: ev.target.value,
              })
            }
          >
            <option value="">Select activity</option>
            {companyActivities.map((activity, index) => (
              <option key={index} value={activity}>
                {activity}
              </option>
            ))}
          </Form.Select>
          {errors.activity && (
            <p className="error-message">{errors.activity[0]}</p>
          )}
        </Form.Group>

        {/* License Number */}
        <Form.Group className="form-group">
          <Form.Label>License Number</Form.Label>
          <Form.Control
            type="text"
            value={
              companyData.license_no === "null" || companyData.license_no === null
                ? ""
                : companyData.license_no
            }
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                license_no: ev.target.value,
              })
            }
            placeholder="Enter license number"
          />
          {errors.license_no && (
            <p className="error-message">{errors.license_no[0]}</p>
          )}
        </Form.Group>

        {/* Registration Number */}
        <Form.Group className="form-group">
          <Form.Label>Registration Number</Form.Label>
          <Form.Control
            type="text"
            value={
              companyData.registration_number === "null" || companyData.registration_number === null
                ? ""
                : companyData.registration_number
            }
            onChange={(ev) =>
              setCompanyData({
                ...companyData,
                registration_number: ev.target.value,
              })
            }
            placeholder="Enter registration number"
          />
          {errors.registration_number && (
            <p className="error-message">{errors.registration_number[0]}</p>
          )}
        </Form.Group>

        {/* Issue Date */}
        <Form.Group className="form-group">
          <Form.Label>Issue Date</Form.Label>
          <DatePicker
            className="form-control"
            selected={
              companyData.issue_date
                ? new Date(companyData.issue_date)
                : new Date()
            }
            onChange={(date) => {
              const selectedDate = date ? new Date(date) : null;
              const updatedDate =
                selectedDate && !companyData.issue_date
                  ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
                  : selectedDate;
              setCompanyData({
                ...companyData,
                issue_date: updatedDate
                  ? updatedDate.toISOString().split("T")[0]
                  : "",
              });
            }}
            dateFormat="yyyy-MM-dd"
          />
          {errors.issue_date && (
            <p className="error-message">{errors.issue_date[0]}</p>
          )}
        </Form.Group>

        {/* Expiry Date */}
        <Form.Group className="form-group">
          <Form.Label>Expiry Date</Form.Label>
          <DatePicker
            className="form-control"
            selected={
              companyData.expiry_date
                ? new Date(companyData.expiry_date)
                : new Date()
            }
            onChange={(date) => {
              const selectedDate = date ? new Date(date) : null;
              const updatedDate =
                selectedDate && !companyData.expiry_date
                  ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
                  : selectedDate;
              setCompanyData({
                ...companyData,
                expiry_date: updatedDate
                  ? updatedDate.toISOString().split("T")[0]
                  : "",
              });
            }}
            dateFormat="yyyy-MM-dd"
          />
          {errors.expiry_date && (
            <p className="error-message">{errors.expiry_date[0]}</p>
          )}
        </Form.Group>

        {/* Logo Upload */}
        <Form.Group className="form-group">
          <Form.Label>Company Logo</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileInputChange}
            accept="image/*"
          />
          {errors.logo && (
            <p className="error-message">{errors.logo[0]}</p>
          )}
        </Form.Group>

        {/* Form Actions */}
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
      </Form>
    </div>
  );
}