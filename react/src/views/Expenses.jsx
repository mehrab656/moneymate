import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import ExpenseExportButton from "../components/ExpenseExportButton.jsx";
import WizCard from "../components/WizCard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faMinus, faTrash} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-bootstrap/Pagination";
import DownloadAttachment from "../components/DownloadAttachment";
import {SettingsContext} from "../contexts/SettingsContext";

export default function Expenses() {

    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const {applicationSettings} = useContext(SettingsContext);
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
                //console.log(data.data);
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


    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Expense Histories</h1>
                <Link className="btn-add align-right mr-3" to="/expense/new"><FontAwesomeIcon icon={faMinus}/> Add
                    New</Link>
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
                            <th>Expense By</th>
                            <th>Payment Method</th>
                            <th>Sector</th>
                            <th>Amount</th>
                            <th>Refundable amount</th>
                            <th>Refunded amount</th>
                            <th>Attached</th>
                            <th>Description</th>
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
                                        <td>{expense.user_name}</td>
                                        <td>{expense.account_number}</td>
                                        <td>{expense.category_name}</td>
                                        <td>{default_currency + expense.amount}</td>
                                        <td>{default_currency + expense.refundable_amount}</td>
                                        <td className={"text-" + expense.refunded_txt_clr}>{default_currency + expense.refunded_amount}</td>
                                        <td>{expense.attachment &&
                                            <DownloadAttachment filename={expense.attachment}/>}</td>

                                        <td>{expense.description !== 'null' ? expense.description : ''}</td>
                                        <td>{expense.expense_date}</td>
                                        <td>
                                            <Link className="btn-edit" to={"/expense/" + expense.id}>
                                                <FontAwesomeIcon icon={faEdit}/> Edit
                                            </Link>
                                            &nbsp;
                                            <a onClick={() => onDelete(expense)} className="btn-delete"><FontAwesomeIcon
                                                icon={faTrash}/> Delete</a>
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
        </div>
    )
}
