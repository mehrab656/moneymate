import React, { useEffect, useState, useContext, useMemo } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
// WizCard removed to match Companies layout
import { Button, Form, Modal, Container, Row, Col, InputGroup } from "react-bootstrap";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import CommonTable from "../../components/table/CommonTable.jsx";
import Select from "react-select";
import { Card } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { createSelectStyles, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

export default function Return() {
  const [loading, setLoading] = useState(false);
  const [marketReturns, setMarketReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // legacy text search (not used)
  const [groupType, setGroupType] = useState(null); // { value,label }
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState(null);

  const [marketReturn, setMarketReturn] = useState({});

  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const selectStyles = createSelectStyles(theme, "0.875rem");
  const isDark = (useContext(SettingsContext)?.themeMode) === "dark";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: "0.875rem",
    minHeight: 36,
  };

  let totals = {
    totalRefundableAmount: 0,
    totalRefundedAmount: 0,
    totalRemaining: 0,
    totalRefundedPercent: 0,
    totalRemainingPercent: 0,
  };
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const [pageSize, setPageSize] = useState(num_data_per_page || 10);
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

  const normalizedReturns = useMemo(() => {
    return (marketReturns || []).map((r) => ({
      ...r,
      remaining:
        Number(r.refundable_amount || 0) - Number(r.refunded_amount || 0),
    }));
  }, [marketReturns]);

  const groupTypeOptions = useMemo(() => {
    const set = new Set();
    normalizedReturns.forEach((r) => {
      if (r?.reference) set.add(String(r.reference));
    });
    return Array.from(set).map((v) => ({ value: v, label: v }));
  }, [normalizedReturns]);

  const filterMarketReturns = useMemo(() => {
    let list = normalizedReturns;
    // group type filter (optional)
    if (groupType && groupType.value) {
      list = list.filter(
        (r) => String(r.reference) === String(groupType.value)
      );
    }
    // text search filter (primary)
    const q = (searchTerm || "").trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter((r) => {
        return (
          String(r.description || "")
            .toLowerCase()
            .includes(q) ||
          String(r.reference || "")
            .toLowerCase()
            .includes(q) ||
          String(r.date || "")
            .toLowerCase()
            .includes(q) ||
          String(r.id || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    return list;
  }, [normalizedReturns, groupType, searchTerm]);

  const computedTotals = useMemo(() => {
    const totals = {
      totalRefundableAmount: 0,
      totalRefundedAmount: 0,
      totalRefundedPercent: 0,
      totalRemainingPercent: 0,
    };
    filterMarketReturns.forEach((r) => {
      totals.totalRefundableAmount += Number(r.refundable_amount || 0);
      totals.totalRefundedAmount += Number(r.refunded_amount || 0);
    });
    totals.totalRefundedPercent =
      totals.totalRefundableAmount > 0
        ? Math.ceil(
            (totals.totalRefundedAmount * 100) / totals.totalRefundableAmount
          )
        : 0;
    totals.totalRemainingPercent = 100 - totals.totalRefundedPercent;
    return totals;
  }, [filterMarketReturns]);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const { setNotification } = useStateContext();

  const submitForUpdate = (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("account_id", marketReturn.account.value);
    formData.append("amount", marketReturn.amount);
    formData.append("id", marketReturn.id);
    formData.append("return_amount", marketReturn.return_amount);
    formData.append("amount", marketReturn.amount);

    axiosClient
      .post(`/return/${marketReturn.id}`, formData)
      .then(({ data }) => {
        setShowModal(false);
        getMarketReturns(currentPage, pageSize);
        setMarketReturn(data);
        Toast.fire({
          icon: "success",
          title: data.message,
          text: data.description,
        });
        setLoading(false);
      })
      .catch((error) => {
        if (error.response) {
          Toast.fire({
            icon: "error",
            title: error.response.data.message,
            text: error.response.data.description,
          });
        }
        setLoading(false);
      });
  };

  const edit = (marketReturn) => {
    setMarketReturn(marketReturn);
    setErrors(null);
    setShowModal(true);
  };

  const getMarketReturns = (page, pageSizeArg) => {
    setLoading(true);
    axiosClient
      .get("/returns", { params: { page, pageSize: pageSizeArg } })
      .then(({ data }) => {
        setLoading(false);
        setMarketReturns(data.data);
        setTotalCount(data.total);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "Market Returns";
    getMarketReturns(currentPage, pageSize);
  }, [currentPage, pageSize]); // Fetch when currentPage or pageSize changes

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // legacy bootstrap pagination not used with CommonTable

  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: edit,
      permission: "return_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: edit,
      permission: "return_view",
      textClass: "text-warning",
    },
  ];
  return (
    <div>
      <MainLoader loaderVisible={loading} />
      <Container fluid>
        <Row>
          <Col xs={12} lg={9}>
            <Row className="align-items-center">
              <Col xs={12} md={4}>
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span className="page-title-header">Market Returns</span>
                </div>
              </Col>
              <Col xs={12} md={8}>
                <div className="d-flex justify-content-end">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "520px", flex: "1 1 320px" }}>
                      <InputGroup.Text id="returns_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                      <Form.Control
                        aria-describedby="returns_search"
                        type="text"
                        size="sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Returns..."
                        style={{ ...inputStyle, textTransform: "capitalize" }}
                      />
                    </InputGroup>
                  </div>
                </div>
              </Col>

            </Row>

            <Card
              sx={{
                p: 5,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                "& .MuiTableContainer-root": {
                  backgroundColor: theme.palette.background.paper,
                },
                "& .MuiPaper-root": {
                  backgroundColor: theme.palette.background.paper,
                },
                "& .MuiTableCell-root": { color: theme.palette.text.primary },
              }}
              style={{ padding: "0px" }}
            >
              <CommonTable
                data={filterMarketReturns}
                tableColumns={[
                  ...(userRole === "admin"
                    ? [{ id: "id", label: "ID", align: "left" }]
                    : []),
                  { id: "date", label: "Date", align: "left" },
                  { id: "description", label: "Description", align: "left" },
                  {
                    id: "refundable_amount",
                    label: "Refundable Amount",
                    align: "left",
                  },
                  {
                    id: "refunded_amount",
                    label: "Refunded Amount",
                    align: "left",
                  },
                  { id: "remaining", label: "Remaining", align: "left" },
                ]}
                actionButtons={actionParams}
                pagination={{
                  totalPages: totalPages ?? 0,
                  totalCount: totalCount,
                  total: totalCount,
                  currentPage: currentPage,
                  handlePageChange: (e, value) => setCurrentPage(value),
                  pageSize: pageSize,
                  onRowsPerPageChange: (event) => {
                    const newSize = parseInt(event.target.value, 10);
                    setPageSize(newSize > 0 ? newSize : 10);
                  },
                }}
                cardSubTitle={`Page-${currentPage} • ${filterMarketReturns.length} of ${totalCount}`}
                isFetching={loading}
                hasError={false}
              />
            </Card>
          </Col>

          <Col xs={12} lg={3} className="mt-3 mt-lg-0">
            <div className="card quater-card summery-card">
              <div className="card-block">
                <h6 className="mb-3" style={{ color: theme.palette.text.secondary }}>Summary</h6>
                <h4 className="mb-1">
                  {default_currency +
                    " " +
                    computedTotals.totalRefundableAmount}
                </h4>
                <p className="mb-3" style={{ color: theme.palette.text.secondary }}>Total refundable amount</p>
                <h5 className="mb-1">
                  {default_currency + " " + computedTotals.totalRefundedAmount}
                </h5>
                <p className="mb-2" style={{ color: theme.palette.text.secondary }}>
                  Total Refunded{" "}
                  <span className="f-right">
                    {computedTotals.totalRefundedPercent + "%"}
                  </span>
                </p>
                <div className="progress mb-3" style={{ height: 8, borderRadius: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: computedTotals.totalRefundedPercent + "%" }}
                  />
                </div>
                <h5 className="mb-1">
                  {default_currency +
                    " " +
                    (computedTotals.totalRefundableAmount -
                      computedTotals.totalRefundedAmount)}
                </h5>
                <p className="mb-2" style={{ color: theme.palette.text.secondary }}>
                  Total Remaining{" "}
                  <span className="f-right">
                    {computedTotals.totalRemainingPercent + "%"}
                  </span>
                </p>
                <div className="progress" style={{ height: 8, borderRadius: 8 }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: computedTotals.totalRemainingPercent + "%",
                    }}
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        centered
        scrollable
        onHide={handleCloseModal}
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>Update Return: {marketReturn.reference}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="expense_amount" className="custom-form-label">
                Expense Amount
              </label>
              <input
                value={marketReturn.amount}
                className="custom-form-control"
                readOnly={true}
              />
            </div>
            <div className="form-group">
              <label htmlFor="refundable_amount" className="custom-form-label">
                Refundable Amount
              </label>
              <input
                value={marketReturn.refundable_amount}
                className="custom-form-control"
                readOnly={true}
              />
            </div>
            <div className="form-group">
              <label htmlFor="refunded_amount" className="custom-form-label">
                Refunded Amount
              </label>
              <input
                value={marketReturn.refunded_amount}
                className="custom-form-control"
                readOnly={true}
              />
            </div>
            <div className="form-group">
              <label htmlFor="return_amount" className="custom-form-label">
                Return Amount
              </label>
              <input
                className="custom-form-control"
                type="number"
                onBlur={(e) =>
                  setMarketReturn({
                    ...marketReturn,
                    return_amount: parseFloat(e.target.value).toFixed(2),
                  })
                }
                placeholder="Return Amount"
              />
              {errors && errors.type && (
                <div className="text-danger mt-2">{errors.type[0]}</div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="primary-theme-btn btn-sm"
            variant="primary"
            onClick={submitForUpdate}
          >
            Update
          </Button>
          <Button
            className="primary-theme-btn btn-sm"
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
