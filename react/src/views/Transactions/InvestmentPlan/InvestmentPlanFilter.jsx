import { CardContent } from "@mui/material";
import { Col, Form, Row, InputGroup } from "react-bootstrap";
import React, { useEffect, useState, useContext } from "react";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";

export default function InvestmentPlanFilter(props) {
  const { query, setQuery, resetFilterParameter, placeHolderTxt } = props;
  const [localSearchTerm, setLocalSearchTerm] = useState(query?.searchTerm || "");
  const { themeMode } = useContext(SettingsContext);
  const theme = useTheme();
  const inputFontSize = "0.875rem";
  const isDark = themeMode === "dark";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: inputFontSize,
    minHeight: 36,
  };

  const selectStyles = createSelectStyles(theme, inputFontSize);
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const orderByOptions = [
    { value: "plan_created_date", label: "Date" },
    { value: "plan_start_date", label: "Contract Start" },
    { value: "plan_end_date", label: "Contract End" },
    { value: "plan_name", label: "Plan Name" },
  ];

  useEffect(() => {
    setLocalSearchTerm(query?.searchTerm || "");
  }, [query?.searchTerm]);
  const debouncedSearchTerm = useDebouncedValue(localSearchTerm, 300);
  useEffect(() => {
    setQuery((prev) => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm, setQuery]);

  return (
    <>
      <CardContent style={{ borderBottom: "1px solid" }}>
        <Row className={"mb-3"}>
          {/* Plan Created */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="plan_created_date" style={inputGroupTextStyle}>Plan Created</InputGroup.Text>
              <Form.Control
                aria-describedby="plan_created_date"
                type="date"
                value={query.plan_created_date || ""}
                onChange={(e) => setQuery({ ...query, plan_created_date: e.target.value })}
                style={inputStyle}
              />
            </InputGroup>
          </Col>
          {/* Contract Start */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="plan_start_date" style={inputGroupTextStyle}>Contract Start</InputGroup.Text>
              <Form.Control
                aria-describedby="plan_start_date"
                type="date"
                value={query.plan_start_date || ""}
                onChange={(e) => setQuery({ ...query, plan_start_date: e.target.value })}
                style={inputStyle}
              />
            </InputGroup>
          </Col>
          {/* Contract End */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="plan_end_date" style={inputGroupTextStyle}>Contract End</InputGroup.Text>
              <Form.Control
                aria-describedby="plan_end_date"
                type="date"
                value={query.plan_end_date || ""}
                onChange={(e) => setQuery({ ...query, plan_end_date: e.target.value })}
                style={inputStyle}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          {/* Search */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="investment_plan_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
              <Form.Control
                aria-describedby="investment_plan_search"
                type="text"
                size="sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeHolderTxt}
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="investment_order_by" style={inputGroupTextStyle}>Order By</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={orderByOptions.find((opt) => opt.value === (query?.orderBy || "")) || null}
                  onChange={(opt) => setQuery({ ...query, orderBy: opt?.value || "" })}
                  options={orderByOptions}
                />
              </div>
            </InputGroup>
          </Col>

          {/* Order Direction */}
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="investment_order" style={inputGroupTextStyle}>Order</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={[
                    { value: "ASC", label: "Ascending" },
                    { value: "DESC", label: "Descending" },
                  ].find((opt) => opt.value === (query?.order || "")) || null}
                  onChange={(opt) => setQuery({ ...query, order: opt?.value || "" })}
                  options={[
                    { value: "ASC", label: "Ascending" },
                    { value: "DESC", label: "Descending" },
                  ]}
                />
              </div>
            </InputGroup>
          </Col>

          {/* Limit */}
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="investment_limit" style={inputGroupTextStyle}>Limit</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={[10, 20, 50, 100, 500, 1000]
                    .map((n) => ({ value: n, label: String(n) }))
                    .find((opt) => opt.value === (Number(query?.limit) || 10)) || null}
                  onChange={(opt) => setQuery({ ...query, limit: opt?.value || 10 })}
                  options={[10, 20, 50, 100, 500, 1000].map((n) => ({ value: n, label: String(n) }))}
                />
              </div>
            </InputGroup>
          </Col>

          {/* Reset */}
          <Col
            xs={12}
            md={2}
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "flex-end",
            }}
          >
            <div className={"text-end"}>
              <button
                className="btn btn-warning btn-sm"
                type="reset"
                onClick={() => { setLocalSearchTerm(""); resetFilterParameter(); }}
              >
                Reset
              </button>
            </div>
          </Col>
        </Row>
      </CardContent>
    </>
  );
}

