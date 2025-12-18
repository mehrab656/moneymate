import React, { useEffect, useState, useContext } from "react";
import { Card, Stack, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

export default function CompanyFilter(props) {
  const { search, query, setQuery, resetFilterParameter, placeHolderTxt } = props;

  // Local state to debounce search input and prevent API calls per keystroke
  const [localSearchTerm, setLocalSearchTerm] = useState(query?.searchTerm || "");

  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const theme = useTheme();
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

  // Keep local input in sync when external reset occurs
  useEffect(() => {
    setLocalSearchTerm(query?.searchTerm || "");
  }, [query?.searchTerm]);

  // Debounce updating the parent query object
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery((prev) => ({ ...prev, searchTerm: localSearchTerm }));
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearchTerm, setQuery]);
  return (
    <>
     <Card className="p-3" style={{ borderBottom: '1px solid' }}>
      <Stack gap={3}>
        {/* Form Inputs */}
        <Row className="g-3">
          <Col xs={12} md={6} lg={4}>
            <InputGroup className="mb-3 w-100" size="sm" style={{ maxWidth: "100%", flex: "1 1 320px" }}>
              <InputGroup.Text id="company_search" style={{ ...inputGroupTextStyle, flexShrink: 0, whiteSpace: "nowrap" }}>Search</InputGroup.Text>
              <Form.Control
                aria-describedby="company_search"
                type="text"
                size="sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeHolderTxt}
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <InputGroup className="mb-3 w-100" size="sm" style={{ maxWidth: "100%", flex: "1 1 320px", flexWrap: "nowrap" }}>
              <InputGroup.Text id="company_order" style={{ ...inputGroupTextStyle, flexShrink: 0, whiteSpace: "nowrap", minWidth: 90 }}>Order</InputGroup.Text>
              <div className="flex-grow-1" aria-describedby="company_order" style={{ minWidth: 0 }}>
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={
                    [{ value: "ASC", label: "Ascending" }, { value: "DESC", label: "Descending" }]
                      .find((opt) => opt.value === (query?.orderBy || "DESC")) || null
                  }
                  onChange={(opt) => setQuery({ ...query, orderBy: opt?.value })}
                  options={[
                    { value: "ASC", label: "Ascending" },
                    { value: "DESC", label: "Descending" },
                  ]}
                />
              </div>
            </InputGroup>
          </Col>

          {/* <Col md={2}>
            <Form.Group controlId="limit">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Limit
              </Form.Label>
              <Select
                classNamePrefix="select"
                styles={selectStyles}
                isSearchable={false}
                value={
                  [10, 20, 50, 100, 500, 1000]
                    .map((n) => ({ value: n, label: String(n) }))
                    .find((opt) => opt.value === (Number(query?.limit) || 10)) || null
                }
                onChange={(opt) => setQuery({ ...query, limit: opt?.value })}
                options={[10, 20, 50, 100, 500, 1000].map((n) => ({ value: n, label: String(n) }))}
              />
            </Form.Group>
          </Col> */}
        </Row>

        {/* Filter and Reset Buttons */}
        <Row className="justify-content-end">
          <Col md={4} className="text-end">
            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                setLocalSearchTerm("");
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
  );
}
