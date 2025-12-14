import React, { useContext, useMemo } from "react";
import { Card, Stack, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import {useGetInvestorDataQuery} from "../../../api/slices/userSlice.js";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles } from "../../../styles/formThemeStyles.js";

export default function InvestmentFilter(props) {
    const { search, query, setQuery, resetFilterParameter, handelFilter } = props;
    const { placeHolderTxt, searchBoxValue, handelSearch } = search;

    const { data: getInvestorData, isFetching: investorIsFetching, isError: investorFetchingDataError } = useGetInvestorDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const { themeMode } = useContext(SettingsContext);
    const isDark = themeMode === "dark";
    const theme = useTheme();
    const inputStyle = useMemo(() => ({
        backgroundColor: isDark ? "#1c1f24" : "#fff",
        color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
        borderColor: isDark ? "#3a4048" : "#c5ccd6",
        fontSize: "0.875rem",
        minHeight: 36,
    }), [isDark]);

    const selectStyles = createSelectStyles(theme, "0.875rem");

    const investorsOptions = useMemo(() => {
        const list = getInvestorData?.data || [];
        return list.map(({ slug, full_name }) => ({ value: slug, label: full_name }));
    }, [getInvestorData]);
    const orderByOptions = useMemo(() => ([
        { value: "investment_date", label: "Date" },
        { value: "amount", label: "Amount" },
    ]), []);
    const limitOptions = useMemo(() => ([10, 20, 50, 100, 500].map((n) => ({ value: n, label: String(n) }))), []);

    return (
        <>
            <Card className="p-3" style={{ borderBottom: '1px solid' }}>
                <Stack gap={3}>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_investor">Investor</InputGroup.Text>
                                <div className="flex-grow-1">
                                    <Select
                                        classNamePrefix="select"
                                        styles={selectStyles}
                                        isSearchable={false}
                                        value={
                                            investorsOptions.find((opt) => opt.value === (query?.investor_id || "")) || null
                                        }
                                        onChange={(opt) => setQuery({ ...query, investor_id: opt?.value || "" })}
                                        options={investorsOptions}
                                    />
                                </div>
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_from">From</InputGroup.Text>
                                <Form.Control
                                    aria-describedby="investment_from"
                                    type="date"
                                    value={query.from_date}
                                    onChange={(e) => setQuery({ ...query, from_date: e.target.value })}
                                    style={inputStyle}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_to">To</InputGroup.Text>
                                <Form.Control
                                    aria-describedby="investment_to"
                                    type="date"
                                    value={query.to_date}
                                    onChange={(e) => setQuery({ ...query, to_date: e.target.value })}
                                    style={inputStyle}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col md={6}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_search">Search</InputGroup.Text>
                                <Form.Control
                                    aria-describedby="investment_search"
                                    type="text"
                                    size="sm"
                                    value={searchBoxValue}
                                    onChange={(event) => handelSearch(event.target.value)}
                                    placeholder={placeHolderTxt}
                                    style={{ ...inputStyle, textTransform: "capitalize" }}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_order_by">Order By</InputGroup.Text>
                                <div className="flex-grow-1">
                                    <Select
                                        classNamePrefix="select"
                                        styles={selectStyles}
                                        isSearchable={false}
                                        value={
                                            orderByOptions.find((opt) => opt.value === (query?.orderBy || "")) || null
                                        }
                                        onChange={(opt) => setQuery({ ...query, orderBy: opt?.value || "" })}
                                        options={orderByOptions}
                                    />
                                </div>
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_order">Order</InputGroup.Text>
                                <div className="flex-grow-1">
                                    <Select
                                        classNamePrefix="select"
                                        styles={selectStyles}
                                        isSearchable={false}
                                        value={
                                            [{ value: "ASC", label: "Ascending" }, { value: "DESC", label: "Descending" }]
                                                .find((opt) => opt.value === (query?.order || "")) || null
                                        }
                                        onChange={(opt) => setQuery({ ...query, order: opt?.value || "" })}
                                        options={[
                                            { value: "ASC", label: "Ascending" },
                                            { value: "DESC", label: "Descending" },
                                        ]}
                                    />
                                </div>
                            </InputGroup>
                        </Col>
                        {/* <Col md={2}>
                            <InputGroup className="mb-3" size="sm">
                                <InputGroup.Text id="investment_limit">Limit</InputGroup.Text>
                                <div className="flex-grow-1">
                                    <Select
                                        classNamePrefix="select"
                                        styles={selectStyles}
                                        isSearchable={false}
                                        value={
                                            limitOptions.find((opt) => opt.value === (Number(query?.limit) || 10)) || null
                                        }
                                        onChange={(opt) => setQuery({ ...query, limit: opt?.value })}
                                        options={limitOptions}
                                    />
                                </div>
                            </InputGroup>
                        </Col> */}
                    </Row>

                    <Row className="justify-content-end">
                        <Col md={4} className="text-end">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => {
                                    resetFilterParameter();
                                }}
                            >
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Stack>
            </Card>
        </>
    )
}
