import { Tab, Form, Card, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useUpdateBasicInfoMutation,useGetSingleUserDataQuery } from "../../../../api/slices/userSlice.js";
import { notification } from "../../../../components/ToastNotification.jsx";
import {useParams} from "react-router-dom";

const _initials = {
  id: null,
  first_name: "",
  last_name: "",
  dob: "",
  gender: "",
};
export default function BasicInfo() {
  const [data, setData] = useState(_initials);
  const [btnText, setBtnText] = useState("Update");
  let {id} = useParams();
  const [updateBasicData] = useUpdateBasicInfoMutation();
  const {data: getUserData } = useGetSingleUserDataQuery({ id:id});


  const updateBasicInfo = async (event) => {
    event.preventDefault();
    setBtnText("Updating...");
    // event.currentTarget.disabled = true;

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("dob", data.dob);
    formData.append("gender", data.gender);
    try {
      const data = await updateBasicData({
        url: `/update-basic-info/${id}`,
        formData,
      }).unwrap();
      notification("success", data?.message, data?.description);
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
  useEffect(() => {

    if (id && getUserData){
      data.first_name = getUserData.first_name;
      data.last_name = getUserData.last_name;
      data.dob = getUserData.dob;
      data.gender = getUserData.gender;
    }
  }, [getUserData]);
  return (
    <>
      <Tab.Pane eventKey="basic">
        <Card>
          <Card.Title className={"mb-5"}>Basic Info</Card.Title>
          <Form>
                      <Row>
                        <Col xs={6} sm={6}>
                          <Form.Group className="mb-3" controlId="first_name">
                            <Form.Label
                                style={{ marginBottom: "0px" }}
                                className="custom-form-label"
                            >
                              First Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="i.g: John Doe"
                                value={data.first_name}
                                onChange={(e) => {
                                  setData({ ...data, first_name: e.target.value });
                                }}
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={6} sm={6}>
                          <Form.Group className="mb-3" controlId="last_name">
                            <Form.Label
                                style={{ marginBottom: "0px" }}
                                className="custom-form-label"
                            >
                              Last Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="i.g: John Doe"
                                value={data.last_name}
                                onChange={(e) => {
                                  setData({ ...data, last_name: e.target.value });
                                }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={6} sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label
                                style={{ marginBottom: "0px" }}
                                className="custom-form-label"
                            >
                              Gender
                            </Form.Label>
                            <Form.Select
                                aria-label="gender"
                                onChange={(e) => {
                                  setData({ ...data, gender: e.target.value });
                                }}
                            >
                              <option>Select Gender</option>
                              <option value="man" selected={data.gender === "man"}>
                                Man
                              </option>
                              <option value="women" selected={data.gender === "woman"}>
                                Women
                              </option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={6} sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label
                                style={{ marginBottom: "0px" }}
                                className="custom-form-label"
                            >
                              Date of Birth
                            </Form.Label>
                            <Form.Control
                                type="date"
                                placeholder="i.g: John Doe"
                                value={data.dob ?? "1971-01-01"}
                                onChange={(e) => {
                                  setData({ ...data, dob: e.target.value });
                                }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button onClick={(e) => updateBasicInfo(e)} className="custom-btn">
                        {btnText}
                      </Button>
                    </Form>
        </Card>
      </Tab.Pane>
    </>
  );
}
