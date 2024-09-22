import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import ExpenseExportButton from "../components/ExpenseExportButton.jsx";
import WizCard from "../components/WizCard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBuildingFlag,
    faEdit,
    faList12,
    faListOl,
    faMinus, faPlus,
    faThList,
    faTrash
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import DownloadAttachment from "../components/DownloadAttachment";
import {SettingsContext} from "../contexts/SettingsContext";
import {Button, Image, Modal} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown"
import ActionButtonHelpers from "../helper/ActionButtonHelpers";
import MainLoader from "../components/MainLoader.jsx";
import ExpenseModal from "../helper/ExpenseModal.jsx";
import { notification } from "../components/ToastNotification.jsx";
import {checkPermission} from "../helper/HelperFunctions.js";
import CommonTable from "../helper/CommonTable.jsx";
import {Box} from "@mui/material";

export default function Expenses() {

    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [expense, setExpense] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        refundable_amount: '', // Set default value to an empty string
        refunded_amount: '',
        category_id: null,
        description: '',
        reference: '',
        date: '',
        note: '',
        attachment: ''
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
    }
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const {applicationSettings, userRole,userPermission} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        document.title = "Manage Expenses";
        getExpenses(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const getExpenses = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/expenses', {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setExpenses(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            })
    }


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };


    const filteredExpenses = expenses.filter((expense) => {

        if (expense.refundable_amount > 0) {
            if (expense.refunded_amount === expense.refundable_amount) {
                expense.refunded_txt_clr = 'success';
            } else {
                expense.refunded_txt_clr = 'danger';
            }
        } else {
            expense.refunded_txt_clr = 'dark';
        }

        return expense.user_name.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.account_number.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.category_name.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.amount.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.refundable_amount.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.refunded_amount.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.description.toLowerCase().includes(searchTerm.toLowerCase())
            || expense.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
    });

    const modifyDescription = (expense)=>{
        return (<Box display={'flex'} flexDirection={"column"}>
            <Box>{expense.description}</Box>
            <Box>
                <small>
                    <a href={`/categories`}>{expense.category_name}</a>
                </small>
            </Box>
        </Box>)
    }
    const modifiedFilteredExpenses = filteredExpenses.map((expense,index)=>{
        expense.descriptions = modifyDescription(expense);
        return expense;
    });
    const onDelete = (expense) => {
        if (userRole !== 'admin') {
            Swal.fire({
                title: 'Permission Denied!',
                text: 'Investors are not permitted to delete any data!',
                icon: 'danger',
            });
        } else {
            Swal.fire({
                title: 'Are you sure?',
                text: `You will not be able to recover the expense !`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    axiosClient.delete(`expense/${expense.id}`).then((data) => {
                        getExpenses();
                        notification('success',data?.message,data?.description)
                    }).catch(err => {
                        if (err.response) { 
                            const error = err.response.data
                            notification('error',error?.message,error.description)
                        }
                    })
                }
            });
        }


    };

    const actionParams = {
        route: {
            editRoute: "/expense/",
            viewRoute: "",
            deleteRoute: ""
        },
    }
    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <CommonTable
                cardTitle={"Expense Histories"}
                addBTN={
                    {
                        permission: checkPermission(userPermission.expense_create),
                        txt: "Create New",
                        icon:(<FontAwesomeIcon icon={faPlus}/>), //"faBuildingFlag",
                        link:"/expense/new"
                    }
                }
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange
                }}
                table={{
                    size: "small",
                    ariaLabel: 'expense table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 6, //Table head length + 1
                        rows: modifiedFilteredExpenses,//rendering data
                    },
                    actionBtn: {
                        module: expense,
                        showModule: showExpense,
                        deleteFunc: onDelete,
                        params: actionParams,
                        editDropdown: userPermission.expense_edit,
                        showPermission: userPermission.expense_view,
                        deletePermission: userPermission.expense_delete
                    }
                }}
                filter={{
                    filterByText:true,
                    placeHolderTxt:'Search by column names...',
                    searchBoxValue:searchTerm,
                    handelSearch: setSearchTerm
                }}
            />

            <ExpenseModal showModal={showModal}
                          handelCloseModal={handleCloseModal}
                          title={'Expense Details '}
                          data={expense}
                          currency={default_currency}
            />
        </div>
    )
}







