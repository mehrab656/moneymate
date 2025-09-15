import React, {useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {CardContent, TextField} from "@mui/material";
import {useGetInvestorDataQuery} from "../../../api/slices/userSlice.js";

export default function InvestmentFilter(props) {
    const {search, query, setQuery,resetFilterParameter,handelFilter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;

    const { data: getInvestorData,isFetching: investorIsFetching, isError: investorFetchingDataError,} = useGetInvestorDataQuery({
        currentPage: "",
        pageSize: 100,
    });
    return (
        <>
            <CardContent style={{borderBottom: '1px solid'}}>
                <Row className={"mb-3"}>
                    <Col xs={12} md={4}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Investor</Form.Label>
                        <Form.Select  value={query.investor_id} aria-label="Assign to" onChange={(e) => {
                            setQuery({...query, investor_id: e.target.value});
                        }}>
                            <option defaultValue>{"Investor"}</option>
                            {getInvestorData?.data?.length > 0 ? getInvestorData?.data.map((investor) => (
                                    <option key={investor.slug} value={investor.slug}>
                                        {investor.full_name}
                                    </option>
                                )) :
                                (<option defaultValue>{"Investor"}</option>)
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="from_date">
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">From</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.from_date} onChange={(e) => {
                                setQuery({...query, from_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="to_date">
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">To</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.to_date} onChange={(e) => {
                                setQuery({...query, to_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6}>
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
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order By</Form.Label>
                        <Form.Select  value={query.orderBy} aria-label="Order By" onChange={(e) => {
                            setQuery({...query, orderBy: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order by</option>
                            <option value="investment_date">Date</option>
                            <option value="amount">Amount</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order</Form.Label>
                        <Form.Select aria-label="Order" value={query.order} onChange={(e) => {
                            setQuery({...query, order: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order</option>
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Limit</Form.Label>
                        <Form.Select aria-label="order" value={query.limit} onChange={(e) => {
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
            </CardContent>
        </>
    )
}