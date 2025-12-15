import {Link} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../../../axios-client.js";
import WizCard from "../../../components/WizCard.jsx";
import {useStateContext} from "../../../contexts/ContextProvider.jsx";
import {Button, Modal, Form, InputGroup} from "react-bootstrap";
import DatePicker from "react-datepicker";
import Pagination from "react-bootstrap/Pagination";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoneyBillTransfer, faEye, faPenToSquare} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import BalanceTransferFormSidebar from "./BalanceTransferFormSidebar.jsx";
import BalanceTransferDetails from "./BalanceTransferDetails.jsx";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import CommonTable from "../../../components/table/CommonTable.jsx";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";

export default function BalanceTransfers() {

    const [transfer, setTransfer] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        transfer_date: null,
        note: '',
    });

    const {applicationSettings,userRole, themeMode} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;
    const theme = useTheme();
    const inputGroupTextStyle = createInputGroupTextStyle(theme);
    const isDark = themeMode === "dark";
    const inputStyle = {
        backgroundColor: isDark ? "#1c1f24" : "#fff",
        color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
        borderColor: isDark ? "#3a4048" : "#c5ccd6",
        fontSize: "0.875rem",
        minHeight: 36,
    };


    const [errors, setErrors] = useState({});
    const [selectedFromAccountId, setSelectedFromAccountId] = useState('');
    const [selectedToAccountId, setSelectedToAccountId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [transferDate, setTransferDate] = useState(null);

    const [loading, setLoading] = useState(true); // Initialize loading state as true
    const [transferHistories, setTransferHistories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

    const { showQuickDetails, showLargeContent } = useSidebarActions();


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
        setLoading(true)
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                setBankAccounts(data.data);
                setLoading(false)
            })
            .catch(error => {
                console.warn('Error fetching bank accounts:', error)
                setLoading(false)
            });
    }



    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const normalizedTransfers = React.useMemo(() => {
        return (transferHistories || []).map((t) => ({
            ...t,
            amount_display: `${default_currency}${t.amount}`,
        }));
    }, [transferHistories, default_currency]);

    const filteredTransferHistories = React.useMemo(() => {
        const q = (debouncedSearchTerm || "").trim().toLowerCase();
        if (!q) return normalizedTransfers;
        return normalizedTransfers.filter((t) => {
            return (
                String(t.amount_display || "").toLowerCase().includes(q) ||
                String(t.from_account || "").toLowerCase().includes(q) ||
                String(t.to_account || "").toLowerCase().includes(q) ||
                String(t.transfer_date || "").toLowerCase().includes(q) ||
                String(t.note || "").toLowerCase().includes(q) ||
                String(t.id || "").toLowerCase().includes(q)
            );
        });
    }, [normalizedTransfers, debouncedSearchTerm]);

    const getTransferHistories = (page, pageSize) => {
        setLoading(true)
        axiosClient
            .get("/transfer/histories", {params: {page, pageSize}})
            .then(({data}) => {
                setTransferHistories(data.data);
                setTotalCount(data.total);
                setLoading(false)
            })
            .catch((error) => {
                console.warn("Unable to fetch transfer histories", error);
                setLoading(false)
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

    const refreshList = () => getTransferHistories(currentPage, pageSize);

    const showTransferDetails = (id) => {
        showQuickDetails(
            "Transfer Details",
            <BalanceTransferDetails transferId={id} />
        );
    };

    const openCreateSidebar = () => {
        const formId = "balance-transfer-form-global";
        showLargeContent(
            "Make a Transfer",
            <BalanceTransferFormSidebar mode="create" formId={formId} hideInternalFooter={true} onSuccess={refreshList} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Transfer", type: "submit", formId, 'data-action': 'save' },
                            { label: "Transfer and Exit", type: "submit", formId, 'data-action': 'save_exit' },
                        ]}
                    />
                )
            }
        );
    };

    const openEditSidebar = (id) => {
        const formId = "balance-transfer-form-global";
        showLargeContent(
            "Update Transfer",
            <BalanceTransferFormSidebar mode="edit" transferId={id} formId={formId} hideInternalFooter={true} onSuccess={refreshList} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Update", type: "submit", formId, 'data-action': 'save_exit' },
                        ]}
                    />
                )
            }
        );
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

     // set default date(today)
     useEffect(()=>{
        if(transferDate ===null){
            setTransferDate(new Date())
            }
       },[transferDate])

    const transferSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
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
                setLoading(false)
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else {
                    setInsufficientBalance(response.data.message);
                }
                setLoading(false)
            });
    };

    return (
        <>
        <MainLoader loaderVisible={loading} />
                <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                    <h1 className="title-text mb-0">Transfer Histories</h1>
                    <div>
                    <Link className="custom-btn btn-add" onClick={openCreateSidebar}>
                       <FontAwesomeIcon icon={faMoneyBillTransfer}/> Make a transfer
                    </Link>
                    </div>
                </div>

            <WizCard className="animated fadeInDown">
                <div className="mb-3">
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "520px", flex: "1 1 320px" }}>
                        <InputGroup.Text id="bt_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                        <Form.Control
                            aria-describedby="bt_search"
                            type="text"
                            size="sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Transfers..."
                            style={{ ...inputStyle, textTransform: "capitalize" }}
                        />
                    </InputGroup>
                </div>
                <CommonTable
                    data={filteredTransferHistories}
                    tableColumns={[
                        ...(userRole === 'admin' ? [{ id: 'id', label: 'ID', align: 'left' }] : []),
                        { id: 'from_account', label: 'From Account', align: 'left' },
                        { id: 'to_account', label: 'To Account', align: 'left' },
                        { id: 'amount_display', label: 'Amount', align: 'left' },
                        { id: 'transfer_date', label: 'Transfer Date', align: 'left' },
                        { id: 'note', label: 'Note', align: 'left' },
                    ]}
                    actionButtons={[
                        {
                            actionName: 'View',
                            type: "modal",
                            route: "",
                            actionFunction: (element) => showTransferDetails(element?.id),
                            permission: 'transfer_view',
                            textClass:'text-warning'
                        },
                        // {
                        //     actionName: 'Edit',
                        //     type: "modal",
                        //     route: "",
                        //     actionFunction: (element) => openEditSidebar(element?.id),
                        //     permission: 'transfer_edit',
                        //     textClass:'text-info',
                        // },
                    ]}
                    pagination={{
                        totalPages: totalPages || 0,
                        totalCount: totalCount,
                        total: totalCount,
                        currentPage: currentPage,
                        handlePageChange: (e, value) => setCurrentPage(value),
                        pageSize: pageSize,
                        onRowsPerPageChange: (event) => {
                            const newSize = parseInt(event.target.value, 10);
                            if (newSize > 0) {
                                setCurrentPage(1);
                            }
                        },
                    }}
                    cardSubTitle={`Page-${currentPage} • ${filteredTransferHistories.length} of ${totalCount}`}
                    isFetching={loading}
                    hasError={false}
                />

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
