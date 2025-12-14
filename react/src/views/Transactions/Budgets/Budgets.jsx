import { Link } from "react-router-dom";
import axiosClient from "../../../axios-client.js";
import React, { useContext, useEffect, useState } from "react";
import { useThemedSwal } from "../../../components/SwalConfirm.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import BudgetFormSidebar from "./BudgetFormSidebar.jsx";
import { useSidebarActions } from "../../../hooks/useSidebarActions";
import CommonTable from "../../../components/table/CommonTable.jsx";
import { Card, Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Container, Row, Col, InputGroup, Form } from "react-bootstrap";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useDeleteBudgetMutation } from "../../../api/slices/budgetSlice.js";
import BudgetDetails from "./BudgetDetails.jsx";
import { createSelectStyles, createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";

export default function Budgets() {
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const selectStyles = createSelectStyles(theme, "0.875rem");
  const { showLargeContent, showQuickForm, showQuickDetails } = useSidebarActions();

  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { applicationSettings, userRole, themeMode } = useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;
  const isDark = themeMode === "dark";
  const inputStyle = {
    backgroundColor: isDark ? "#1c1f24" : "#fff",
    color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
    borderColor: isDark ? "#3a4048" : "#c5ccd6",
    fontSize: "0.875rem",
    minHeight: 36,
  };

  const [pageSize, setPageSize] = useState(num_data_per_page || 10);
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));
  const filteredBudgets = budgets.filter((budget) => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return true;
    const amountStr = String(budget?.amount ?? "").toLowerCase();
    const nameStr = String(budget?.budget_name ?? "").toLowerCase();
    const startStr = String(budget?.start_date ?? "").toLowerCase();
    const endStr = String(budget?.end_date ?? "").toLowerCase();
    return (
      nameStr.includes(q) ||
      amountStr.includes(q) ||
      startStr.includes(q) ||
      endStr.includes(q) ||
      String(budget?.id ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  const [errors, setErrors] = useState({});
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [budgetOverlap, setBudgetOverlap] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const [showModal, setShowModal] = useState(false);

  const [budget, setBudget] = useState({
    id: null,
    budget_name: "",
    amount: "",
    start_date: null, // Update here
    end_date: null,
    use_id: null,
  });

  const { setNotification, token } = useStateContext();
  const { confirmDelete } = useThemedSwal();
  const [deleteBudget] = useDeleteBudgetMutation();

  const getExpenseCategories = () => {
    setLoading(true);
    axiosClient
      .get("/expense-categories")
      .then(({ data }) => {
        setExpenseCategories(data.categories);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error loading expense categories:", error);
      });
  };

  const getBudgets = (page, pageSize) => {
    setLoading(true);
    axiosClient
      .get("/budgets", { params: { page, pageSize } })
      .then(({ data }) => {
        setLoading(false);
        setBudgets(data.data);
        setTotalCount(data.total);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "Manage Budget";
    getBudgets(currentPage, pageSize);
    getExpenseCategories();
  }, [currentPage, pageSize]);

  const showCreateModal = () => {
    setBudget({
      id: null,
      budget_name: "",
      amount: "",
      start_date: "",
      end_date: "",
      use_id: null,
    });
    setSelectedCategories([]);
    setErrors({});
    setShowModal(true);
  };

  const openBudgetForm = (budgetId = null) => {
    const ref = React.createRef();
    const formId = "budget-form-global";
    showLargeContent(
      budgetId ? "Edit Budget" : "Create Budget",
      <BudgetFormSidebar
        ref={ref}
        budgetId={budgetId}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          getBudgets(currentPage, pageSize);
        }}
      />,
      {
        footerActions: (
          <SidebarFooterButtons
            actions={
              budgetId
                ? [
                    {
                      label: "Update",
                      type: "button",
                      onClick: () => ref.current?.saveAndExit(),
                    },
                  ]
                : [
                    { label: "Save", type: "submit", formId: formId },
                    {
                      label: "Save and Exit",
                      type: "button",
                      onClick: () => ref.current?.saveAndExit(),
                    },
                  ]
            }
          />
        ),
      }
    );
  };

 

  const edit = (budget) => {
    setBudget(budget);
    setSelectedCategories(
      budget.categories.map((selectedCategory) => ({
        value: selectedCategory.id,
        label: selectedCategory.name,
      }))
    );
    setStartDate(new Date(budget.start_date)); // Add this line
    setEndDate(new Date(budget.end_date));
    setErrors({});
    setViewOnly(false);
    setShowModal(true);
  };

  const viewBudget = (budget) => {
    setBudget(budget);
    setSelectedCategories(
      budget.categories.map((selectedCategory) => ({
        value: selectedCategory.id,
        label: selectedCategory.name,
      }))
    );
    setStartDate(new Date(budget.start_date));
    setEndDate(new Date(budget.end_date));
    setErrors({});
    setViewOnly(true);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
  };

  // set default date(today)
  useEffect(() => {
    if (startDate === null) {
      setStartDate(new Date());
    }
  }, [startDate]);

  const budgetSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedBudget = {
      ...budget,
      start_date: startDate
        ? new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
        : null,
      end_date: endDate
        ? new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
        : null,
      categories: selectedCategories.map((category) => category.value),
    };

    if (budget.id) {
      axiosClient
        .put(`/budgets/${budget.id}`, updatedBudget)
        .then(({ data }) => {
          // setNotification(`${data.budget_name} was successfully updated`);
          getBudgets(currentPage, pageSize);
          setShowModal(false);
          setBudget({
            id: null,
            budget_name: "",
            amount: "",
            start_date: "",
            end_date: "",
            use_id: null,
          });

          notification("success", data?.message, data?.description);
          setLoading(false);
        })
        .catch((err) => {
          // const response = error.response;
          // if (response && response.status === 422) {
          //     setErrors(response.data.errors);
          // }
          if (err.response) {
            const error = err.response.data;
            notification("error", error?.message, error.description);
          }
          setLoading(false);
        });
    } else {
      axiosClient
        .post("/budgets", updatedBudget)
        .then(({ data }) => {
          if (data && data.status === 422) {
            // setNotification(data.message);
          } else {
            // setNotification(`${data.budget_name} was successfully created`);
            getBudgets(currentPage, pageSize);
            setShowModal(false);
            setBudget({
              id: null,
              budget_name: "",
              amount: "",
              start_date: "",
              end_date: "",
              use_id: null,
            });
          }

          notification("success", data?.message, data?.description);

          setLoading(false);
        })
        .catch((err) => {
          if (err.response) {
            const error = err.response.data;
            notification("error", error?.message, error.description);
          }
          setLoading(false);
        });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const onDelete = (budgetData) => {
    confirmDelete("budget", { confirmButtonText: "Yes, delete it!" }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteBudget({ id: budgetData.id, token }).unwrap();
          notification("success", response?.message || "Deleted", response?.description);
          getBudgets(currentPage, pageSize);
        } catch (error) {
          const data = error?.data || {};
          notification("error", data?.message || "Error", data?.description);
        }
      }
    });
  };

  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: (budget) => openBudgetForm(budget.id),
      permission: "budget_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: (budget) =>
        showQuickDetails("Budget Details", <BudgetDetails data={budget} />),
      permission: "budget_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "budget_delete",
      textClass: "text-danger",
    },
  ];
  return (
    <>
      <MainLoader loaderVisible={loading} />
      <Container fluid>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className={"page-title-header"}>Budgets</span>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <button
              className={"btn primary-theme-btn btn-sm ml-2"}
              onClick={() => openBudgetForm(null)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </Box>
        </Box>
        <Row className="mb-3">
          <Col xs={12} md={8} className="d-flex justify-content-start">
            <InputGroup
              className="mb-3"
              size="sm"
              style={{ maxWidth: "520px" }}
            >
              <InputGroup.Text id="budget_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
              <Form.Control
                aria-describedby="budget_search"
                type="text"
                size="sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search budget..."
                style={{ ...inputStyle, textTransform: "capitalize" }}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
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
                data={filteredBudgets}
                tableColumns={[
                  ...(userRole === "admin"
                    ? [{ id: "id", label: "ID", align: "left" }]
                    : []),
                  { id: "budget_name", label: "Budget Name", align: "left" },
                  {
                    id: "amount",
                    label: "Proposed Amount",
                    align: "left",
                    format: (v) => `${default_currency} ${v}`,
                  },
                  {
                    id: "updated_amount",
                    label: "Updated Budget Amount",
                    align: "left",
                    format: (v) => `${default_currency} ${v}`,
                  },
                  {
                    id: "start_date",
                    label: "Budget Start Date",
                    align: "left",
                  },
                  { id: "end_date", label: "Budget End Date", align: "left" },
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
                cardSubTitle={`Page-${currentPage} • ${filteredBudgets.length} of ${totalCount}`}
                isFetching={loading}
                hasError={false}
              />
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        centered
        onHide={handleCloseModal}
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {viewOnly && budget.id && <span>View Budget: {budget.budget_name}</span>}
            {!viewOnly && budget.id && <span>Update Budget: {budget.budget_name}</span>}
            {!budget.id && !viewOnly && <span>Add New Budget</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="custom-form-label" htmlFor="budget_name">
              Budget Name
            </label>
            <input
              className={`custom-form-control ${
                errors.budget_name ? "has-error" : ""
              }`}
              value={budget.budget_name}
              onChange={(e) =>
                setBudget({ ...budget, budget_name: e.target.value })
              }
              placeholder="Budget Name"
              disabled={viewOnly}
            />
            {errors.budget_name && (
              <p className="error-message mt-2">{errors.budget_name[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label className="custom-form-label" htmlFor="budget_amount">
              Budget Amount
            </label>
            <input
              className={`custom-form-control ${
                errors.amount ? "has-error" : ""
              }`}
              value={budget.amount}
              onChange={(e) => setBudget({ ...budget, amount: e.target.value })}
              placeholder="Budget Amount"
              disabled={viewOnly}
            />
            {errors.amount && (
              <p className="error-message mt-2">{errors.amount[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label className="custom-form-label" htmlFor="expense_categories">
              Expense Categories
            </label>
            <Select
              isMulti
              value={selectedCategories}
              options={expenseCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              onChange={handleSelectChange}
              isDisabled={viewOnly}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {errors.categories && (
              <p className="error-message mt-2">{errors.categories[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label className="custom-form-label" htmlFor="start_date">
              Start Date
            </label>
            <DatePicker
              className="custom-form-control"
              selected={startDate}
              onChange={handleStartDateChange}
              onSelect={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start Date"
              disabled={viewOnly}
            />
            {errors.start_date && (
              <p className="error-message mt-2">{errors.start_date[0]}</p>
            )}
          </div>

          <div className="form-group">
            <label className="custom-form-label" htmlFor="end_date">
              End Date
            </label>
            <DatePicker
              className="custom-form-control"
              selected={endDate}
              onChange={handleEndDateChange}
              onSelect={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="End Date"
              disabled={viewOnly}
            />
            {errors.end_date && (
              <p className="error-message mt-2">{errors.end_date[0]}</p>
            )}
          </div>

          {budgetOverlap && (
            <div className="text-danger mt-2 mb-3">{budgetOverlap}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!viewOnly && (
            <Button
              className="primary-theme-btn btn-sm"
              variant="primary"
              onClick={budgetSubmit}
            >
              Save
            </Button>
          )}
          <Button
            className="primary-theme-btn btn-sm"
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
