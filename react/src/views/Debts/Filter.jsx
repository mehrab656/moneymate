import React, {useEffect, useState} from "react";
import { Stack, Row, Col, Form, Button } from "react-bootstrap";
import {CardContent} from "@mui/material";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";

export default function Filter(props) {
    const { search, query, setQuery, resetFilterParameter,placeHolderTxt } = props;
    const [accounts, setAccounts] = useState([]);

    const {
        data: getBankData,
        isFetching: bankIsFetching,
        isError: bankFetchingDataError,
    } = useGetBankDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    useEffect(() => {
        if (getBankData?.data.length > 0) {
            setAccounts(getBankData?.data);
        }
    },[getBankData]);

    return (
        <>
            <CardContent style={{borderBottom: '1px solid'}}>
                <Row className="g-3">
                    <Col xs={12} md={3}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Account</Form.Label>
                        <Form.Select value={query.account_id} aria-label="Account" onChange={(e) => {
                            setQuery({...query, account_id: e.target.value});
                        }}>
                            <option defaultValue>{"Account"}</option>
                            {accounts.length > 0 ? accounts.map(({id, bank_name, account_number}) => (
                                    <option key={id} value={id}>
                                        {bank_name + '(' + account_number + ')'}
                                    </option>
                                )) :
                                (<option defaultValue>{"Account"}</option>)
                            }
                        </Form.Select>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="search">
                            <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }} >
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
                                size="sm"
                                value={query.orderBy}
                                onChange={(e) => setQuery({ ...query, orderBy: e.target.value })}
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
                                size="sm"
                                value={query.limit}
                                onChange={(e) => setQuery({ ...query, limit: e.target.value })}>
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
            </CardContent>
        </>
    );
}
