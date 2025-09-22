import { Tab, Form, Card, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import {useGetSingleUserDataQuery, useUpdateEmploymentInfoMutation} from "../../../../api/slices/userSlice.js";
import { notification } from "../../../../components/ToastNotification.jsx";
import {useParams} from "react-router-dom";

const _initials = {
  date_of_joining:"",
  phone:"",
  position:"",
  salary:"",
  accommodation_cost:"",
  emergency_contact:"",
  employee_code:"",
  designation:"",
  department:"",
  employment_type:"",
  address:"",
  city:"",
  state:"",
  country:"",
  national_id:"",
  passport_no:"",
  emirates_id:"",
  visa_status:"",
  emirate_id_copy:"",
  passport_copy:"",
  status:"",
};

export default function EmploymentInfo({ user }) {
  const [data, setData] = useState(_initials);
  const [btnText, setBtnText] = useState("Update");
  let {id} = useParams();
  const {data: getUserData } = useGetSingleUserDataQuery({ id:id});
 const [previewPassport, setPreviewPassport]= useState(null);
 const [previewEmirateId, setPreviewEmirateId]= useState(null);


  useEffect(() => {
    if (getUserData) {
      const employmentData= user.employeeData;
      setData({
        ...data,
        date_of_joining: employmentData.joining_date,
        phone: employmentData.phone,
        position: employmentData.position,
        salary: employmentData.salary ,
        accommodation_cost: employmentData.accommodation_cost ,
        emergency_contact: employmentData.emergency_contact ,
        employee_code: employmentData.extras.employee_code,
        designation: employmentData.extras.designation,
        department: employmentData.extras.department,
        employment_type: employmentData.extras.employment_type,
        address: employmentData.extras.address ,
        city: employmentData.extras.city ,
        state: employmentData.extras.state ,
        country: employmentData.extras.country ,
        national_id: employmentData.extras.national_id ,
        passport_no: employmentData.extras.passport_no ,
        emirates_id: employmentData.extras.emirates_id ,
        visa_status: employmentData.extras.visa_status ,
        status: employmentData.extras.status ,
      });
      setPreviewPassport(employmentData.passport_file_name);
      setPreviewEmirateId(employmentData.emirate_file_name);
    }
  }, [getUserData]);

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

    if (data.emirate_id_copy){
      formData.append("emirate_id_copy", data.emirate_id_copy);
    }
    if (data.passport_copy){
      formData.append("passport_copy", data.passport_copy);
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
        err?.message ,
        err?.description ,
      );
    }
  };
  const handleFileInputChange = (event, name) => {
    const file = event.target.files[0];
    if (name==='passport'){
      setData({ ...data, passport_copy: file });
      setPreviewPassport(URL.createObjectURL(file));
    } else{
      setData({...data, emirate_id_copy: file});
      setPreviewEmirateId(URL.createObjectURL(file));
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
                      style={{marginBottom: "0px"}}
                      className="custom-form-label"
                  >
                    Passport
                  </Form.Label>
                  <div className={"user-profile-section"}>
                        <div className={"image-preview"}>
                          <img
                              src={previewPassport}
                              alt="Uploaded"
                              style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "10px",
                                objectFit: "cover"
                              }}
                          />
                        </div>

                    <input type="file" accept="image/*" onChange={e=>{handleFileInputChange(e,'passport')}}/>
                  </div>
                </Form.Group>
              </Col>
              <Col xs={6} sm={6}>
                <Form.Group className="mb-3" controlId="emirate_id_copy">
                  <Form.Label
                      style={{marginBottom: "0px"}}
                      className="custom-form-label"
                  >
                    Emirates ID
                  </Form.Label>
                  <div className={"user-profile-section"}>
                        <div className={"image-preview"}>
                          <img
                              src={previewEmirateId}
                              alt="Uploaded"
                              style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "10px",
                                objectFit: "cover"
                              }}
                          />
                        </div>
                    <input type="file" accept="image/*" onChange={e => {
                      handleFileInputChange(e, 'emirateId')
                    }}/>
                  </div>

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