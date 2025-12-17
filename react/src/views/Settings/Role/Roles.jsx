import * as React from "react";
import axiosClient from "../../../axios-client.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@mui/styles";
import { styled, useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import Swal from "sweetalert2";
import { notification } from "../../../components/ToastNotification.jsx";
import { Tooltip } from "react-tooltip";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import { checkPermission } from "../../../helper/HelperFunctions.js";
import CommonTable from "../../../components/table/CommonTable.jsx";
import { Box, Card, Collapse, IconButton, CardContent } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Row, Col, Form, InputGroup } from "react-bootstrap";
import Select from "react-select";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";
const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});
export default function Roles() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const { applicationSettings } = useContext(SettingsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultQuery = { searchTerm: "", orderBy: "DESC", limit: 10 };
  const [query, setQuery] = useState(defaultQuery);
  const [isPaginate, setIsPaginate] = useState(false);
  const classes = useStyles();

  const pageSize =
    Number(query.limit) > 0
      ? Number(query.limit)
      : applicationSettings?.num_data_per_page
      ? applicationSettings.num_data_per_page
      : 10;

  const getRoles = () => {
    setLoading(true);
    axiosClient
      .get("/roles", { params: { page: currentPage, rowsPerPage: pageSize } })
      .then(({ data }) => {
        setRoles(data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Role list";
  }, []);

  useEffect(() => {
    getRoles();
    setIsPaginate(false);
  }, [currentPage, pageSize]);

  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

  const showRole = (role) => {
    // placeholder for role quick view when implemented
  };

  const onDelete = (role) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover the role !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient
          .delete(`role/${role.id}`)
          .then((data) => {
            getRoles();
            notification("success", data?.message, data?.description);
          })
          .catch((err) => {
            if (err.response) {
              const error = err.response.data;
              notification("error", error?.message, error.description);
            }
          });
      }
    });
  };

  const actionParams = [
    {
      actionName: "Edit",
      type: "route",
      route: "/role/",
      actionFunction: "editModal",
      permission: "role_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showRole,
      permission: "role_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "role_delete",
      textClass: "text-danger",
    },
  ];

  const TABLE_HEAD = [
    { id: "role", label: "Role", align: "left" },
    { id: "status_text", label: "Status", align: "left" },
    { id: "added_by", label: "Added By", align: "left" },
    { id: "date_text", label: "Date", align: "left" },
  ];

  const filteredRoles = useMemo(() => {
    const base = roles.map((r) => ({
      ...r,
      status_text: r.status === 1 ? "Active" : "Inactive",
      date_text: r.date ? new Date(r.date).toLocaleDateString("en-US", dateOptions) : "",
    }));
    const byText = base.filter(
      (r) =>
        (r.role || "").toLowerCase().includes((query.searchTerm || "").toLowerCase()) ||
        (r.added_by || "").toLowerCase().includes((query.searchTerm || "").toLowerCase())
    );
    const sorted = byText.sort((a, b) => {
      const x = (a.role || "").toLowerCase();
      const y = (b.role || "").toLowerCase();
      if (x < y) return query.orderBy === "ASC" ? -1 : 1;
      if (x > y) return query.orderBy === "ASC" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [roles, query.searchTerm, query.orderBy]);

  const totalCount = filteredRoles.length;
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setIsPaginate(true);
  };

  const handleRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, limit: newSize }));
    setCurrentPage(1);
    setIsPaginate(true);
  };

  const FilterSection = () => {
    const inputFontSize = "0.875rem";
    const themeMode = useContext(SettingsContext)?.themeMode;
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
    return (
      <CardContent style={{ borderBottom: "1px solid" }}>
        <Row className="mb-3">
          <Col md={4}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="role_search" style={inputGroupTextStyle}>
                Search
              </InputGroup.Text>
              <Form.Control
                aria-describedby="role_search"
                type="text"
                size="sm"
                value={query.searchTerm}
                onChange={(e) => setQuery((prev) => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search Roles..."
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="role_order" style={inputGroupTextStyle}>
                Order
              </InputGroup.Text>
              <div className="flex-grow-1">
                <Select
                  classNamePrefix="select"
                  styles={selectStyles}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={
                    [
                      { value: "ASC", label: "Ascending" },
                      { value: "DESC", label: "Descending" },
                    ].find((opt) => opt.value === (query?.orderBy || "DESC")) || null
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
          <Col md={3}>
            <InputGroup className="mb-3" size="sm">
              <InputGroup.Text id="role_limit" style={inputGroupTextStyle}>
                Limit
              </InputGroup.Text>
              <Form.Select
                size="sm"
                aria-describedby="role_limit"
                value={pageSize}
                onChange={(e) => handleRowsPerPageChange(e)}
              >
                {[10, 20, 50, 100, 500, 1000].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
          <Col md={2} className="text-end">
            <button
              className="btn btn-warning btn-sm"
              onClick={() => {
                setQuery(defaultQuery);
              }}
            >
              Reset
            </button>
          </Col>
        </Row>
      </CardContent>
    );
  };

  return (
    <div>
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className={"page-title-header"}>Roles</span>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {checkPermission("role_create") && (
            <Link className="btn-add align-right mr-3" to="/roles/new" data-tooltip-id="add-role">
              <FontAwesomeIcon icon={faPlus} />
            </Link>
          )}
          <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
            <ArrowDropDownIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={showFilter} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, mb: 2 }}>
          <FilterSection />
        </Box>
      </Collapse>

      <Card
        sx={{
          p: 5,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          "& .MuiTableContainer-root": { backgroundColor: theme.palette.background.paper },
          "& .MuiPaper-root": { backgroundColor: theme.palette.background.paper },
          "& .MuiTableCell-root": { color: theme.palette.text.primary },
        }}
        style={{ padding: "0px" }}
      >
        <CommonTable
          data={filteredRoles}
          tableColumns={TABLE_HEAD}
          actionButtons={actionParams}
          pagination={{
            totalPages: totalPages ?? 0,
            totalCount: totalCount,
            currentPage: currentPage,
            handlePageChange: handlePageChange,
            pageSize: pageSize,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          cardSubTitle={`Page-${currentPage} (showing ${filteredRoles.length} results from ${totalCount})`}
          isFetching={loading}
          hasError={false}
        />
      </Card>
    </div>
  );
}
