import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../../../axios-client.js";
import {Link} from "react-router-dom";
import Swal from 'sweetalert2';
import {Button, Modal, Form, InputGroup} from "react-bootstrap";
import {useStateContext} from "../../../contexts/ContextProvider.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBank, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import BankDetails from "./BankDetails.jsx";
import BankFormSidebar from "./BankFormSidebar.jsx";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import CommonTable from "../../../components/table/CommonTable.jsx";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";

export default function Banks() {
    const [loading, setLoading] = useState(false);
    const [bankNames, setBankNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);
    const [bank, setBank] = useState({
        id: null,
        bank_name: ""
    });

    const {applicationSettings, userRole, themeMode} = useContext(SettingsContext);
    const {
        num_data_per_page
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

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const normalizedBanks = React.useMemo(() => {
        return (bankNames || []).map((b) => ({
            ...b,
            created_on: b?.created_at ? new Date(b.created_at).toLocaleString() : '—',
        }));
    }, [bankNames]);

    const filteredBank = React.useMemo(() => {
        const q = (debouncedSearchTerm || "").trim().toLowerCase();
        if (!q) return normalizedBanks;
        return normalizedBanks.filter((b) => {
            return (
                String(b.bank_name || "").toLowerCase().includes(q) ||
                String(b.user_name || "").toLowerCase().includes(q) ||
                String(b.created_on || "").toLowerCase().includes(q) ||
                String(b.id || "").toLowerCase().includes(q)
            );
        });
    }, [normalizedBanks, debouncedSearchTerm]);

    const showCreateModal = () => {
        setBank({
            id: null,
            bank_name: ""
        });
        setErrors(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getBankNames = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/bank-names", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setBankNames(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };


    useEffect(() => {
        document.title = "Manage Banks";
        getBankNames(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Sidebar actions for viewing details and form
    const { showQuickDetails, showLargeContent } = useSidebarActions();
    const showBankDetails = (bank) => {
        showQuickDetails(
            "Bank Details",
            <BankDetails bankId={bank?.id} data={bank} />
        );
    };

    // Open create/edit in GlobalSidebar
    const openCreateSidebar = () => {
        const formId = "bank-form-global";
        showLargeContent(
            "Add New Bank",
            <BankFormSidebar
                bankId={null}
                formId={formId}
                hideInternalFooter={true}
                onSuccess={() => getBankNames(currentPage, pageSize)}
            />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "submit", formId, 'data-action': 'save' },
                            { label: "Save and Exit", type: "submit", formId, 'data-action': 'save_exit' },
                        ]}
                    />
                )
            }
        );
    };

    const openEditSidebar = (element) => {
        const formId = "bank-form-global";
        showLargeContent(
            "Update Bank",
            <BankFormSidebar
                bankId={element?.id}
                formId={formId}
                hideInternalFooter={true}
                onSuccess={() => getBankNames(currentPage, pageSize)} />,
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

    const bankSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
        if (bank.id) {
            axiosClient
                .put(`/bank-names/${bank.id}`, bank)
                .then((data) => {
                    // setNotification("Bank name has been updated");
                    setShowModal(false);
                    getBankNames(currentPage, pageSize);
                    setBank({
                        id: null,
                        bank_name: ""
                    });
                    notification('success',data?.message,data?.description)
                    setLoading(false)
                })
                .catch((err) => {
                    // const response = error.response;
                    // if (response && response.status === 409) {
                    //     setErrors({bank_name: ["Bank name already exists"]});
                    // } else if (response && response.status === 422) {
                    //     setErrors(response.data.errors);
                    // }

                    if (err.response) { 
                        const error = err.response.data
                        notification('error',error?.message,error.description)
                    }
                    setLoading(false)
                });
        } else {
            axiosClient
                .post("/bank-names", bank)
                .then(({data}) => {
                    // setNotification(`${bank.bank_name} has been created`);
                    setShowModal(false);
                    getBankNames(currentPage, pageSize);
                    setBank({
                        id: null,
                        bank_name: ""
                    });
                    notification('success',data?.message,data?.description)
                    setLoading(false)
                })
                .catch((err) => {
                    // const response = error.response;
                    // if (response && response.status === 409) {
                    //     setErrors({bank_name: ["Bank name already exists"]});
                    // } else if (response && response.status === 422) {
                    //     setErrors(response.data.errors);
                    // }

                    if (err.response) { 
                        const error = err.response.data
                        notification('error',error?.message,error.description)
                    }
                    setLoading(false)
                });
        }
    };

    const edit = (bank) => {
        setBank(bank);
        setErrors(null);
        setShowModal(true);
    }

    const onDelete = (bank) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You will not be able to recover the bank ${bank.bank_name}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.delete(`/bank-names/${bank.id}`).then((data) => {
                    getBankNames(currentPage, pageSize);
                    notification('success',data?.message,data?.description)
                }).catch((err) => {
                    if (err.response) { 
                        const error = err.response.data
                        notification('error',error?.message,error.description)
                    }
                });
            }
        });
    };

    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: openEditSidebar,
            permission: 'bank_edit',
            textClass:'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: showBankDetails,
            permission: 'bank_view',
            textClass:'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'bank_delete',
            textClass:'text-danger'
        },
    ];


    return (
        <div>
          <MainLoader loaderVisible={loading} />
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">List Of Banks</h1>
                <div>
                    <Link className="custom-btn btn-add" onClick={openCreateSidebar}><FontAwesomeIcon icon={faBank}/> Add
                        New</Link>
                </div>
            </div>

            <div className="animated fadeInDown">
                <div className="mb-3">
                    <InputGroup className="mb-3" size="sm" style={{ maxWidth: "520px", flex: "1 1 320px" }}>
                        <InputGroup.Text id="banks_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                        <Form.Control
                            aria-describedby="banks_search"
                            type="text"
                            size="sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Banks..."
                            style={{ ...inputStyle, textTransform: "capitalize" }}
                        />
                    </InputGroup>
                </div>
                <CommonTable
                    data={filteredBank}
                    tableColumns={[
                        ...(userRole === 'admin' ? [{ id: 'id', label: 'ID', align: 'left' }] : []),
                        { id: 'bank_name', label: 'Bank Name', align: 'left' },
                        { id: 'user_name', label: 'Added By', align: 'left' },
                        { id: 'created_on', label: 'Added On', align: 'left' },
                    ]}
                    actionButtons={actionParams}
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
                    cardSubTitle={`Page-${currentPage} • ${filteredBank.length} of ${totalCount}`}
                    isFetching={loading}
                    hasError={false}
                />
            </div>

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {bank.id ? (
                            <span>Update Bank Name: {bank.bank_name}</span>
                        ) : (
                            <span className="title-text">Add New Bank</span>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="bank_name" className="custom-form-label">
                            Bank Name
                        </label>
                        <input
                            value={bank.bank_name}
                            onChange={(e) =>
                                setBank({...bank, bank_name: e.target.value})
                            }
                            className="custom-form-control"
                            placeholder="Bank Name"
                        />
                        {errors && errors.bank_name && (
                            <div className="text-danger mt-2">{errors.bank_name[0]}</div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>

                    <Button className="btn-sm" variant="primary" onClick={bankSubmit}>
                        Save
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}
