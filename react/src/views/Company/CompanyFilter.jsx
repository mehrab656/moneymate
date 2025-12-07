import React, { useEffect, useState, useContext } from "react";
import { Card, Stack, Row, Col, Form, Button } from "react-bootstrap";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Select from "react-select";

export default function CompanyFilter(props) {
  const { search, query, setQuery, resetFilterParameter, placeHolderTxt } = props;

  // Local state to debounce search input and prevent API calls per keystroke
  const [localSearchTerm, setLocalSearchTerm] = useState(query?.searchTerm || "");

  const { themeMode } = useContext(SettingsContext);
  const isDark = themeMode === "dark";
  const inputFontSize = "0.875rem";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: inputFontSize,
    minHeight: 36,
  };

  const selectStyles = {
    container: (base) => ({ ...base, fontSize: 14 }),
    control: (base, state) => ({
      ...base,
      minHeight: 36,
      height: 36,
      boxShadow: "none",
      borderColor: state.isFocused ? (isDark ? "#3a4149" : "#86b7fe") : (isDark ? "#3a4048" : "#c5ccd6"),
      backgroundColor: isDark ? "#1c1f24" : "#fff",
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      '&:hover': { borderColor: state.isFocused ? (isDark ? "#3a4149" : "#86b7fe") : (isDark ? "#3a4048" : "#c5ccd6") },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    indicatorsContainer: (base) => ({ ...base, height: 36 }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    }),
    input: (base) => ({ ...base, color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)" }),
    placeholder: (base) => ({ ...base, color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#23262b" : "#fff",
      border: `1px solid ${isDark ? "#2c3238" : "#dee2e6"}`,
      boxShadow: isDark ? "0 6px 12px rgba(0,0,0,0.35)" : "0 6px 12px rgba(0,0,0,0.15)",
    }),
    menuList: (base) => ({ ...base, backgroundColor: isDark ? "#23262b" : "#fff" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark ? "#0C1A28" : "#e7f0fb"
        : state.isFocused
          ? isDark ? "#2d3238" : "#f2f2f2"
          : isDark ? "#23262b" : "#fff",
      color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
      ':active': { backgroundColor: isDark ? "#0C1A28" : "#e7f0fb" },
    }),
  };

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
     <Card className="p-3">
      <Stack gap={3}>
        {/* Form Inputs */}
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="search">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Search
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeHolderTxt}
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="order">
              <Form.Label className="custom-form-label" style={{ marginBottom: "0px" }}>
                Order
              </Form.Label>
              <Select
                classNamePrefix="select"
                styles={selectStyles}
                isSearchable={false}
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
            </Form.Group>
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
