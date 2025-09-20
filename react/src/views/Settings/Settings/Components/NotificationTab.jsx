import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";

export default function ProfileTab({ settings, handleFunc, submit }) {
  return (
    <>
      <Container>
        <Form>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="company.name">
                <Form.Label>{"Company Name"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="abc company"
                  value={settings.company_name}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="company.site">
                <Form.Label>{"Web Site"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="companydomainname.com"
                  value={settings.web_site}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="company.phone">
                <Form.Label>{"Company Phone"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="055..."
                  value={settings.phone}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="company.landline">
                <Form.Label>{"Company Landline Number"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="044..."
                  value={settings.landline_number}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="company.address">
                <Form.Label>Company Address</Form.Label>
                <Form.Control
                  value={settings.address}
                  onChange={handleFunc}
                  as="textarea"
                  rows={3}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
