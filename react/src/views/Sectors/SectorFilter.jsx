import { CardContent } from "@mui/material";
import { Col, Form, Row, InputGroup } from "react-bootstrap";
import React, { useEffect, useState, useContext } from "react";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { useGetBankDataQuery } from "../../api/slices/bankSlice.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Select from "react-select";

export default function SectorFilter(props) {
  const { query, setQuery, resetFilterParameter, placeHolderTxt } = props;
  const [accounts, setAccounts] = useState([]);
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
  useEffect(() => {
    setLocalSearchTerm(query?.searchTerm || "");
  }, [query?.searchTerm]);
  const debouncedSearchTerm = useDebouncedValue(localSearchTerm, 300);
  useEffect(() => {
    setQuery((prev) => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm, setQuery]);
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
  }, [getBankData]);

  return (
    <>
      <CardContent style={{ borderBottom: "1px solid" }}>
        <Row className={"mb-3"}>
          {/* Account */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="sector_account">Account</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isClearable
                  value={
                    accounts?.length
                      ? accounts
                          .map(({ id, bank_name, account_number }) => ({ value: id, label: `${bank_name} (${account_number})` }))
                          .find((opt) => opt.value === (query?.payment_account_id || "")) || null
                      : null
                  }
                  onChange={(opt) => setQuery({ ...query, payment_account_id: opt?.value || "" })}
                  options={accounts.map(({ id, bank_name, account_number }) => ({ value: id, label: `${bank_name} (${account_number})` }))}
                />
              </div>
            </InputGroup>
          </Col>
          {/* Contract Start */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="contract_start_date">Contract Start</InputGroup.Text>
              <Form.Control
                aria-describedby="contract_start_date"
                type="date"
                value={query.contract_start_date}
                onChange={(e) => setQuery({ ...query, contract_start_date: e.target.value })}
              />
            </InputGroup>
          </Col>
          {/* Contract End */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="contract_end_date">Contract End</InputGroup.Text>
              <Form.Control
                aria-describedby="contract_end_date"
                type="date"
                value={query.contract_end_date}
                onChange={(e) => setQuery({ ...query, contract_end_date: e.target.value })}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          {/* Search */}
          <Col xs={12} md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="sector_search">Search</InputGroup.Text>
              <Form.Control
                aria-describedby="sector_search"
                type="text"
                size="sm"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeHolderTxt}
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>

          {/* Order By */}
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="sector_order_by">Order By</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  value={[
                    { value: "rent", label: "Rent" },
                    { value: "contract_start_date", label: "Contract starting date" },
                    { value: "contract_end_date", label: "Contract ending date" },
                  ].find((opt) => opt.value === (query?.orderBy || "")) || null}
                  onChange={(opt) => setQuery({ ...query, orderBy: opt?.value || "" })}
                  options={[
                    { value: "rent", label: "Rent" },
                    { value: "contract_start_date", label: "Contract starting date" },
                    { value: "contract_end_date", label: "Contract ending date" },
                  ]}
                />
              </div>
            </InputGroup>
          </Col>

          {/* Order Direction */}
          <Col xs={12} md={2}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="sector_order">Order</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
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
              <InputGroup.Text id="sector_limit">Limit</InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
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
