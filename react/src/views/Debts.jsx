import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import React, {useContext, useEffect, useState} from "react";
import Swal from "sweetalert2";
import WizCard from "../components/WizCard";
import {useStateContext} from "../contexts/ContextProvider";
import {Button, Modal} from "react-bootstrap";
import DatePicker from "react-datepicker";
import Pagination from "react-bootstrap/Pagination";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faMoneyCheck, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";

export default function Debts() {


    const [debts, setDebts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const {setNotification} = useStateContext();
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);

    const {applicationSettings} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const [date, setDate] = useState(null);
    const handleDateChange = (date) => {
        setDate(date);
    };

    const [debt, setDebt] = useState({
        id: null,
        amount: null,
        account_id: null,
        type: '',
        person: '',
        date: null,
        note: ''
    });

    const filterDebts = debts.filter(
        (debt) =>
            debt.amount.includes(searchTerm) ||
            debt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            debt.person.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showCreateModal = () => {
        setDebt({
            id: null,
            amount: null,
            account_id: null,
            type: '',
            person: '',
            date: null,
            note: ''
        });
        setErrors(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getBankAccounts = () => {
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.log('Error fetching bank accounts:', error)
            });
    }

    const getDebts = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/debts', {params: {page, pageSize}}).then(({data}) => {
            setLoading(false);
            setDebts(data.debts);
            setTotalCount(data.total);
        }).catch(error => {
            console.log('Unable to fetch debt data', error);
        })
    }

    useEffect(() => {
        document.title = "Debts / Loan";
        getDebts(currentPage, pageSize);
        getBankAccounts();
    }, [currentPage, pageSize]);

    const edit = (selectedDebt) => {
        console.log(selectedDebt);
        setSelectedAccountId(selectedDebt.account_id);
        setDebt(selectedDebt);
        setErrors(null);
        setShowModal(true);
    }

    const debtSubmit = (e) => {
        e.preventDefault();



        if (debt.id) {
            alert("Updating existing debt data");
        } else {
            const debtData = {
                ...debt,
                amount: parseFloat(debt.amount), // Convert amount to a number
                account_id: parseInt(selectedAccountId), // Convert account_id to an integer
                type: debt.type, // Include type field
                person: debt.person, // Include person field
                date: date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
            };

            axiosClient.post('/debts/store', debtData)
                .then(response => {
                    if (response.data.status === 'insufficient_balance') {
                        setNotification(response.data.message);
                    }

                    if (response.data.status === 'success') {
                        setNotification(response.data.message);
                        getDebts(currentPage, pageSize);
                        setShowModal(false);

                        setDebt({
                            id: null,
                            amount: null,
                            account_id: null,
                            type: '',
                            person: '',
                            date: null,
                            note: ''
                        });
                        setDate(null);
                        setErrors(null);
                    }

                    if (response.data.status === 'fail') {
                        setNotification(response.data.message);
                    }

                })
                .catch(error => {
                    // Handle error
                    console.log('Error creating debt:', error);
                    setErrors(error.response.data.errors); // Set the error messages received from the server
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const onDelete = (debt) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the debt amount of ${debt.amount}!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`/debts/delete/${debt.id}`)
                    .then(() => {
                        getDebts(currentPage, pageSize);
                        Swal.fire({
                            title: "Deleted!",
                            text: "debt has been deleted.",
                            icon: "success",
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        Swal.fire({
                            title: "Error!",
                            text: "debt could not be deleted.",
                            icon: "error",
                        });
                    });
            }
        });
    };

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

    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Debts/Loans</h1>
                <div>
                    <Link className="custom-btn btn-add" onClick={showCreateModal}><FontAwesomeIcon icon={faMoneyCheck}/> Add New</Link>
                </div>
            </div>


            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search debts..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
                            <th>AMOUNT</th>
                            <th className="text-center">TYPE</th>
                            <th className="text-center">ACCOUNT</th>
                            <th className="text-center">PERSON</th>
                            <th className="text-center">DATE</th>
                            <th className="text-center">NOTE</th>
                            <th className="text-center">ACTIONS</th>
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
                            {filterDebts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No debts found
                                    </td>
                                </tr>
                            ) : (
                                filterDebts.map((debt) => (
                                    <tr key={debt.id}>
                                        <td>{default_currency}{debt.amount}</td>
                                        <td className="text-center">{debt.type.toUpperCase()}</td>
                                        <td className="text-center">{debt.account}</td>
                                        <td className="text-center">{debt.type === 'borrow' ? "Borrowed from " : "Lend to "} {debt.person}</td>
                                        <td className="text-center">{debt.date}</td>
                                        <td className="text-center">{debt.note}</td>
                                        <td className="text-center">
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                            <span>
                                                <Link className="btn-edit"
                                                      to={"/manage-debt/" + debt.id}><FontAwesomeIcon icon={faEdit}/> Manage</Link>
                                            </span>
                                                <span>
                                               {/* <Link className="btn-info"*/}
                                                    {/*       to={`#`} onClick={ () => edit(debt) } >*/}
                                                    {/*    Edit*/}
                                                    {/*</Link>*/}
                                            </span>
                                                <span>
                                               <a onClick={(e) => onDelete(debt)}
                                                  className="btn-delete">
                                                  <FontAwesomeIcon icon={faTrash}/> Delete
                                               </a>
                                            </span>
                                            </div>
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
                        {debt.id ? (
                            <span>Update Debt</span>
                        ) : (
                            <span className="title-text">Add Debt</span>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="form-group">
                        <label htmlFor="amount" className="custom-form-label">Amount :</label>
                        <input className="custom-form-control"
                               value={debt.amount}
                               onChange={e => setDebt(prevDebt => ({...prevDebt, amount: e.target.value}))}
                               placeholder="Amount"
                        />

                        {errors && errors.amount && (
                            <div className="text-danger mt-2">{errors.amount[0]}</div>
                        )}

                    </div>
                    <div className="form-group">
                        <label htmlFor="bank_account" className="custom-form-label">Select Bank Account :</label>
                        <select className="custom-form-control"
                                value={selectedAccountId}
                                id="bank-account"
                                name="bank-account"
                                onChange={(event) => {
                                    const value = event.target.value || '';
                                    setSelectedAccountId(value);
                                    setDebt({...debt, account_id: parseInt(value)});
                                }}>
                            <option defaultValue>Select a bank account</option>
                            {bankAccounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                </option>
                            ))}
                        </select>

                        {errors && errors.account_id && (
                            <div className="text-danger mt-2">{errors.account_id[0]}</div>
                        )}

                    </div>
                    <div className="form-group">
                        <label htmlFor="type" className="custom-form-label">Select Type :</label>
                        <select className="custom-form-control"
                                value={debt.type}
                                onChange={e => setDebt(prevDebt => ({...prevDebt, type: e.target.value}))}
                                required // Add required attribute
                        >
                            <option value="">Select Type</option>
                            <option value="lend">Lend</option>
                            <option value="borrow">Borrow</option>
                        </select>

                        {errors && errors.type && (
                            <div className="text-danger mt-2">{errors.type[0]}</div>
                        )}

                    </div>

                    <div className="form-group">
                        <label htmlFor="amount" className="custom-form-label">Person :</label>
                        <input className="custom-form-control"
                               value={debt.person || ''}
                               onChange={e => setDebt(prevDebt => ({...prevDebt, person: e.target.value}))}
                               placeholder="Person"
                               required // Add required attribute
                        />

                        {errors && errors.person && (
                            <div className="text-danger mt-2">{errors.person[0]}</div>
                        )}

                    </div>


                    <div className="form-group">
                        <label htmlFor="income_date" className="custom-form-label">Date :</label>
                        <DatePicker className="custom-form-control"
                                    selected={date}
                                    onChange={handleDateChange}
                                    onSelect={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select Date"
                        />

                        {errors && errors.date && (
                            <div className="text-danger mt-2">{errors.date[0]}</div>
                        )}

                    </div>


                    <div className="form-group">
                        <label htmlFor="note" className="custom-form-label">Note :</label>
                        <input className="custom-form-control"
                               value={debt.note || ''}
                               onChange={e => setDebt(prevDebt => ({...prevDebt, note: e.target.value}))}
                               placeholder="Note"
                        />

                        {errors && errors.note && (
                            <div className="text-danger mt-2">{errors.note[0]}</div>
                        )}

                    </div>


                </Modal.Body>
                <Modal.Footer>

                    <Button className="btn-sm" variant="primary" onClick={debtSubmit}>
                        Add new debt

                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}
