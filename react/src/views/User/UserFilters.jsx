import React, {useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {CardContent, TextField} from "@mui/material";
import axiosClient from "../../axios-client.js";


const orderByColumns = ['id','name','created_at'];
const orderColumns = ['ASC','DESC'];
const limits =[10,50,100,500];

export default function UserFilters(props) {
    const {search, query, setQuery,resetFilterParameter,getUser,handelFilter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;


    const [roleLists, setRoleLists]=useState([]);
    useEffect(() => {
        axiosClient.get('/roles-by-company', {
        }).then(({data}) => {
            setRoleLists(data.data);
        }).catch(error => {
            console.error('Error loading role list:', error);
        });

    }, []);
    return (
        <>
            <CardContent style={{borderBottom: '1px solid'}}>
                <Row className={"mb-3"}>
                    <Col xs={12} md={3}>
                        <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Roles</Form.Label>
                        <Form.Select size={"sm"} value={query.role} aria-label="Roles" onChange={(e) => {
                            setQuery({...query, role: e.target.value});
                        }}>
                            <option defaultValue>{"IncomeFilter by Roles"}</option>
                            {roleLists.length > 0 ? roleLists.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.role.toUpperCase()}
                                    </option>
                                )) :
                                (<option defaultValue>{"IncomeFilter by Roles"}</option>)
                            }
                        </Form.Select>
                    </Col>
                    {
                        orderByColumns.length>0 &&
                        <Col xs={12} md={3}>
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order By</Form.Label>
                            <Form.Select size={"sm"} value={query.orderBy} aria-label="Order By" onChange={(e) => {
                                setQuery({...query, orderBy: e.target.value});
                            }}>
                                <option defaultValue value={''}>Order by</option>
                                {
                                    orderByColumns.map(item=> (
                                        <option value={item} key={'user-filter-order-by'+item} >{item.replaceAll('_',' ').toUpperCase()}</option>
                                    ))
                                }
                            </Form.Select>
                        </Col>
                    }
                    {
                        orderColumns.length>0 &&
                        <Col xs={12} md={3}>
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Order</Form.Label>
                            <Form.Select size={"sm"} aria-label="Order" value={query.order} onChange={(e) => {
                                setQuery({...query, order: e.target.value});
                            }}>
                                <option defaultValue value={''}>Order by</option>
                                {
                                    orderColumns.map(item=> (
                                        <option value={item} key={'user-filter-order'+item} >{item.replaceAll('_',' ').toUpperCase()}</option>
                                    ))
                                }
                            </Form.Select>
                        </Col>
                    }

                    {
                        limits.length>0 &&
                        <Col xs={12} md={3}>
                            <Form.Label style={{marginBottom:'0px'}} className="custom-form-label">Limit</Form.Label>
                            <Form.Select size={"sm"} aria-label="order" value={query.limit} onChange={(e) => {
                                setQuery({...query, limit: e.target.value});
                            }}>
                                <option defaultValue value={''}>Limit</option>
                                {
                                    limits.map(item=> (
                                        <option value={item} key={'user-filter-order'+item} >{item}</option>
                                    ))
                                }
                            </Form.Select>
                        </Col>
                    }

                </Row>
                <Row>
                    <Col xs={12} md={10}>
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