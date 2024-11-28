import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WizCard from "../../components/WizCard.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { Col, Form, Modal, Row, Button } from "react-bootstrap";
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
  extra: null,
  logo: null,
};
export default function CompanyForm({ handelCloseModal, id }) {
  const [companyData, setCompanyData] = useState(_initialCompany);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  // api call
  const {
    data: getSingleCompanyData,
    isFetching: singleCompanyFetching,
    isError: singleCompanyDataError,
  } = useGetSingleCompanyDataQuery({ id });

  const [createCompany] = useCreateCompanyMutation();

  useEffect(() => {
    if (getSingleCompanyData) {
      setCompanyData((prevExpense) => ({
        ...prevExpense,
        ...getSingleExpenseData,
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

  const companySubmit = async (event, stay) => {
    event.preventDefault();
    // event.currentTarget.disabled = true;
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
      extra,
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
    formData.append("extra", extra);
    formData.append("logo", logo);

    const url = companyData.id ? `/company/update/${companyData?.id}` : "/addCompany";
    try {
      const data = await createCompany({ url: url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (!stay) {
        handelCloseModal();
      } else {
        setCompanyData(_initialExpense);
      }
    } catch (err) {
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setCompanyData((prevExpense) => {
      return { ...prevExpense, logo: file };
    });
  };

  return (
    <>
      <Modal
        show={true}
        centered
        onHide={handelCloseModal}
        backdrop="static"
        keyboard={false}
        size={"lg"}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>{id ? "Update" : "Add"} Company</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MainLoader loaderVisible={loading} />
          <WizCard className="animated fadeInDown">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={companyData.name === null ? "" : companyData.name}
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          name: ev.target.value,
                        })
                      }
                      placeholder="Company Name. ig: ABC company"
                    />
                    {errors.name && (
                      <p className="error-message mt-2">{errors.name[0]}</p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="number"
                      value={
                        companyData.phone === null ? "" : companyData.phone
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          phone: ev.target.value,
                        })
                      }
                      placeholder="Phone. ig: +971... or 0567..."
                    />
                    {errors.phone && (
                      <p className="error-message mt-2">{errors.phone[0]}</p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={
                        companyData.email === null ? "" : companyData.email
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          email: ev.target.value,
                        })
                      }
                      placeholder="Email. ig: abc@...com"
                    />
                    {errors.email && (
                      <p className="error-message mt-2">{errors.email[0]}</p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        companyData.address === null ? "" : companyData.address
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          address: ev.target.value,
                        })
                      }
                      placeholder="Address. Area: abc, Flat:#33..."
                    />
                    {errors.address && (
                      <p className="error-message mt-2">{errors.address[0]}</p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Activity</Form.Label>
                    <Form.Select
                      value={companyData.activity?.toLowerCase() || ""}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          activity: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Activity</option>
                      {companyActivities &&
                        companyActivities?.length > 0 &&
                        companyActivities?.map((activity) => (
                          <option key={activity} value={activity}>
                            {activity.toUpperCase()}
                          </option>
                        ))}
                    </Form.Select>
                    {errors.user_id && (
                      <p className="text-danger mt-2">{errors.user_id[0]}</p>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label> License No.</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        companyData.license_no === null
                          ? ""
                          : companyData.license_no
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          license_no: ev.target.value,
                        })
                      }
                      placeholder="License Number"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label> Registration No.</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        companyData.registration_number !== "null"
                          ? companyData.registration_number
                          : ""
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          registration_number: ev.target.value,
                        })
                      }
                      placeholder="Registration Number"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
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
                            ? new Date(
                                selectedDate.getTime() + 24 * 60 * 60 * 1000
                              )
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
                      <p className="error-message mt-2">
                        {errors.issue_date[0]}
                      </p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
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
                            ? new Date(
                                selectedDate.getTime() + 24 * 60 * 60 * 1000
                              )
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
                      <p className="error-message mt-2">
                        {errors.expiry_date[0]}
                      </p>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label> Extra.</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        companyData.extra !== "null" ? companyData.extra : ""
                      }
                      onChange={(ev) =>
                        setCompanyData({
                          ...companyData,
                          extra: ev.target.value,
                        })
                      }
                      placeholder="Extra"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Logo</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleFileInputChange}
                      placeholder="Company Logo"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-end">
                {companyData.id ? (
                  <Button
                    variant="warning"
                    onClick={(e) => companySubmit(e, false)}
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      onClick={(e) => companySubmit(e, true)}
                      className="me-2"
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={(e) => companySubmit(e, false)}
                    >
                      Save and Exit
                    </Button>
                  </>
                )}
              </div>
            </Form>
          </WizCard>
        </Modal.Body>
      </Modal>
    </>
  );
}
