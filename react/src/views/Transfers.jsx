import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard.jsx";
import {useStateContext} from "../contexts/ContextProvider";
import {Button, Modal} from "react-bootstrap";
import DatePicker from "react-datepicker";
import Pagination from "react-bootstrap/Pagination";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoneyBillTransfer} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";

export default function Transfers() {

    const [transfer, setTransfer] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        transfer_date: null,
        note: '',
    });

    const {applicationSettings} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;


    const [errors, setErrors] = useState({});
    const [selectedFromAccountId, setSelectedFromAccountId] = useState('');
    const [selectedToAccountId, setSelectedToAccountId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [transferDate, setTransferDate] = useState(null);
    const handleTransferDateChange = (date) => {
        setTransferDate(date);
    };
    const handleChange = (e) => {
        setFormData({...transfer, [e.target.name]: e.target.value});
    };
    const {setNotification} = useStateContext();
    const [insufficientBalance, setInsufficientBalance] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const showCreateModal = () => {
        setTransfer({
            from_account_id: '',
            to_account_id: '',
            amount: '',
            transfer_date: null,
            note: '',
        });
        setErrors({});
        setShowModal(true);
        setInsufficientBalance([]);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getBankAccount = () => {
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.log('Error fetching bank accounts:', error)
            });
    }

    const [loading, setLoading] = useState(true); // Initialize loading state as true
    const [transferHistories, setTransferHistories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const filteredTransferHistories = transferHistories.filter((transfer) => {
        return transfer.amount.toLowerCase().includes(searchTerm.toLowerCase())
            || transfer.from_account.toLowerCase().includes(searchTerm.toLowerCase())
            || transfer.to_account.toLowerCase().includes(searchTerm.toLowerCase())
    });

    const getTransferHistories = (page, pageSize) => {
        axiosClient
            .get("/transfer/histories", {params: {page, pageSize}})
            .then(({data}) => {
                setTransferHistories(data.data);
                setTotalCount(data.total);
            })
            .catch((error) => {
                console.log("Unable to fetch transfer histories", error);
            })
            .finally(() => {
                setLoading(false); // Set loading state to false after data is fetched
            });
    };

    useEffect(() => {
        document.title = "Balance Transfer";
        getTransferHistories(currentPage, pageSize);
        getBankAccount();
    }, [currentPage, pageSize]);

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

     // set default date(today)
     useEffect(()=>{
        if(transferDate ===null){
            setTransferDate(new Date())
            }
       },[transferDate])

    const transferSubmit = (e) => {
        e.preventDefault();

        const transferData = {
            ...transfer,
            transfer_date: transferDate ? new Date(transferDate.getTime() - transferDate.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
        };

        axiosClient
            .post('/bank-accounts/transfer-amount', transferData)
            .then(() => {
                setTransfer({
                    from_account_id: '',
                    to_account_id: '',
                    amount: '',
                    transfer_date: null,
                    note: '',
                });
                setTransferDate(null);
                getTransferHistories();
                setShowModal(false);
                setNotification('Account transfer has been done');
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else {
                    setInsufficientBalance(response.data.message);
                }
            });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Transfer Histories</h1>
                <div>
                    <Link className="custom-btn btn-add" onClick={showCreateModal}>
                       <FontAwesomeIcon icon={faMoneyBillTransfer}/> Make a transfer
                    </Link>
                </div>
            </div>

            <WizCard className="animated fadeInDown">
                <div className="mb-4">
                    <input
                        className="custom-form-control"
                        type="text"
                        placeholder="Search Transfer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr className={"text-center"}>
                            <th>From Account</th>
                            <th>To Account</th>
                            <th>Transferred Amount</th>
                            <th>Transfer Date</th>
                            <th>Note</th>
                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={5}
                                    className="text-center"> {/* Increase the colspan to match the number of columns */}
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredTransferHistories.map((transfer) => (
                                <tr key={transfer.id} className={"text-center"}>
                                    <td>{transfer.from_account}</td>
                                    <td>{transfer.to_account}</td>
                                    <td>{default_currency}{transfer.amount}</td>
                                    <td>{transfer.transfer_date}</td>
                                    <td>{transfer.note}</td>
                                </tr>
                            ))}
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

                <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <span className="title-text">Balance Transfer</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <div className="form-group">
                                <label className="custom-form-label">From Account</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedFromAccountId}
                                    id="from-bank-account"
                                    name="form_account_id"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedFromAccountId(value);
                                        setTransfer({...transfer, from_account_id: parseInt(value)});
                                    }}>
                                    <option defaultValue>Select a bank account</option>
                                    {bankAccounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                        </option>
                                    ))}
                                </select>
                                {errors.from_account_id && <p className="error-message mt-2">{errors.from_account_id[0]}</p>}
                            </div>

                            <div className="form-group">
                                <label className="custom-form-label">To Account ID:</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedToAccountId}
                                    id="to-bank-account"
                                    name="to_account_id"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedToAccountId(value);
                                        setTransfer({...transfer, to_account_id: parseInt(value)});
                                    }}>
                                    <option defaultValue>Select a bank account</option>
                                    {bankAccounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                        </option>
                                    ))}
                                </select>
                                {errors.to_account_id && <p className="error-message mt-2">{errors.to_account_id[0]}</p>}
                            </div>

                            <div className="form-group">
                                <label className="custom-form-label">Amount:</label>
                                <input
                                    className="custom-form-control"
                                    type="number"
                                    name="amount"
                                    value={transfer.amount}
                                    onChange={(e) => setTransfer({...transfer, amount: e.target.value})}
                                />
                                {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                            </div>


                            <div className="form-group">
                                <label className="custom-form-label">Transfer Date:</label>
                                <DatePicker
                                    className="custom-form-control"
                                    selected={transferDate}
                                    onChange={handleTransferDateChange}
                                    onSelect={handleTransferDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Transfer Date"
                                />
                                {errors.transfer_date && <p className="error-message mt-2">{errors.transfer_date[0]}</p>}
                            </div>

                            <div className="form-group">
                                <label className="custom-form-label">Note:</label>
                                <input
                                    className="custom-form-control"
                                    type="text"
                                    name="note"
                                    value={transfer.note}
                                    onChange={(e) => setTransfer({...transfer, note: e.target.value})}
                                />
                            </div>
                            {insufficientBalance && <p className="error-message mt-2">{insufficientBalance}</p>}

                    </Modal.Body>
                    <Modal.Footer>

                        <Button className="btn-sm" variant="primary" onClick={transferSubmit}>
                            Transfer Amount
                        </Button>
                        <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </WizCard>
        </>
    );
}
