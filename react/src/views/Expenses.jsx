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
import {Button, Modal} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown"
import ActionButtonHelpers from "../helper/ActionButtonHelpers";

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
        expense_date: '',
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
        Swal.fire({
            title: 'Are you sure?',
            text: `You will not be able to recover the expense !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`expense/${expense.id}`).then(() => {
                    getExpenses();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Expense has been deleted.',
                        icon: 'success',
                    });
                }).catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Expense could not be deleted.',
                        icon: 'error',
                    });
                });
            }
        });
    };

    const actionParams = {
        route:{
            editRoute:'/expense/',
            viewRoute:'',
            deleteRoute:''
        },
    }
    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Expense Histories</h1>
                {userRole ==='admin' && <Link className="btn-add align-right mr-3" to="/expense/new"><FontAwesomeIcon icon={faMinus}/> Add
                    New</Link>}
             
                <ExpenseExportButton/>
            </div>

            <WizCard className="animated fadeInDown">
                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search Expense..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={'text-center'}>
                            <th>Details</th>
                            <th>Sector</th>
                            <th>Amount</th>
                            <th>Refundable amount</th>
                            <th>Refunded amount</th>
                            <th>Date</th>
                           <th width="20%">Action</th>
                            
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
                                        <td>{expense.description}</td>
                                        <td>{expense.category_name}</td>
                                        <td>{default_currency + expense.amount}</td>
                                        <td>{default_currency + expense.refundable_amount}</td>
                                        <td className={"text-" + expense.refunded_txt_clr}>{default_currency + expense.refunded_amount}</td>

                                        <td>{expense.expense_date}</td>

                                      
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

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Expense Details</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="footable table table-bordered table-striped mb-0">
                        <thead></thead>
                        <tbody>
                        <tr>
                            <td width="50%">
                                <strong>User Name :</strong>
                            </td>
                            <td>{expense.user_name}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Account Number :</strong>
                            </td>
                            <td> {expense.account_number}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Bank Name :</strong>
                            </td>
                            <td> {expense.bank_name}  </td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Expense Amount :</strong>
                            </td>
                            <td> {expense.amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Refundable Amount :</strong>
                            </td>
                            <td> {expense.refundable_amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Refunded Amount :</strong>
                            </td>
                            <td> {expense.refunded_amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Description :</strong>
                            </td>
                            <td> {expense.description}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Note :</strong>
                            </td>
                            <td> {expense.note}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Reference :</strong>
                            </td>
                            <td> {expense.reference}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Date :</strong>
                            </td>
                            <td>
                                {expense.expense_date}
                            </td>
                        </tr>

                        <tr>
                            <td width="50%">
                                <strong>Attachments :</strong>
                            </td>
                            <td>{expense.attachment &&
                                <DownloadAttachment filename={expense.attachment}/>}</td>
                        </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}
