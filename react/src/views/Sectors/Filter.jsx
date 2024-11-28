import {CardContent, TextField} from "@mui/material";
import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";

export default function Filter(props){
    const {search, query, setQuery, resetFilterParameter, handelFilter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;
    const [accounts, setAccounts] = useState([]);
    console.log(query);
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
                <Row className={"mb-3"}>
                    <Col xs={12} md={4}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Account</Form.Label>
                        <Form.Select value={query.payment_account_id} aria-label="payment_account_id" onChange={(e) => {
                            setQuery({...query, payment_account_id: e.target.value});
                        }}>
                            <option defaultValue>{"Account"}</option>
                            {accounts.length > 0 ? accounts.map(({
                                                                     id,
                                                                     bank_name,
                                                                     account_number
                                                                 }) => (
                                    <option key={id} value={id}>
                                        {bank_name + '(' + account_number + ')'}
                                    </option>
                                )) :
                                (<option defaultValue>{"Account"}</option>)
                            }
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="contract_start_date">
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Contract Start</Form.Label>
                            <Form.Control type="date" value={query.contract_start_date} onChange={(e) => {
                                setQuery({...query, contract_start_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="contract_end_date">
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Contract End</Form.Label>
                            <Form.Control type="date" value={query.contract_end_date} onChange={(e) => {
                                setQuery({...query, contract_end_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <Form.Group controlId="search">
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Search</Form.Label>
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
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Order By</Form.Label>
                        <Form.Select value={query.orderBy} aria-label="Order By" onChange={(e) => {
                            setQuery({...query, orderBy: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order by</option>
                            <option value="rent">Rent</option>
                            <option value="contract_start_date">Contract ending date</option>
                            <option value="contract_end_date">Contract starting date</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Order</Form.Label>
                        <Form.Select aria-label="Order" value={query.order} onChange={(e) => {
                            setQuery({...query, order: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order</option>
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Limit</Form.Label>
                        <Form.Select aria-label="order" value={query.limit} onChange={(e) => {
                            setQuery({...query, limit: e.target.value});
                        }}>
                            <option defaultValue value={''}>Limit</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                            <option value="500">1000</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2} style={{display:'flex',justifyContent:'end',alignItems:'flex-end'}}>
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