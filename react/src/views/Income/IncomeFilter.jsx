import React, {useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {CardContent, TextField} from "@mui/material";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";
import {useGetIncomeTypesDataQuery} from "../../api/slices/incomeSlice.js";

export default function IncomeFilter(props) {
    const {search, query, setQuery, resetFilterParameter, handelFilter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [incomeTypes, setIncomeTypes] = useState([]);
    // const {
    //     data: getCategoryListData,
    //     isFetching: categoryIsFetching,
    //     isError: categoryFetchingDataError,
    // } = useGetCategoryListDataQuery();
    const {
        data: getIncomeTypesData,
        isFetching: incomeTypeIsFetching,
        isError: incomeTypeFetchingDataError,
    } = useGetIncomeTypesDataQuery();

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
        if (getIncomeTypesData?.data.length > 0) {
            setIncomeTypes(getIncomeTypesData?.data);
        }
    },[getBankData,getIncomeTypesData]);

    return (
        <>
            <CardContent style={{borderBottom: '1px solid'}}>
                <Row className={"mb-3"}>
                    <Col xs={12} md={3}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Category</Form.Label>
                        <Form.Select value={query.category} aria-label="Category" onChange={(e) => {
                            setQuery({...query, category: e.target.value});
                        }}>
                            <option defaultValue>{"Filter by category"}</option>
                            {categories.length > 0 && categories.map(({slug,name}) => (
                                    <option key={slug} value={slug}>
                                        {name}
                                    </option>
                                )) }
                        </Form.Select>
                    </Col>

                    <Col xs={12} md={3}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Income Type</Form.Label>
                        <Form.Select value={query.income_type} aria-label="Income Type" onChange={(e) => {
                            setQuery({...query, income_type: e.target.value});
                        }}>
                            <option defaultValue>{"Filter by income type"}</option>
                            {incomeTypes.length > 0 && incomeTypes.map(({income_type}) => (
                                    <option key={income_type} value={income_type}>
                                        {income_type.replaceAll('_',' ').toUpperCase()}
                                    </option>
                                )) }
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={3}>
                        <Form.Group controlId="from_date">
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">From</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.from_date} onChange={(e) => {
                                setQuery({...query, from_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={3}>
                        <Form.Group controlId="to_date">
                            <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">To</Form.Label>
                            <Form.Control size={"sm"} type="date" value={query.to_date} onChange={(e) => {
                                setQuery({...query, to_date: e.target.value});
                            }}/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>

                    <Col xs={12} md={3}>
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
                    <Col xs={12} md={2}>
                        <Form.Label style={{marginBottom: '0px'}} className="custom-form-label">Order By</Form.Label>
                        <Form.Select value={query.orderBy} aria-label="Order By" onChange={(e) => {
                            setQuery({...query, orderBy: e.target.value});
                        }}>
                            <option defaultValue value={''}>Order by</option>
                            <option value="investment_date">Date</option>
                            <option value="amount">Amount</option>
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
                        </Form.Select>
                    </Col>
                </Row>
            </CardContent>
        </>
    )
}