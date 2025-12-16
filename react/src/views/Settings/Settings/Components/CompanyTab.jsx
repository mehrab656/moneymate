import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import React from "react";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../../styles/formThemeStyles.js";

export default function CompanyTab({ settings, handleFunc, submit }) {
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const labelStyle = { ...inputGroupTextStyle, minWidth: 200 };
  return (
    <>
      <Container>
        <Form>
          <Row>
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_company_name" style={labelStyle}>Company Name</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_company_name"
                  name="company_name"
                  type="text"
                  placeholder="Enter company name"
                  value={settings.company_name || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_web_site" style={labelStyle}>Web Site</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_web_site"
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
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_phone" style={labelStyle}>Company Phone</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_phone"
                  name="phone"
                  type="text"
                  placeholder="055..."
                  value={settings.phone || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_landline_number" style={labelStyle}>Landline Number</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_landline_number"
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
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_address" style={labelStyle}>Company Address</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_address"
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
