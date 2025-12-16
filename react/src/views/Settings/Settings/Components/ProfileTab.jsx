import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import React from "react";
import { Button } from "@mui/material";
import axiosClient from "../../../../axios-client.js";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../../styles/formThemeStyles.js";

export default function ProfileTab({ settings, handleFunc, submit }) {
  const testNotification = ()=>{


    axiosClient
        .get("/upcoming-payments")
        .then(({ data }) => {
        })
        .catch(() => {
          setLoading(false);
        });



  }
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const labelStyle = { ...inputGroupTextStyle, minWidth: 200 };
  return (
    <>
      <Container>
        <Row className="mb-2">
          <Col className="text-end">
            <Button onClick={testNotification} className="custom-btn">
              TEST
            </Button>
          </Col>
        </Row>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="profile_company_name" style={labelStyle}>Company Name</InputGroup.Text>
                <Form.Control
                  aria-describedby="profile_company_name"
                  name="company_name"
                  type="text"
                  placeholder="Enter company name"
                  value={settings.company_name || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="profile_web_site" style={labelStyle}>Web Site</InputGroup.Text>
                <Form.Control
                  aria-describedby="profile_web_site"
                  name="web_site"
                  type="text"
                  placeholder="companydomainname.com"
                  value={settings.web_site || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="profile_phone" style={labelStyle}>Company Phone</InputGroup.Text>
                <Form.Control
                  aria-describedby="profile_phone"
                  name="phone"
                  type="text"
                  placeholder="055..."
                  value={settings.phone || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={6}>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="profile_landline_number" style={labelStyle}>Landline Number</InputGroup.Text>
                <Form.Control
                  aria-describedby="profile_landline_number"
                  name="landline_number"
                  type="text"
                  placeholder="044..."
                  value={settings.landline_number || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="profile_address" style={labelStyle}>Company Address</InputGroup.Text>
                <Form.Control
                  aria-describedby="profile_address"
                  name="address"
                  as="textarea"
                  rows={3}
                  placeholder="Enter company address"
                  value={settings.address || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
