import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { SettingsContext } from "../../contexts/SettingsContext";
import MainLoader from "../../components/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import { Box } from "@mui/material";
import {
  useDeleteExpenseMutation,
  useGetExpenseDataQuery,
} from "../../api/slices/expenseSlice.js";
import ExpenseShow from "./ExpenseShow.jsx";
import ExpenseFilter from "./ExpenseFilter.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import Iconify from "../../components/Iconify.jsx";

const defaultQuery = {
  searchTerm: "",
  order: "DESC",
  orderBy: "id",
  limit: 10,
  to_date: "",
  from_date: "",
};

export default function ExpenseList() {
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [hasFilter, setHasFilter] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
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
  const TABLE_HEAD = [
    { id: "date", label: "Date", align: "left" },
    { id: "descriptions", label: "Details", align: "left" },
    { id: "amount", label: "Amount", align: "right" },
    { id: "refundable_amount", label: "Refundable amount", align: "right" },
    { id: "refunded_amount", label: "Refunded amount", align: "right" },
  ];
  const showExpense = (expense) => {
    setExpense(expense);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const { applicationSettings, userRole } =
    useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;

  let pageSize = num_data_per_page;
  if (typeof pageSize === 'undefined'){
    pageSize = 10;
  }
  const totalPages = Math.ceil(totalCount / pageSize);
  // api call
  const {
    data: getExpenseData,
    isFetching: expenseDataFetching,
    isError: expenseDataError,
  } = useGetExpenseDataQuery(
    { currentPage, pageSize, query: query },
    { refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteExpense] = useDeleteExpenseMutation();

  useEffect(() => {
    document.title = "Manage Expenses";
    if (getExpenseData?.data) {
      setExpenses(getExpenseData.data);
      setTotalCount(getExpenseData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getExpenseData, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setIsPaginate(true);
  };
  const showExpenseFormFunc = () => {
    setShowExpenseForm(true);
  };
  const closeCreateModalFunc = () => {
    setShowExpenseForm(false);
    setExpense({});
  };
  const showEditModalFunc = (expense) => {
    setShowExpenseForm(true);
    setExpense(expense);
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

    return (
      expense.category.label.toLowerCase().includes(query?.searchTerm.toLowerCase()) ||
      expense.amount.toLowerCase().includes(query?.searchTerm.toLowerCase()) ||
      expense.refundable_amount
        .toLowerCase()
        .includes(query?.searchTerm.toLowerCase()) ||
      expense.refunded_amount
        .toLowerCase()
        .includes(query?.searchTerm.toLowerCase()) ||
      expense.description
        .toLowerCase()
        .includes(query?.searchTerm.toLowerCase()) ||
      expense.account.label.toLowerCase().includes(query?.searchTerm.toLowerCase())
    );
  });

  const modifyDescription = (expense) => {
    return (
      <Box display={"flex"} flexDirection={"column"}>
        <Box>{expense.description}</Box>
        <Box>
          <small>
            <a href={`/categories`}>{expense.category.label}</a>
          </small>
        </Box>
      </Box>
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

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const handelFilter = () => {
    setHasFilter(!hasFilter);
  };
  const filter = () => {
    return (
      <ExpenseFilter
        placeHolderTxt="Search by details..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
        handelFilter={handelFilter}
      />
    );
  };

  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />
      <CommonTable
        cardTitle={"Expense Histories"}
        addBTN={{
          permission: checkPermission("expense_create"),
          txt: "Create New",
          icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showExpenseFormFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "expense table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: loading,
            loadingColSpan: 6, //Table head length + 1
            rows: modifiedFilteredExpenses, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filter}
        loading={expenseDataFetching}
        loaderRow={query?.limit}
        loaderCol={4}
      />

      {showModal && (
        <ExpenseShow
          handelCloseModal={handleCloseModal}
          title={"Expense Details "}
          data={expense}
          currency={default_currency}
        />
      )}
      {showExpenseForm && (
        <ExpenseForm
          handelCloseModal={closeCreateModalFunc}
          title={"Create New Expense"}
          id={expense.id}
        />
      )}
    </div>
  );
}
