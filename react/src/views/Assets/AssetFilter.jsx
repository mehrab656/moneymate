import { Stack, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import React, { useEffect, useState, useContext } from "react";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import { CardContent } from "@mui/material";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

export default function AssetFilter(props) {
  const { search, query, setQuery, resetFilterParameter, placeHolderTxt } = props;
  const [localSearchTerm, setLocalSearchTerm] = useState(query?.searchTerm || "");
  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const theme = useTheme();

  useEffect(() => {
    setLocalSearchTerm(query?.searchTerm || "");
  }, [query?.searchTerm]);

  const debouncedSearchTerm = useDebouncedValue(localSearchTerm, 300);
  useEffect(() => {
    setQuery((prev) => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm, setQuery]);

  const inputFontSize = "0.875rem";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: inputFontSize,
    minHeight: 36,
  };

  const selectStyles = createSelectStyles(theme, inputFontSize);
  const inputGroupTextStyle = createInputGroupTextStyle(theme);

  return (
    <>
      <CardContent style={{ borderBottom: "1px solid" }}>
        <Row>
          {/* Search */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="asset_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
              <Form.Control
                aria-describedby="asset_search"
                type="text"
                size="sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeHolderTxt}
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>

          {/* Order Direction */}
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="asset_order" style={inputGroupTextStyle}>Order</InputGroup.Text>
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
                  ].find((opt) => opt.value === (query?.orderBy || "")) || null}
                  onChange={(opt) => setQuery({ ...query, orderBy: opt?.value || "" })}
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
              <InputGroup.Text id="asset_limit" style={inputGroupTextStyle}>Limit</InputGroup.Text>
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
          <Col xs={12} md={4} style={{ display: "flex", justifyContent: "end", alignItems: "flex-end" }}>
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
