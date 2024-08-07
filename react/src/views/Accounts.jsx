import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {Button, Modal} from "react-bootstrap";
import {useStateContext} from "../contexts/ContextProvider";
import Swal from "sweetalert2";
import Pagination from "react-bootstrap/Pagination";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBank, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import SummeryCard from "../components/SummeryCard.jsx";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import AddCardTwoToneIcon from '@mui/icons-material/AddCardTwoTone';
import RemoveTwoToneIcon from '@mui/icons-material/RemoveTwoTone';
import MainLoader from "../components/MainLoader.jsx";
import { notification } from "../components/ToastNotification.jsx";

export default function Accounts() {

    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [bankAccountBalance,setBankAccountBalance]=useState(0);
    const [handCashBalance,setHandCashBalance]=useState(0);
    const [totalBalance,setTotalBalance]=useState(0);

    const [banks, setBanks] = useState([]);


    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const [bankAccount, setBankAccount] = useState({
        id: null,
        bank_name_id: null,
        account_name: '',
        account_number: '',
        balance: null
    });

    const [errors, setErrors] = useState({
        account_name: '',
        bank_name_id: '',
        account_number: '',
        balance: ''
    });

    const [selectedBankNameId, setSelectedBankNameId] = useState(null);

    const showCreateModal = () => {
        setBankAccount({
            id: null,
            bank_name_id: null,
            account_name: '',
            account_number: '',
            balance: null
        });
        setErrors({
            account_name: '',
            bank_name_id: '',
            account_number: '',
            balance: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    const getAccountBalances=()=>{
        //get total account  balance
        axiosClient.get('/total-bankAccount-balance').then(({data}) => {
            setBankAccountBalance(data.balance)
        });

        //get total wallet balance balance
        axiosClient.get('/total-wallet-balance').then(({data}) => {
            setHandCashBalance(data.balance)
        });
        //get total account balance
        axiosClient.get('/total-balance').then(({data}) => {
            setTotalBalance(data.balance)
        });
    }

    useEffect(() => {
        document.title = "Manage Bank Account";
        axiosClient.get('/all-bank')
            .then(({data}) => {
                setBanks(data.data);
            }).catch((error) => {
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        });

        getAccounts(currentPage, pageSize);
        getAccountBalances();
    }, [currentPage, pageSize]);

    const getAccounts = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/bank-accounts", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setAccounts(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
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

    const edit = (bankAccount) => {
        setBankAccount(bankAccount);
        setSelectedBankNameId(bankAccount.bank_name_id);
        setErrors({
            account_name: '',
            bank_name_id: '',
            account_number: '',
            balance: ''
        });
        setShowModal(true);
    }

    const bankAccountSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
        if (bankAccount.id) {
            axiosClient.put(`/bank-account/${bankAccount.id}`, bankAccount)
                .then((data) => {
                    // setNotification("Bank account information has been updated");
                    setShowModal(false);
                    getAccounts(currentPage, pageSize);
                    getAccountBalances();
                    setBankAccount({
                        id: null,
                        bank_name_id: null,
                        account_name: '',
                        account_number: '',
                        balance: null
                    });
                    setErrors({
                        account_name: '',
                        bank_name_id: '',
                        account_number: '',
                        balance: ''
                    });

                    notification("success",data.message,data.description)
                    setLoading(false)
                }).catch(err => {
                    const error = err.response.data
                    notification('error',error?.message,error.description)
                    setLoading(false)
            });
        } else {
            axiosClient.post('/bank-account/add', bankAccount)
                .then((data) => {
                    // setNotification('Bank account has been added');
                    setShowModal(false);
                    getAccounts(currentPage, pageSize);
                    getAccountBalances();
                    setBankAccount({
                        id: null,
                        bank_name_id: null,
                        account_name: '',
                        account_number: '',
                        balance: null
                    });
                    setErrors({
                        account_name: '',
                        bank_name_id: '',
                        account_number: '',
                        balance: ''
                    });
                    notification("success",data.message,data.description)

                    setLoading(false)
                }).catch(err => {
                    const error = err.response.data
                    notification('error',error?.message,error.description)
                    setLoading(false)
                });

        }
    }

    const onDelete = (account) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Removing bank account number ${account.account_number} will also erase all the associated data from the system`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`/bank-account/${account.id}`).then(({data}) => {
                    getAccounts(currentPage, pageSize);
                    notification('success',data?.message,data?.description)
                }).catch(err => {
                    const error = err.response.data
                    notification('error',error?.message,error.description)
                    setLoading(false)
            });
            }
        });
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const filteredAccounts = accounts.filter(
        (account) =>
            account.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
            account.account_name.toLowerCase().includes(searchText.toLowerCase()) ||
            account.bank_name.toLowerCase().includes(searchText.toLowerCase()) ||
            account.account_number.includes(searchText) ||
            account.balance.toString().includes(searchText)
    );

    const actionParams = {
        route:{
            viewRoute:'',
            deleteRoute:''
        },
    }



    return (
        <div>
            <MainLoader loaderVisible={loading} />
            <div className="mb-4">
                <div className="row g-4">
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={bankAccountBalance} summary="Account Balance" icon={<AttachMoneyIcon/>}
                                     iconClassName="icon-success" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={handCashBalance} summary="Wallet Balance" icon={<ArrowOutwardIcon/>}
                                     iconClassName="icon-danger" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={totalBalance} summary="Total Balance"
                                     icon={<AddCardTwoToneIcon/>} iconClassName="icon-success" currency={default_currency}/>
                    </div>
                </div>
            </div>

            <WizCard className="animated fadeInDown">

                <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                    <h1 className="title-text mb-0">Bank Account</h1>
                    <div>
                        <Link className="custom-btn btn-add" onClick={showCreateModal}><FontAwesomeIcon icon={faBank}/> Add
                            New Bank Account</Link>
                    </div>
                </div>

                <div className="alert alert-warning" role="alert">
                    You need to create a bank before add a bank account, if you haven't added a bank yet, <Link
                    to="/banks">Click
                    Here</Link> to create a bank first.
                </div>

                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search Account..."
                           value={searchText}
                           onChange={handleSearch}
                    />

                </div>
                <div className="table-responsive-sm">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
                            {
                                userRole === 'admin'&&
                                <th>id</th>
                            }
                            <th>USER NAME</th>
                            <th className="text-center">ACCOUNT HOLDER NAME</th>
                            <th className="text-center">BANK NAME</th>
                            <th className="text-center">ACCOUNT NUMBER</th>
                            <th className="text-center">AVAILABLE BALANCE</th>
                            {userRole ==='admin' && <th className="text-center" width="20%">ACTIONS</th>}
                            
                        </tr>
                        </thead>

                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={6} className="text-center">
                                    Loading....
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center">
                                        No bank account found
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id}>
                                        {
                                            userRole === 'admin'&&
                                            <td>{account.id}</td>
                                        }
                                        <td>{account.customer_name}</td>
                                        <td className="text-center">{account.account_name}</td>
                                        <td className="text-center">{account.bank_name}</td>
                                        <td className="text-center">{account.account_number}</td>
                                        <td className="text-center">{default_currency+' '}{account.balance}</td>
                                        {/* {userRole ==='admin' && 
                                        <td className="text-center">
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                            <span>
                                            <Link className="btn-edit" to={`#`} onClick={() => edit(account)}>
                                            <FontAwesomeIcon icon={faEdit}/> Edit
                                            </Link>
                                                </span>
                                                    <span>
                                                    <a className="btn-delete"
                                                    onClick={(e) => onDelete(account)}><FontAwesomeIcon icon={faTrash}/> Delete</a>
                                                </span>
                                                </div>
                                            </td>
                                        } */}
                                        {userRole ==='admin' && 
                                         <td>
                                            <ActionButtonHelpers
                                                module={account}
                                                deleteFunc={onDelete}
                                                showEditDropdown={edit}
                                                editDropdown={true}
                                                params={actionParams}
                                            />
                                        </td>}
                                       
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


            {/*<WizCard className="animated fadeInDown mt-4">*/}

            {/*    <div className="d-flex justify-content-between align-content-center gap-2 mb-3">*/}
            {/*        <h1 className="title-text mb-0">Wallet/Handcash</h1>*/}
            {/*        <div>*/}
            {/*            <Link className="custom-btn btn-add" onClick={showCreateModal}><FontAwesomeIcon icon={faBank}/> Add*/}
            {/*                New Wallet</Link>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*   */}
            {/*    <div className="mb-4">*/}
            {/*        <input className="custom-form-control"*/}
            {/*               type="text"*/}
            {/*               placeholder="Search Account..."*/}
            {/*               value={searchText}*/}
            {/*               onChange={handleSearch}*/}
            {/*        />*/}

            {/*    </div>*/}
            {/*    <div className="table-responsive-sm">*/}
            {/*        <table className="table table-bordered custom-table">*/}
            {/*            <thead>*/}
            {/*            <tr>*/}
            {/*                <th>WALLET NAME</th>*/}
            {/*                <th className="text-center">ACCOUNT HOLDER NAME</th>*/}
            {/*                <th className="text-center">BANK NAME</th>*/}
            {/*                <th className="text-center">ACCOUNT NUMBER</th>*/}
            {/*                <th className="text-center">AVAILABLE BALANCE</th>*/}
            {/*                {userRole ==='admin' && <th className="text-center" width="20%">ACTIONS</th>}*/}
            {/*                */}
            {/*            </tr>*/}
            {/*            </thead>*/}

            {/*            {loading && (*/}
            {/*                <tbody>*/}
            {/*                <tr>*/}
            {/*                    <td colSpan={6} className="text-center">*/}
            {/*                        Loading....*/}
            {/*                    </td>*/}
            {/*                </tr>*/}
            {/*                </tbody>*/}
            {/*            )}*/}
            {/*            {!loading && (*/}
            {/*                <tbody>*/}
            {/*                {filteredAccounts.length === 0 ? (*/}
            {/*                    <tr>*/}
            {/*                        <td colSpan={6} className="text-center">*/}
            {/*                            No bank account found*/}
            {/*                        </td>*/}
            {/*                    </tr>*/}
            {/*                ) : (*/}
            {/*                    filteredAccounts.map((account) => (*/}
            {/*                        <tr key={account.id}>*/}
            {/*                            <td>{account.customer_name}</td>*/}
            {/*                            <td className="text-center">{account.account_name}</td>*/}
            {/*                            <td className="text-center">{account.bank_name}</td>*/}
            {/*                            <td className="text-center">{account.account_number}</td>*/}
            {/*                            <td className="text-center">{default_currency}{account.balance}</td>*/}
            {/*                            {userRole ==='admin' && */}
            {/*                             <td>*/}
            {/*                                <ActionButtonHelpers*/}
            {/*                                    module={account}*/}
            {/*                                    deleteFunc={onDelete}*/}
            {/*                                    showEditDropdown={edit}*/}
            {/*                                    editDropdown={true}*/}
            {/*                                    params={actionParams}*/}
            {/*                                />*/}
            {/*                            </td>}*/}
            {/*                           */}
            {/*                        </tr>*/}
            {/*                    ))*/}
            {/*                )}*/}
            {/*                </tbody>*/}
            {/*            )}*/}
            {/*        </table>*/}
            {/*    </div>*/}
            {/*    {totalPages > 1 && (*/}
            {/*        <Pagination>*/}
            {/*            <Pagination.Prev*/}
            {/*                disabled={currentPage === 1}*/}
            {/*                onClick={() => handlePageChange(currentPage - 1)}*/}
            {/*            />*/}
            {/*            {paginationItems}*/}
            {/*            <Pagination.Next*/}
            {/*                disabled={currentPage === totalPages}*/}
            {/*                onClick={() => handlePageChange(currentPage + 1)}*/}
            {/*            />*/}
            {/*        </Pagination>*/}
            {/*    )}*/}
            {/*</WizCard>*/}

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {bankAccount.id && <span className="title-text">Update bank account information</span>}
                        {!bankAccount.id && <span className="title-text">Add new bank account</span>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="form-group">
                        <label htmlFor="account_name" className="custom-form-label">
                            Account holders Name
                        </label>
                        <input
                            className="custom-form-control"
                            value={bankAccount.account_name || ''}
                            type="text"
                            onChange={(e) =>
                                setBankAccount({...bankAccount, account_name: e.target.value})
                            }
                            placeholder="Account holders Name"
                        />
                        {errors.account_name && (
                            <div className="error-message mt-2">{errors.account_name}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="bank_name" className="custom-form-label">
                            Bank Name
                        </label>
                        <select
                            className="custom-form-control"
                            id="bank-name"
                            name="bank-name"
                            value={selectedBankNameId || ''}
                            onChange={(event) => {
                                const value = event.target.value || '';
                                setSelectedBankNameId(value);
                                setBankAccount({
                                    ...bankAccount,
                                    bank_name_id: parseInt(value),
                                });
                            }}
                        >
                            <option defaultValue>Select a bank account</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.id}>
                                    {bank.bank_name}
                                </option>
                            ))}
                        </select>
                        {errors.bank_name_id && (
                            <div className="error-message mt-2">{errors.bank_name_id}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="account_number" className="custom-form-label">
                            Account Number
                        </label>
                        <input
                            className="custom-form-control"
                            value={bankAccount.account_number || ''}
                            type="text"
                            onChange={(e) =>
                                setBankAccount({...bankAccount, account_number: e.target.value})
                            }
                            placeholder="Account Number"
                        />
                        {errors.account_number && (
                            <div className="error-message mt-2">{errors.account_number}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="initial_balance" className="custom-form-label">
                            Initial Balance
                        </label>
                        <input
                            className="custom-form-control"
                            value={bankAccount.balance || ''}
                            type="text"
                            onChange={(e) =>
                                setBankAccount({...bankAccount, balance: e.target.value})
                            }
                            placeholder="Balance"
                        />
                        {errors.balance && <div className="error-message mt-2">{errors.balance}</div>}
                    </div>


                </Modal.Body>
                <Modal.Footer>

                    <Button className="btn-sm" variant="primary" onClick={bankAccountSubmit}>
                        Save
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}
