import {Button, Col, Container, Form, Nav, Row, Tab} from "react-bootstrap";
import React from "react";

<Tab.Container id="left-tabs-example" defaultActiveKey="sectors">

</Tab.Container>







import React from "react";
import {Modal} from "react-bootstrap";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

export default function ExpenseFilter(props) {
  const { query, setQuery, resetFilterParameter,placeHolderTxt,handelFilter } = props;
  return (
      <>
        <Modal size={"sm"} show={true} centered onHide={handelFilter} className="custom-modal ">
          <Modal.Body>
            <Tab.Container id="expense-filter-tab" defaultActiveKey="sector">
              <Row>
                <Col md={5}>
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link eventKey="sector">Sectors</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="category">Category</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="others">Others</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col md={7}>
                  <Tab.Content>
                    <Tab.Pane eventKey="sector">First tab content</Tab.Pane>
                    <Tab.Pane eventKey="category">Second tab content</Tab.Pane>
                    <Tab.Pane eventKey="others">Others</Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Modal.Body>
        </Modal>
      </>
  );
}

