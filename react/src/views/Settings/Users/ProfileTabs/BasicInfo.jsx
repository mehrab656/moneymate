import { Tab, Form, Card, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../../axios-client.js";
import { useStateContext } from "../../../../contexts/ContextProvider.jsx";
import {
  useUpdateBasicInfoMutation,
  useUpdateMyBasicInfoMutation,
  useGetSingleUserDataQuery,
} from "../../../../api/slices/userSlice.js";
import { notification } from "../../../../components/ToastNotification.jsx";
import { useParams } from "react-router-dom";

const _initials = {
  id: null,
  username: "",
  first_name: "",
  last_name: "",
  dob: "",
  gender: "",
  phone: "",
  emergency_contract: "",
  email: "",
  avatar: null,
};
export default function BasicInfo({ user }) {
  const [data, setData] = useState(_initials);
  const [btnText, setBtnText] = useState("Update");
  let { id } = useParams();
  const [updateBasicData] = useUpdateBasicInfoMutation();
  const [updateMyBasicData] = useUpdateMyBasicInfoMutation();
  const { data: getUserData } = useGetSingleUserDataQuery(
    { id },
    { skip: !id }
  );
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null);
  const { setUser } = useStateContext();

  const refreshMyProfileWithRetry = async (maxAttempts = 2, delayMs = 600) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        const { data: myProfile } = await axiosClient.get("/my-profile");
        if (myProfile) {
          setUser(myProfile);
          localStorage.setItem("ACCESS_USER", JSON.stringify(myProfile));
          setCurrentProfilePicture(myProfile.avatar ?? currentProfilePicture);
          return true;
        }
      } catch (e) {
        // Common first-call CORS hiccup: wait and retry once
        await new Promise((res) => setTimeout(res, delayMs));
      }
      attempt++;
    }
    return false;
  };

  const updateBasicInfo = async (event) => {
    event.preventDefault();
    setBtnText("Updating...");
    // event.currentTarget.disabled = true;

    // Build a single payload for basic + contacts + avatar
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("dob", data.dob ? data.dob : "");
    formData.append("gender", data.gender);
    formData.append("phone", data.phone);
    formData.append("emergency_contact", data.emergency_contract);
    formData.append("email", data.email);
    if (data.avatar) {
      formData.append("profile_picture", data.avatar);
    }
    try {
      let result;
      if (id) {
        const url = `/update-basic-info/${id}`;
        result = await updateBasicData({ url, formData }).unwrap();
      } else {
        result = await updateMyBasicData({ formData }).unwrap();
        // Refresh current user with a short retry to bypass intermittent CORS
        await refreshMyProfileWithRetry(2, 600);
      }
      const msg = result?.message;
      const desc = result?.description;
      notification("success", msg, desc);
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
    if (id && getUserData) {
      setData((prev) => ({
        ...prev,
        username: getUserData.username ?? "",
        first_name: getUserData.first_name ?? "",
        last_name: getUserData.last_name ?? "",
        dob: getUserData.dob ?? "",
        gender: getUserData.gender ?? "",
        phone: getUserData.phone ?? "",
        emergency_contract:
          getUserData.emergency_contact ?? getUserData.emergency_contract ?? "",
        email: getUserData.email ?? "",
      }));
      setCurrentProfilePicture(getUserData.avatar ?? null);
    } else if (!id && user) {
      setData((prev) => ({
        ...prev,
        username: user.username ?? "",
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        dob: user.dob ?? "",
        gender: user.gender ?? "",
        phone: user.phone ?? "",
        emergency_contract:
          user.emergency_contact ?? user.emergency_contract ?? "",
        email: user.email ?? "",
      }));
      setCurrentProfilePicture(user.avatar ?? null);
    }
  }, [id, getUserData, user]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentProfilePicture(URL.createObjectURL(file));
      setData((prev) => ({ ...prev, avatar: file }));
    }
  };
  return (
    <>
      <Tab.Pane eventKey="basic">
        <Card>
          <Card.Title className={"mb-5"}>Basic Info</Card.Title>
          <Form>
            <Row>
              <Col xs={12} sm={12}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="i.g: johndoe"
                    value={data.username}
                    onChange={(e) => {
                      setData({ ...data, username: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
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
                    value={data.gender || ""}
                    onChange={(e) => {
                      setData({ ...data, gender: e.target.value });
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="man">Man</option>
                    <option value="woman">Women</option>
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
                    placeholder="YYYY-MM-DD"
                    value={data.dob || ""}
                    onChange={(e) => {
                      setData({ ...data, dob: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={8}>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Phone
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="i.g: +971212312..."
                    value={data.phone}
                    onChange={(e) => {
                      setData({ ...data, phone: e.target.value });
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="emergency_contract">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Emergency Contact
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="i.g: +88123123...."
                    value={data.emergency_contract}
                    onChange={(e) => {
                      setData({ ...data, emergency_contract: e.target.value });
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label
                    style={{ marginBottom: "0px" }}
                    className="custom-form-label"
                  >
                    Email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="i.g: john.dow@exm.co...."
                    value={data.email}
                    onChange={(e) => {
                      setData({ ...data, email: e.target.value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={4} sm={4}>
                <div className={"user-profile-section"}>
                  <div style={{ marginTop: "20px" }}>
                    {currentProfilePicture && (
                      <img
                        src={currentProfilePicture}
                        alt="Uploaded"
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "10px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
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
