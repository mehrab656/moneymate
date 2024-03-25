import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import ExpenseExportButton from "../components/ExpenseExportButton.jsx";
import WizCard from "../components/WizCard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faList12, faListOl, faMinus, faThList, faTrash} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import DownloadAttachment from "../components/DownloadAttachment";
import {SettingsContext} from "../contexts/SettingsContext";
import {Button, Image, Modal} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown"
import ActionButtonHelpers from "../helper/ActionButtonHelpers";
import MainLoader from "../components/MainLoader.jsx";
import ExpenseModal from "../helper/ExpenseModal.jsx";
import { notification } from "../components/ToastNotification.jsx";

export default function Expenses() {

    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const baseURL= `${window.__APP_CONFIG__.VITE_APP_BASE_URL}/api`
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
    const showExpense = (expense) => {
        setExpense(expense);
        setShowModal(true);
    }
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const {applicationSettings, userRole} = useContext(SettingsContext);
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


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => handlePageChange(i)}>
                {i}
            </Pagination.Item>
        );
    }

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
            editRoute: '/expense/',
            viewRoute: '',
            deleteRoute: ''
        },
    }
    return (
        <div>
            <MainLoader loaderVisible={loading}/>

            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-3">
                        <h1 className="title-text mb-0">Expense Histories</h1>
                    </div>
                    <div className="col-7">
                    <div className="mb-4">
                            <input className="custom-form-control"
                                   type="text"
                                   placeholder="Search Expense..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="col-2">
                        <ExpenseExportButton/>
                        {userRole === 'admin' &&
                            <Link className="btn-add float-end" to="/expense/new"><FontAwesomeIcon icon={faMinus}/> Add New</Link>}
                    </div>
                </div>

                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            <th>Date</th>
                            <th>Details</th>
                            {/*<th>Sector</th>*/}
                            <th>Amount</th>
                            <th>Refundable amount</th>
                            <th>Refunded amount</th>
                            <th>Action</th>

                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={8} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No expense found
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr className={'text-center'} key={expense.id}>
                                        <td><small>{expense.date}</small></td>
                                        <td className={'text-start'}>{expense.description}
                                            <div>
                                                <small>
                                                    <a href={`/categories`}>{expense.category_name}</a>
                                                </small>
                                            </div>
                                        </td>
                                        {/*<td className={'text-start'}>{expense.category_name}</td>*/}
                                        <td className={'amount'}>{default_currency + ' ' + expense.amount}</td>
                                        <td className={'amount'}>{default_currency + ' ' + expense.refundable_amount}</td>
                                        <td className={"amount text-" + expense.refunded_txt_clr}>{default_currency + ' ' + expense.refunded_amount}</td>
                                        <td>
                                            <ActionButtonHelpers
                                                module={expense}
                                                showModule={showExpense}
                                                deleteFunc={onDelete}
                                                params={actionParams}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        )}
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />

                    </Pagination>
                )}

            </WizCard>
            <ExpenseModal showModal={showModal}
                          handelCloseModal={handleCloseModal}
                          title={'Expense Details '}
                          data={expense}
                          currency={default_currency}
            />
        </div>
    )
}
