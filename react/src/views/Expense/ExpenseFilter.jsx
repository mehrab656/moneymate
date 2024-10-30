import React, { useEffect, useState } from "react";
import { Card, Stack, Row, Col, Form, Button } from "react-bootstrap";

export default function ExpenseFilter(props) {
  const { search, query, setQuery, resetFilterParameter,placeHolderTxt } = props;
  return (
    <>
     <Card className="p-3" style={{ borderBottom: "1px solid" }}>
      <Stack gap={3}>
        {/* Form Inputs */}
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="search">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Search
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={query?.searchTerm}
                onChange={(e) => setQuery({ ...query, searchTerm: e.target.value })}
                placeholder={placeHolderTxt}
                style={{ textTransform: "capitalize" }}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group controlId="start-date">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                From
              </Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={query.start_date}
                onChange={(e) => setQuery({ ...query, start_date: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group controlId="end-date">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                To
              </Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={query.end_date}
                onChange={(e) => setQuery({ ...query, end_date: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group controlId="order">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Order
              </Form.Label>
              <Form.Select
                size="md"
                value={query.order}
                onChange={(e) => setQuery({ ...query, order: e.target.value })}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group controlId="limit">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Limit
              </Form.Label>
              <Form.Select
                size="md"
                value={query.limit}
                onChange={(e) => setQuery({ ...query, limit: e.target.value })}
              >
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
      </Stack>
    </Card>
    </>
  );
}
