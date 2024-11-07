import React, {useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {CardContent, TextField} from "@mui/material";
import axiosClient from "../../../axios-client.js";
import { useGetAllEmployeeDataQuery } from "../../../api/slices/employeeSlice.js";
export default function TaskFilters(props) {
    const {search, query, setQuery,resetFilterParameter,getTask,handelFilter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;

    const { data: getAllEmployeeData,isFetching: allEmployeeDataFetching, isError: allEmployeeDataDataError,} = useGetAllEmployeeDataQuery({
        currentPage: "",
        pageSize: 100,
      });
    return (
        <>
            <CardContent style={{borderBottom: '1px solid'}}>
                <Row className={"mb-3"}>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Payment</Form.Label>
                        <Form.Select size={"sm"} value={query.payment_status} aria-label="Payment Status" onChange={(e) => {
                            setQuery({...query, payment_status: e.target.value});
                        }}>
                            <option defaultValue value={''}>Select Payment Status</option>
                            <option value="pending">Pending</option>
                            <option value="partial_paid">Partially Paid</option>
                            <option value="paid">Paid</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Assign</Form.Label>
                        <Form.Select size={"sm"} value={query.employee_id} aria-label="Assign to" onChange={(e) => {
                            setQuery({...query, employee_id: e.target.value});
                        }}>
                            <option defaultValue>{"Task Assign to"}</option>
                            {getAllEmployeeData?.data?.length > 0 ? getAllEmployeeData?.data.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </option>
                                )) :
                                (<option defaultValue>{"Task Assign to"}</option>)
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Status</Form.Label>
                        <Form.Select size={"sm"} aria-label="Task Status"
                                     value={query.status} onChange={(e) => {
                            setQuery({...query, status: e.target.value});
                        }}>
                            <option defaultValue value={''}>Status</option>
                            <option value="pending">Pending</option>
                            <option value="hold">Hold</option>
                            <option value="complete">Complete</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order By</Form.Label>
                        <Form.Select size={"sm"} value={query.orderBy} aria-label="Order By" onChange={(e) => {
                            setQuery({...query, orderBy: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order by</option>
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                            <option value="paid">Paid Amount</option>
                            <option value="start_time">Starting Time</option>
                            <option value="end_time">End Time</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order</Form.Label>
                        <Form.Select size={"sm"} aria-label="Order" value={query.order} onChange={(e) => {
                            setQuery({...query, order: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order</option>
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Limit</Form.Label>
                        <Form.Select size={"sm"} aria-label="order" value={query.limit} onChange={(e) => {
                            setQuery({...query, limit: e.target.value});
                        }}>
                            <option defaultValue value={''}>Limit</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="search">
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Search</Form.Label>
                            <TextField
                                sx={{
                                    textTransform: 'capitalize',
                                }}
                                size="small"
                                fullWidth
                                value={searchBoxValue}
                                onChange={(event) => handelSearch(event.target.value)}
                                placeholder={placeHolderTxt}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Group controlId="date">
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">From</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.start_date} onChange={(e) => {
                                setQuery({...query, start_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Group controlId="date">
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">To</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.end_date} onChange={(e) => {
                                setQuery({...query, end_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4} style={{display:'flex',justifyContent:'end',alignItems:'flex-end'}}>
                        <div className={"text-end"}>
                            <button className={'btn btn-success btn-sm mr-2'} onClick={handelFilter}>Filter</button>
                            <button className="btn btn-warning btn-sm" type="reset" onClick={resetFilterParameter}>Reset
                            </button>
                        </div>
                    </Col>
                </Row>
            </CardContent>
        </>
    )
}