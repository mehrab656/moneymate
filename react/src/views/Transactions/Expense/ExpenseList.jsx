import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { SettingsContext } from "../../../contexts/SettingsContext";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";

import {
  useDeleteExpenseMutation,
  useGetExpenseDataQuery,
} from "../../../api/slices/expenseSlice.js";
import ExpenseFilter from "./ExpenseFilter.jsx";
import ExpenseFormSidebar from "./ExpenseFormSidebar.jsx";
import { Col, Form, Row } from "react-bootstrap";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import ExpenseDetails from "./ExpenseDetails.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fa0, faDownload, faFilter } from "@fortawesome/free-solid-svg-icons";
import FilteredParameters from "./Components/FilteredParameters.jsx";
import ListTable from "./Components/ListTable.jsx";
import ExpenseExportButton from "./Components/ExpenseExportButton.jsx";

import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Button,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import CommonTable from "../../../components/table/CommonTable.jsx";
import Iconify from "../../../components/Iconify.jsx";
import Select from "react-select";

const defaultQuery = {
  start_date: "",
  end_date: "",
  categoryIDS: [],
  sectorIDS: [],
  categoryNames: [],
  sectorNames: [],
  orderBy: "",
  order: "",
  limit: "",
};
const TABLE_HEAD = [
  { id: "date", label: "Date", align: "left", minWidth: 170 },
  { id: "description", label: "Details", align: "left", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    align: "right",
    minWidth: 170,
    format: (value) => value.toFixed(2),
  },
  { id: "user_name", label: "Expense By", align: "left", minWidth: 170 },
  {
    id: "refundable_amount",
    label: "Refundable Amount",
    align: "right",
    minWidth: 170,
    format: (value) => value.toFixed(2),
  },
  {
    id: "refunded_amount",
    label: "Refunded Amount",
    align: "right",
    minWidth: 170,
    format: (value) => value.toFixed(2),
  },
];

export default function ExpenseList() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [hasFilter, setHasFilter] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerms, setSearchTerms] = useState("");
  const [errors, setErrors] = useState({});

  const [showFilterModal, setShowFilterModal] = useState(false); //important
  const [expense, setExpense] = useState({
    id: null,
    user_id: null,
    account_id: "", // Set default value to an empty string
    amount: "", // Set default value to an empty string
    refundable_amount: "", // Set default value to an empty string
    refunded_amount: "",
    category_id: null,
    description: "",
    reference: "",
    date: "",
    note: "",
    attachment: "",
  });
  const { showLargeContent, showQuickDetails } = useSidebarActions();

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
    setHasFilter(true);
  };
  const showExpense = (expense) => {
    setExpense(expense);
    // Use GlobalSidebar quick details view
    showQuickDetails("Expense Details", <ExpenseDetails data={expense} />);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;

  let pageSize = 1;
  if (query.limit) {
    pageSize = query?.limit;
  } else {
    pageSize = num_data_per_page;
  }

  if (typeof pageSize === "undefined") {
    pageSize = 10;
  }
  useEffect(() => {
    if (num_data_per_page > 0) {
      setQuery({ ...query, limit: num_data_per_page });
    }
  }, []);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
  // api call
  const {
    data: getExpenseData,
    isFetching: isDataFetching,
    isError: hasDataFetchingError,
    refetch,
  } = useGetExpenseDataQuery(
    { currentPage, pageSize, query: query },
    { skip: false, refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteExpense] = useDeleteExpenseMutation();
  useEffect(() => {
    document.title = "Manage Expenses";
    // Normalize various response envelopes to keep UI resilient
    const normalizedList = Array.isArray(getExpenseData?.data)
      ? getExpenseData.data
      : Array.isArray(getExpenseData?.expenses?.data)
      ? getExpenseData.expenses.data
      : Array.isArray(getExpenseData?.items)
      ? getExpenseData.items
      : Array.isArray(getExpenseData?.results)
      ? getExpenseData.results
      : [];

    const normalizedTotal =
      typeof getExpenseData?.total === "number"
        ? getExpenseData.total
        : typeof getExpenseData?.expenses?.total === "number"
        ? getExpenseData.expenses.total
        : typeof getExpenseData?.count === "number"
        ? getExpenseData.count
        : normalizedList.length;

    if (normalizedList.length > 0 || isDataFetching) {
      setExpenses(normalizedList);
      setTotalCount(normalizedTotal);
      setShowMainLoader(false);
    } else if (hasDataFetchingError) {
      setShowMainLoader(false);
      setExpenses([]);
    } else {
      // Still fetching or empty results
      setShowMainLoader(isDataFetching);
    }
    setIsPaginate(false);
  }, [getExpenseData, isDataFetching, hasDataFetchingError, currentPage]);

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
  const showExpenseFormFunc = () => {
    // open in GlobalSidebar large content
    showLargeContent(
      "Add New Expense",
      <ExpenseFormSidebar
        expenseId={null}
        onSuccess={() => {
          setIsPaginate(true);
          refetch();
        }}
      />
    );
  };

  const closeCreateModalFunc = () => {
    setShowExpenseForm(false);
    setExpense({});
  };
  const showEditModalFunc = (expense) => {
    setExpense(expense);
    showLargeContent(
      "Edit Expense",
      <ExpenseFormSidebar
        expenseId={expense.id}
        onSuccess={() => {
          setIsPaginate(true);
          refetch();
        }}
      />
    );
  };

  const filteredExpenses = expenses.filter((expense) => {
    const updatedExpense = { ...expense };
    if (updatedExpense.refundable_amount > 0) {
      updatedExpense.refunded_txt_clr =
        updatedExpense.refunded_amount === updatedExpense.refundable_amount
          ? "success"
          : "danger";
    } else {
      updatedExpense.refunded_txt_clr = "dark";
    }

    return expense.description
      .toLowerCase()
      .includes(searchTerms.toLowerCase());
  });

  const modifyDescription = (expense) => {
    return (
      <>
        {expense.description.replaceAll("_", " ").toUpperCase()}
        <br />
        <small>
          <a href={`/categories`}>{expense.category.label}</a>
        </small>
      </>
    );
  };
  const modifiedFilteredExpenses = filteredExpenses.map((expense) =>
    Object.assign({}, expense, { descriptions: modifyDescription(expense) })
  );
  const onDelete = (expense) => {
    if (userRole !== "admin") {
      Swal.fire({
        title: "Permission Denied!",
        text: "Investors are not permitted to delete any data!",
        icon: "danger",
      });
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: `You will not be able to recover the expense !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await deleteExpense({ id: expense.id }).unwrap(); // Using unwrap for error handling
            notification("success", response.message, response.description); // Display success message
          } catch (error) {
            notification(
              "error",
              error.data.message,
              error.data.description || "An error occurred."
            ); // Display error message
          }
        }
      });
    }
  };

  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "expense_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showExpense,
      permission: "expense_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "expense_delete",
      textClass: "text-danger",
    },
  ];

  const submitFilter = () => {
    setHasFilter(true);
    setShowFilterModal(false);
  };
  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const closeFilterModal = () => {
    setShowFilterModal(false);
  };
  return (
    <div>
      <MainLoader loaderVisible={isDataFetching} />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <span className={"page-title-header"}>Expense Histories</span>
        </Box>
        <Box>
          <button className={"btn primary-theme-btn btn-sm ml-2"}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <ExpenseExportButton />
          <button
            className={"btn primary-theme-btn btn-sm ml-2"}
            onClick={showExpenseFormFunc}
          >
            <Iconify icon={"eva:plus-fill"} />
          </button>
        </Box>
      </Box>

      <Row>
        <Col xs={12} sm={12} md={9}>
          <Row>
            <div
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex">
                <button
                  className={"btn btn-primary btn-sm mr-2"}
                  onClick={toggleFilterModal}
                >
                  <FontAwesomeIcon icon={faFilter} />
                  {" Filter"}
                </button>
                <FilteredParameters queries={query} setQuery={setQuery} />
              </Box>
              <Form>
                <Form.Control
                  type="text"
                  size="sm"
                  value={searchTerms}
                  onChange={(e) => setSearchTerms(e.target.value)}
                  placeholder={"search by key wards..."}
                  style={{ textTransform: "capitalize" }}
                />
              </Form>
            </div>
          </Row>
          {/* <Row>
            <Box sx={{ padding: "10px" }}>
              <FilteredParameters queries={query} setQuery={setQuery} />
            </Box>
          </Row> */}
          <Row>
            <Box sx={{ padding: "10px" }}>
              <Card
                sx={{
                  p: 5,
                  // Use theme-aware surfaces for both light and dark modes
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  // Ensure nested table containers and papers match the card surface
                  '& .MuiTableContainer-root': { backgroundColor: theme.palette.background.paper },
                  '& .MuiPaper-root': { backgroundColor: theme.palette.background.paper },
                  '& .MuiTableCell-root': { color: theme.palette.text.primary },
                }}
                style={{ padding: "0px" }}
              >
                <CommonTable
                  data={modifiedFilteredExpenses}
                  tableColumns={TABLE_HEAD}
                  actionButtons={actionParams}
                  loading={loading}
                  pagination={{
                    totalPages: totalPages ?? 0,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange,
                    pageSize: pageSize,
                    onRowsPerPageChange: handleRowsPerPageChange,
                  }}
                  cardSubTitle={`Page-${currentPage} (showing ${modifiedFilteredExpenses.length} results from ${totalCount})`}
                  isFetching={isDataFetching}
                  hasError={hasDataFetchingError}
                />
                {/*<ListTable expenses={modifiedFilteredExpenses}*/}
                {/*           tableColumns={TABLE_HEAD}*/}
                {/*           actionBtns={actionParams}*/}
                {/*           loading={loading}*/}
                {/*           paginations={{*/}
                {/*               totalPages: totalPages??0,*/}
                {/*               totalCount: totalCount,*/}
                {/*               currentPage: currentPage,*/}
                {/*               handlePageChange: handlePageChange,*/}
                {/*           }}*/}
                {/*           cardSubTitle={`Page-${currentPage} (showing ${modifiedFilteredExpenses.length} results from ${totalCount})`}*/}
                {/*           isFetching={isDataFetching}*/}
                {/*           hasError={hasDataFetchingError}*/}
                {/*/>*/}
              </Card>
            </Box>
          </Row>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <Row>
            <div className={"sidebar-form quick-expense-card"} style={{ padding: "10px" }}>
              <div className={"sidebar-form-content"}>
                <ExpenseFormSidebar
                  expenseId={null}
                  onSuccess={() => {
                    setIsPaginate(true);
                    refetch();
                  }}
                  sidebarTitle="Quick Expense"
                  showLabel={false}
                  colXS={12}
                  colMD={12}
                />
              </div>
            </div>
          </Row>
        </Col>
      </Row>

      {/* Details handled by GlobalSidebar via showExpense */}
      {showExpenseForm && (
        <ExpenseForm
          handelCloseModal={closeCreateModalFunc}
          title={"Create New Expense"}
          id={expense.id}
        />
      )}

      {showFilterModal && (
        <ExpenseFilter
          showModal={showFilterModal}
          closeModal={closeFilterModal}
          resetFilter={resetFilterParameter}
          submitFilter={submitFilter}
          queryParams={query}
          setQueryParams={setQuery}
          setHasFilter={setHasFilter}
        />
      )}
    </div>
  );
}
