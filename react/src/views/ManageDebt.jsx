import {useParams} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import axiosClient from '../axios-client.js';
import {Button, Form, Modal} from 'react-bootstrap';
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from "react-datepicker";
import MainLoader from '../components/MainLoader.jsx';

export default function ManageDebt() {
    let {id} = useParams();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [debt, setDebt] = useState({});
    const [debtHistories, setDebtHistories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showRepayModal, setShowRepayModal] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const {setNotification} = useStateContext();

    const [date, setDate] = useState(null);
    const handleDateChange = (date) => {
        setDate(date);
    };

    let textColor = 'success';

    const [borrow, setBorrow] = useState({
        id: null,
        amount: '',
        date: null,
        debt_id: id,
        account_id: null,
        note: null
    });

    const [repayment, setRepayment] = useState({
        id: null,
        amount: null,
        note: null,
        debt_id: id,
        date: null,
        account_id: null
    });

    const [tableData, setTableData] = useState([]);
    const [insufficientBalance, setInsufficientBalance] = useState([]);


    const getDebt = () => {
        axiosClient.get(`/debts/${id}`).then(({data}) => {
            setDebt(data);
            setLoading(false);
        });
    };

    const getAccounts = () => {
        setLoading(true);
        axiosClient
            .get("/all-bank-account")
            .then(({data}) => {
                setLoading(false);
                setBankAccounts(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getDebtHistory = () => {
        setLoading(true);
        axiosClient.get(`/get-debt-history/${id}`).then(({data}) => {
            setDebtHistories(data.infos);
            setLoading(false);
        });
    }

    useEffect(() => {
        document.title = "Manage Debt";
        getDebt();
        getAccounts();
        getDebtHistory()
    }, []);

    const handleBorrowMoreClick = () => {
        setErrors(null);
        setInsufficientBalance([]);
        setShowModal(true);
    };

    const handleRepayClick = () => {
        setErrors(null);
        setInsufficientBalance([]);
        setShowRepayModal(true);

    };

    const handleRepayCloseModal = () => {
        setShowRepayModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBorrowSaveChanges = (e) => {
        e.preventDefault();
        setLoading(true)
        const borrowData = {
            ...borrow,
            date: date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
        };


        let api_endpoint = '/lends/add';
        if (debt.type === 'borrow') {
            api_endpoint = '/borrows/add';
        }

        axiosClient
            .post(api_endpoint, borrowData)
            .then(({data}) => {

                if (data.status === 422) {
                    setErrors(data.data.errors);
                } else {
                    setNotification(data.message);
                    if (data.status === 'success') {
                        setShowModal(false);
                        getDebt(); // Fetch the updated debt data
                        getDebtHistory()
                        getAccounts();
                        setBorrow({
                            id: null,
                            amount: '',
                            date: null,
                            debt_id: id,
                            account_id: null
                        });
                        setDate(null);
                    }
                }
                setLoading(false)
            })
            .catch((error) => {
                setLoading(false)
                const response = error.response;
                setErrors(response.data.errors);
            });
    };


    useEffect(() => {
        if (debt.date) {
            // @fixme
        }
    }, [debt]);

    const handleRepaySaveChanges = (e) => {
        e.preventDefault();
        setLoading(true)
        const repaymentData = {
            ...repayment,
            date: date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : null,
        };

        setErrors(null);
        let api_endpoint = '/lends/collection/add';
        if (debt.type === 'borrow') {
            api_endpoint = '/repayments/add';
        }

        axiosClient
            .post(api_endpoint, repaymentData)
            .then(({data}) => {


                if (data.status === 422) {
                    setErrors(data.data.errors);
                } else {
                    if (data.action_status === 'insufficient_balance' || data.action_status === 'invalid_amount') {
                        setInsufficientBalance(data.message); // Let's show the message under bank selection select element
                        const response = error.response;
                        setErrors(null);
                        if (data && data.status === 409) {
                            setErrors({bank_name: ["Bank name already exists"]});
                        } else if (data && data.status === 422) {
                            setErrors(data.data.errors);
                        }
                        setLoading(false);
                    } else {
                        setNotification(data.message);
                        getDebt(); // Fetch the updated debt data
                        getDebtHistory()
                        getAccounts();
                        setShowRepayModal(false);
                        setRepayment({
                            id: null,
                            amount: '',
                            note: null,
                            debt_id: id,
                            account_id: null,
                            date: null,
                        });

                        setDate(null);
                        setLoading(false);
                    }
                }
                setLoading(false)
            })
            .catch((error) => {
                const response = error.response;
                setErrors(response.data.errors);
                setLoading(false)
            });


    };

    useEffect(() => {
        if (!loading) {
            setTableData([debt]); // Update the table data when debt changes
        }
    }, [debt, loading]);

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0 uppercase">Manage {debt.type}</h1>
            </div>

            <table className="table-bordered table-striped">
                <thead>
                <tr className={'text-center'}>
                    <th>Amount</th>
                    <th>Person</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr className={'text-center'}>
                        <td colSpan={3} className="text-center">
                            Loading...
                        </td>
                    </tr>
                )}
                {!loading &&
                    tableData.map((dataEntry) => (
                        <tr className={'text-center'} key={dataEntry.id}>
                            <td>{dataEntry.amount}</td>
                            <td>{dataEntry.person}</td>
                            <td>{dataEntry.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br/>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <a className="btn-delete" onClick={handleBorrowMoreClick}>
                    {debt.type === "borrow" ? "+ Borrow more" : "+ Lend More"}
                </a>
                <a className="btn-edit" onClick={handleRepayClick}>
                    {debt.type === "borrow" ? "- Repay" : "+ Debt Collection"}
                </a>
            </div>


            <br/>

            <div className="table-responsive-sm">
                <table className="table table-bordered custom-table">
                    <thead>
                    <tr>
                        <th className={'text-center'}>Date</th>
                        <th className={'text-center'}>Type</th>
                        <th className={'text-center'}>Amount</th>
                        <th className={'text-center'}>Notes</th>
                        <th className={'text-center'}>Bank Name</th>
                    </tr>
                    </thead>
                    {loading && (
                        <tbody>
                        <tr>
                            <td colSpan={6} className="text-center">
                                Loading...
                            </td>
                        </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                        {debtHistories.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    No bank found
                                </td>
                            </tr>
                        ) : (debtHistories.map((debtHistory) => {
                                if (debtHistory.type === 'Lend' || debtHistory.type === 'Borrow') {
                                    textColor = 'danger'
                                }

                                if (debtHistory.type === 'Debt Collection' || debtHistory.type === 'Repayment') {
                                    textColor = 'success'
                                }

                                return (
                                    <tr className={'text-center'} key={debtHistory.type + debtHistory.id}>
                                        <td className={'text-' + textColor}>{debtHistory.date}</td>
                                        <td className={'text-' + textColor}>{debtHistory.type}</td>
                                        <td className={'text-' + textColor}>{debtHistory.amount}</td>
                                        <td className={'text-' + textColor}>{debtHistory.note}</td>
                                        <td className={'text-' + textColor}>{debtHistory.bank_name}</td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    )}
                </table>
            </div>

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{debt.type === 'borrow' ? 'Borrow More' : 'Lend More'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="amount">
                            <Form.Label>
                                <strong>Amount</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setBorrow({...borrow, amount: e.target.value})}
                                type="number"
                                placeholder="Enter amount"
                            />

                            {errors && errors.amount && (
                                <div className="text-danger mt-2">{errors.amount[0]}</div>
                            )}

                        </Form.Group>

                        <br/>
                        <Form.Group controlId="note">
                            <Form.Label>
                                <strong>Note</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setBorrow({...borrow, note: e.target.value})}
                                placeholder="Enter Note"
                            />

                            {errors && errors.note && (
                                <div className="text-danger mt-2">{errors.note[0]}</div>
                            )}

                        </Form.Group>

                        <br/>
                        <Form.Group controlId="bank_account">
                            <Form.Label>
                                <strong>Select Bank Account</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setBorrow({...borrow, account_id: e.target.value})}
                                as="select"
                                defaultValue=""
                            >
                                <option value="">Choose a bank account...</option>
                                {bankAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                    </option>
                                ))}
                            </Form.Control>

                            {errors && errors.account_id && (
                                <div className="text-danger mt-2">{errors.account_id[0]}</div>
                            )}

                            {insufficientBalance && (
                                <div className="text-danger mt-2">{insufficientBalance}</div>
                            )}

                        </Form.Group>
                        <div className="form-group">
                            <label htmlFor="date" className="custom-form-label">Date :</label>
                            <DatePicker
                                className="custom-form-control"
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

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button className="btn-sm" variant="primary" onClick={handleBorrowSaveChanges}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showRepayModal} centered onHide={handleRepayCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{debt.type === 'borrow' ? 'Repay' : 'Debt Collection'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="amount">
                            <Form.Label>
                                <strong>Amount</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setRepayment({...repayment, amount: e.target.value})}
                                type="number" placeholder="Enter amount"/>
                            {errors && errors.amount && (
                                <div className="text-danger mt-2">{errors.amount[0]}</div>
                            )}
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="note">
                            <Form.Label>
                                <strong>Note</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setRepayment({...repayment, note: e.target.value})}
                                placeholder="Enter Note"/>
                            {errors && errors.amount && (
                                <div className="text-danger mt-2">{errors.note[0]}</div>
                            )}
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="bank_account">
                            <Form.Label>
                                <strong>Select Bank Account</strong>
                            </Form.Label>
                            <Form.Control
                                onChange={(e) => setRepayment({...repayment, account_id: e.target.value})}
                                as="select" defaultValue="">
                                <option value="">Choose a bank account...</option>
                                {bankAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                    </option>
                                ))}
                            </Form.Control>
                            {errors && errors.account_id && (
                                <div className="text-danger mt-2">{errors.account_id[0]}</div>
                            )}

                            {insufficientBalance && (
                                <div className="text-danger mt-2">{insufficientBalance}</div>
                            )}
                        </Form.Group>


                        <div className="form-group">
                            <label htmlFor="date" className="custom-form-label">Date :</label>
                            <DatePicker
                                className="custom-form-control"
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

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-sm" variant="secondary" onClick={handleRepayCloseModal}>
                        Close
                    </Button>
                    <Button className="btn-sm" variant="primary" onClick={handleRepaySaveChanges}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

