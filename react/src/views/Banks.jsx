import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import Swal from 'sweetalert2';
import WizCard from "../components/WizCard";
import {Button, Modal} from "react-bootstrap";
import {useStateContext} from "../contexts/ContextProvider";
import Pagination from "react-bootstrap/Pagination";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBank, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";

export default function Banks() {
    const [loading, setLoading] = useState(false);
    const [bankNames, setBankNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);
    const [bank, setBank] = useState({
        id: null,
        bank_name: ""
    });
    const {setNotification} = useStateContext();

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page
    } = applicationSettings;


    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const filteredBank = bankNames ? bankNames.filter(
        (bank) => bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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

    const bankSubmit = (e) => {
        e.preventDefault();
        if (bank.id) {
            axiosClient
                .put(`/bank-names/${bank.id}`, bank)
                .then(() => {
                    setNotification("Bank name has been updated");
                    setShowModal(false);
                    getBankNames(currentPage, pageSize);
                    setBank({
                        id: null,
                        bank_name: ""
                    });

                })
                .catch((error) => {
                    const response = error.response;
                    if (response && response.status === 409) {
                        setErrors({bank_name: ["Bank name already exists"]});
                    } else if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            axiosClient
                .post("/bank-names", bank)
                .then(({data}) => {
                    setNotification(`${bank.bank_name} has been created`);
                    setShowModal(false);
                    getBankNames(currentPage, pageSize);
                    setBank({
                        id: null,
                        bank_name: ""
                    });
                })
                .catch((error) => {
                    const response = error.response;
                    if (response && response.status === 409) {
                        setErrors({bank_name: ["Bank name already exists"]});
                    } else if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
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
                axiosClient.delete(`/bank-names/${bank.id}`).then(() => {
                    getBankNames(currentPage, pageSize);
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Bank has been deleted.',
                        icon: 'success',
                    });
                }).catch((error) => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Bank could not be deleted.',
                        icon: 'error',
                    });
                });
            }
        });
    };

    const actionParams = {
        route:{
            viewRoute:'',
            deleteRoute:''
        },
    }



    return (
        <div>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">List Of Banks</h1>
                <div>
                    <Link className="custom-btn btn-add" onClick={showCreateModal}><FontAwesomeIcon icon={faBank}/> Add
                        New</Link>
                </div>
            </div>

            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="mb-4">
                    <input className="custom-form-control"
                           type="text"
                           placeholder="Search bank..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered custom-table">
                        <thead>
                        <tr>
                            <th className="text-center">BANK NAME</th>
                            <th className="text-center">ADDED BY</th>
                            <th className="text-center">ADDED On</th>
                            {userRole ==='admin' && <th className={'text-center'}>ACTIONS</th>}
                            
                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={3} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {filteredBank.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        No bank found
                                    </td>
                                </tr>
                            ) : (
                                filteredBank.map((bank) => (
                                    <tr className={'text-center'} key={bank.id}>
                                        <td>{bank.bank_name}</td>
                                        {userRole ==='admin' && 
                                         <td>
                                            <ActionButtonHelpers
                                                module={bank}
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
