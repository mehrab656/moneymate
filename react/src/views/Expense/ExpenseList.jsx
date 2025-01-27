import React, {useContext, useEffect, useState} from "react";
import Swal from "sweetalert2";
import {SettingsContext} from "../../contexts/SettingsContext";
import MainLoader from "../../components/MainLoader.jsx";
import {notification} from "../../components/ToastNotification.jsx";
import {checkPermission} from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import {Box} from "@mui/material";
import {
    useDeleteExpenseMutation,
    useGetExpenseDataQuery,
} from "../../api/slices/expenseSlice.js";
import ExpenseShow from "./ExpenseShow.jsx";
import ExpenseFilter from "./ExpenseFilter.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import { Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faFilter} from "@fortawesome/free-solid-svg-icons";
import FilteredParameters from "./Components/FilteredParameters.jsx";
import ListTable from "./Components/ListTable.jsx";

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
    {id: "date", label: "Date", align: "left"},
    {id: "descriptions", label: "Details", align: "left"},
    {id: "amount", label: "Amount", align: "right"}
];

export default function ExpenseList() {
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showMainLoader, setShowMainLoader] = useState(false);
    const [isPaginate, setIsPaginate] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const [hasFilter, setHasFilter] = useState(true);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [searchTerms, setSearchTerms] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);//important
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
    const toggleFilterModal = () => {
        setShowFilterModal(!showFilterModal);
        setHasFilter(false);
    }
    const showExpense = (expense) => {
        setExpense(expense);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const {applicationSettings, userRole} =
        useContext(SettingsContext);
    const {num_data_per_page, default_currency} = applicationSettings;


    let pageSize = query?.limit??num_data_per_page;
    if (typeof pageSize === 'undefined') {
        pageSize = 10;
    }
    useEffect(() => {
        if (num_data_per_page>0){
            setQuery({...query,limit: num_data_per_page})
        }
    }, []);
    const totalPages = Math.ceil(totalCount / pageSize);
    // api call
    const {
        data: getExpenseData,
        isFetching: isDataFetching,
        isError: hasDataFetchingError,
    } = useGetExpenseDataQuery(
        {currentPage, pageSize, query: query},
        {skip: !hasFilter},
        {refetchOnMountOrArgChange: isPaginate}
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
        const updatedExpense = {...expense};
        if (updatedExpense.refundable_amount > 0) {
            updatedExpense.refunded_txt_clr =
                updatedExpense.refunded_amount === updatedExpense.refundable_amount
                    ? "success"
                    : "danger";
        } else {
            updatedExpense.refunded_txt_clr = "dark";
        }

        return (expense.description.toLowerCase().includes(searchTerms.toLowerCase()));

        // return (
        //     expense.category.label.toLowerCase().includes(searchTerms.toLowerCase()) ||
        //     expense.amount.toLowerCase().includes(searchTerms.toLowerCase()) ||
        //     expense.refundable_amount.toLowerCase().includes(searchTerms.toLowerCase()) ||
        //     expense.refunded_amount.toLowerCase().includes(searchTerms.toLowerCase()) ||
        //     expense.description.toLowerCase().includes(searchTerms.toLowerCase() ||
        //     expense.account.label.toLowerCase().includes(searchTerms.toLowerCase())
        // );
    });

    const modifyDescription = (expense) => {
        return (
           <>
               {expense.description.replaceAll('_',' ').toUpperCase()}
               <br/>
               <small>
                   <a href={`/categories`}>{expense.category.label}</a>
               </small>
           </>

        );
    };
    const modifiedFilteredExpenses = filteredExpenses.map((expense) =>
        Object.assign({}, expense, {descriptions: modifyDescription(expense)})
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
                        const response = await deleteExpense({id: expense.id}).unwrap(); // Using unwrap for error handling
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

    const submitFilter = ()=>{
        setHasFilter(true);
        setShowFilterModal(false);
    }
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    };
    const closeFilterModal = ()=>{
        setShowFilterModal(false);
    }
    return (
        <div>
            <MainLoader loaderVisible={isDataFetching}/>

            <div className={"row mb-2"}>
                <div className={"col-md-4"}>
                    <span className={"page-title-header"}>Expense Histories</span>
                </div>
                <div className={"col-md-8 text-end"}>
                    <button className={'btn btn-secondary btn-sm mr-2'}>
                        <FontAwesomeIcon icon={faDownload}/>{' Download CSV'}
                    </button>
                    <button className={'btn-sm btn-add'} onClick={showExpenseFormFunc}>
                        <FontAwesomeIcon icon={faFilter}/>{' Add Expense'}
                    </button>
                </div>
            </div>

            <div className={"row mb-2"}>
                <div className={"col-md-8"}>
                    <button className={'btn btn-secondary btn-sm mr-2'} onClick={toggleFilterModal}>
                        <FontAwesomeIcon icon={faFilter}/>{' Filter'}</button>
                </div>

                <div className={"col-md-4"}>
                    <Form.Control
                        type="text"
                        size="sm"
                        value={searchTerms}
                        onChange={(e) => setSearchTerms(e.target.value)}
                        placeholder={"search by key wards..."}
                        style={{textTransform: "capitalize"}}
                    />
                </div>
            </div>
            <div className="row mb-2">
                <FilteredParameters queries={query}
                setQuery={setQuery}/>
            </div>

            <ListTable expenses={modifiedFilteredExpenses}
                       tableColumns={TABLE_HEAD}
                       actionBtns={actionParams}
                       loading={loading}
                       paginations={{
                           totalPages: totalPages,
                           totalCount: totalCount,
                           currentPage: currentPage,
                           handlePageChange: handlePageChange,
                       }}
                       cardSubTitle={`Page-${currentPage} (showing ${modifiedFilteredExpenses.length} results from ${totalCount})`}
                       isFetching={isDataFetching}
                       hasError={hasDataFetchingError}
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

            {showFilterModal && (
                <ExpenseFilter
                    showModal={showFilterModal}
                    closeModal={closeFilterModal}
                    resetFilter={resetFilterParameter}
                    submitFilter={submitFilter}
                    queryParams={query}
                    setQueryParams={setQuery}
                    setHasFilter={setHasFilter}
                />)}
        </div>
    );
}
