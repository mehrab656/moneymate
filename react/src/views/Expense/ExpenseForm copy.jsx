import {Button, Col, Container, Form, Nav, Row, Tab} from "react-bootstrap";
import React from "react";

<Tab.Container id="left-tabs-example" defaultActiveKey="sectors">
  <Col sm={4}>
    <Nav variant="pills" className="flex-column">
      <Nav.Item>
        <Nav.Link eventKey="first">Sectors</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="categories">Categories</Nav.Link>
      </Nav.Item>
    </Nav>
  </Col>
  <Col sm={8}>
    <Tab.Content>
      <Tab.Pane eventKey="sectors">
        <Container>
          {/* Form Inputs */}
          <Row className="g-3">
            <Col md={4}>
              <Form.Group controlId="search">
                <Form.Label className="custom-form-label" style={{marginBottom: "0px"}}>
                  Search
                </Form.Label>
                <Form.Control
                    type="text"
                    size="sm"
                    value={query?.searchTerm}
                    onChange={(e) => setQuery({...query, searchTerm: e.target.value})}
                    placeholder={placeHolderTxt}
                    style={{textTransform: "capitalize"}}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="start-date">
                <Form.Label className="custom-form-label" style={{marginBottom: "0px"}}>
                  From
                </Form.Label>
                <Form.Control
                    type="date"
                    size="sm"
                    value={query.start_date}
                    onChange={(e) => setQuery({...query, start_date: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="end-date">
                <Form.Label className="custom-form-label" style={{marginBottom: "0px"}}>
                  To
                </Form.Label>
                <Form.Control
                    type="date"
                    size="sm"
                    value={query.end_date}
                    onChange={(e) => setQuery({...query, end_date: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="order">
                <Form.Label className="custom-form-label" style={{marginBottom: "0px"}}>
                  Order
                </Form.Label>
                <Form.Select
                    size="sm"
                    value={query.orderBy}
                    onChange={(e) => setQuery({...query, orderBy: e.target.value})}
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="limit">
                <Form.Label className="custom-form-label" style={{marginBottom: "0px"}}>
                  Limit
                </Form.Label>
                <Form.Select
                    size="sm"
                    value={query.limit}
                    onChange={(e) => setQuery({...query, limit: e.target.value})}>
                  <option value="">Limit</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Filter and Reset Buttons */}
          <Row className="justify-content-end">
            <Col md={4} className="text-end">
              <Button variant="warning" size="sm" onClick={resetFilterParameter}>
                Reset
              </Button>
            </Col>
          </Row>
        </Container>

      </Tab.Pane>
      <Tab.Pane eventKey="categories">Second tab content</Tab.Pane>
    </Tab.Content>
  </Col>
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
