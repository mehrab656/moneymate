import React, { useEffect, useState, useContext } from "react";
import { Col, Form, Row, InputGroup } from "react-bootstrap";
import { CardContent } from "@mui/material";
import axiosClient from "../../../axios-client.js";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";


const orderByColumns = ['id','name','created_at'];
const orderColumns = ['ASC','DESC'];
const limits =[10,50,100,500];

export default function UserFilters(props) {
    const {search, query, setQuery, resetFilterParameter} = props;
    const {placeHolderTxt, searchBoxValue, handelSearch} = search;

    const [roleLists, setRoleLists]=useState([]);
    const theme = useTheme();
    const { themeMode } = useContext(SettingsContext);
    const isDark = themeMode === "dark";
    const inputFontSize = "0.875rem";
    const selectStyles = createSelectStyles(theme, inputFontSize);
    const inputGroupTextStyle = createInputGroupTextStyle(theme);
    const inputStyle = {
        backgroundColor: isDark ? "#1c1f24" : "#fff",
        color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
        borderColor: isDark ? "#3a4048" : "#c5ccd6",
        fontSize: inputFontSize,
        minHeight: 36,
    };
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
                  {/* Search */}
                    <Col xs={12} md={4}>
                        <InputGroup className="mb-3" size="sm">
                            <InputGroup.Text id="user_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                            <Form.Control
                                aria-describedby="user_search"
                                type="text"
                                size="sm"
                                value={searchBoxValue}
                                onChange={(event) => handelSearch(event.target.value)}
                                placeholder={placeHolderTxt}
                                style={{ ...inputStyle, textTransform: "capitalize" }}
                            />
                        </InputGroup>
                    </Col>
                    {/* Roles */}
                    <Col xs={12} md={3}>
                        <InputGroup className="mb-3" size="sm">
                            <InputGroup.Text id="user_role" style={inputGroupTextStyle}>Roles</InputGroup.Text>
                            <div className="flex-grow-1">
                                <Select
                                    classNamePrefix="select"
                                    styles={selectStyles}
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={
                                        roleLists?.length
                                            ? roleLists
                                                .map((role) => ({ value: role.id, label: role.role.toUpperCase() }))
                                                .find((opt) => opt.value === (query?.role || "")) || null
                                            : null
                                    }
                                    onChange={(opt) => setQuery({ ...query, role: opt?.value || "" })}
                                    options={roleLists.map((role) => ({ value: role.id, label: role.role.toUpperCase() }))}
                                />
                            </div>
                        </InputGroup>
                    </Col>
                    {/* Order By */}
                    <Col xs={12} md={3}>
                        <InputGroup className="mb-3" size="sm">
                            <InputGroup.Text id="user_order_by" style={inputGroupTextStyle}>Order By</InputGroup.Text>
                            <div className="flex-grow-1">
                                <Select
                                    classNamePrefix="select"
                                    styles={selectStyles}
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={orderByColumns
                                        .map((item) => ({ value: item, label: item.replaceAll('_',' ').toUpperCase() }))
                                        .find((opt) => opt.value === (query?.orderBy || "")) || null}
                                    onChange={(opt) => setQuery({ ...query, orderBy: opt?.value || "" })}
                                    options={orderByColumns.map((item) => ({ value: item, label: item.replaceAll('_',' ').toUpperCase() }))}
                                />
                            </div>
                        </InputGroup>
                    </Col>
                   
                   
                </Row>
                <Row>
                   {/* Limit */}
                    <Col xs={12} md={3}>
                        <InputGroup className="mb-3" size="sm">
                            <InputGroup.Text id="user_limit" style={inputGroupTextStyle}>Limit</InputGroup.Text>
                            <div className="flex-grow-1">
                                <Select
                                    classNamePrefix="select"
                                    styles={selectStyles}
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={limits
                                        .map((n) => ({ value: n, label: String(n) }))
                                        .find((opt) => opt.value === (Number(query?.limit) || 10)) || null}
                                    onChange={(opt) => setQuery({ ...query, limit: opt?.value || 10 })}
                                    options={limits.map((n) => ({ value: n, label: String(n) }))}
                                />
                            </div>
                        </InputGroup>
                    </Col>
                     {/* Order Direction */}
                    <Col xs={12} md={3}>
                        <InputGroup className="mb-3" size="sm">
                            <InputGroup.Text id="user_order" style={inputGroupTextStyle}>Order</InputGroup.Text>
                            <div className="flex-grow-1">
                                <Select
                                    classNamePrefix="select"
                                    styles={selectStyles}
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={orderColumns
                                        .map((item) => ({ value: item, label: item }))
                                        .find((opt) => opt.value === (query?.order || "")) || null}
                                    onChange={(opt) => setQuery({ ...query, order: opt?.value || "" })}
                                    options={orderColumns.map((item) => ({ value: item, label: item }))}
                                />
                            </div>
                        </InputGroup>
                    </Col>
                    {/* Reset */}
                    <Col xs={12} md={2} style={{display:'flex',justifyContent:'end',alignItems:'flex-end'}}>
                        <div className={"text-end"}>
                            <button className="btn btn-warning btn-sm" type="reset" onClick={resetFilterParameter}>Reset</button>
                        </div>
                    </Col>
                </Row>
            </CardContent>
        </>
    )
}
