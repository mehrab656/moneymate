import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../axios-client.js";
import Swal from "sweetalert2";
import {Link} from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../components/WizCard";
import {Button, Form, Modal} from "react-bootstrap";
import {useStateContext} from "../contexts/ContextProvider";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCoins, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import MainLoader from "../components/MainLoader.jsx";

export default function Return() {
    const [loading, setLoading] = useState(false);
    const [marketReturns, setMarketReturns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);

    const [marketReturn, setMarketReturn] = useState({});

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    let totals = {
        totalRefundableAmount: 0,
        totalRefundedAmount: 0,
        totalRemaining: 0,
        totalRefundedPercent: 0,
        totalRemainingPercent: 0
    };
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);

    const filterMarketReturns = marketReturns.filter(
        (marketReturn) =>
            marketReturn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            marketReturn.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseModal = () => {
        setShowModal(false);
    };
    const {setNotification} = useStateContext();

    const submitForUpdate = (event) => {
        event.preventDefault();
        setLoading(true)
        axiosClient.post(`/return/${marketReturn.id}`, marketReturn)
            .then(({data}) => {
                console.log(data);
                setShowModal(false);
                getMarketReturns(currentPage, pageSize);
                setMarketReturn(data);
                Toast.fire({
                    icon: 'success',
                    title: data.message,
                    text: data.description,
                });
                setLoading(false)

            }).catch(error => {
            if (error.response) {
                Toast.fire({
                    icon: "error",
                    title: error.response.data.message,
                    text: error.response.data.description,
                });
            }
            setLoading(false)
        });
    };

    const edit = (marketReturn) => {
        setMarketReturn(marketReturn);
        setErrors(null);
        setShowModal(true);
    };



    const getMarketReturns = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/returns", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setMarketReturns(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Market Returns";
        getMarketReturns(currentPage, pageSize);
    }, [currentPage, pageSize]); // Fetch marketReturns when currentPage or pageSize changes

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => handlePageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    const actionParams = {
        route: {
            viewRoute: '',
            deleteRoute: ''
        },
    }

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <div className="col-9">
                <WizCard className="animated fadeInDown">
                    <div className="row">
                        <div className="col-4">
                            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                                <h1 className="title-text mb-0">Market Returns</h1>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="mb-4">
                                <input
                                    className="custom-form-control"
                                    type="text"
                                    placeholder="Search Returns..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive-sm my-custom-scrollbar table-wrapper-scroll-y">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr>
                                <th className="text-center">Date</th>
                                <th className="text-center">Description</th>
                                <th className="text-center">Refundable Amount</th>
                                <th className="text-center">Refunded Amount</th>
                                <th className="text-center">Remaining</th>
                                {
                                    userRole === 'admin' &&
                                    <th className="text-center">Action</th>
                                }
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
                                {filterMarketReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center">
                                            No Refundable expense found
                                        </td>
                                    </tr>
                                ) : (
                                    filterMarketReturns.map((marketReturn) => {
                                        totals.totalRefundableAmount += Number(parseFloat(marketReturn.refundable_amount));
                                        totals.totalRefundedAmount += Number(parseFloat(marketReturn.refunded_amount));
                                        totals.totalRefundedPercent = Math.ceil((totals.totalRefundedAmount * 100) / totals.totalRefundableAmount);
                                        totals.totalRemainingPercent = 100 - totals.totalRefundedPercent;

                                        return (
                                            <tr key={marketReturn.id}>
                                                <td>{marketReturn.date}</td>
                                                <td>{marketReturn.description}</td>
                                                <td className="text-right">{default_currency + ' ' + + marketReturn.refundable_amount}</td>
                                                <td className="text-right">{default_currency + ' ' + + marketReturn.refunded_amount}</td>
                                                <td className="text-right">{default_currency + ' ' + + (marketReturn.refundable_amount - marketReturn.refunded_amount).toString()}</td>
                                                {userRole === 'admin' &&
                                                    <td>
                                                        <ActionButtonHelpers
                                                            module={marketReturn}
                                                            // deleteFunc={onDelete}
                                                            showEditDropdown={edit}
                                                            editDropdown={true}
                                                            params={actionParams}
                                                        />
                                                    </td>}
                                            </tr>

                                        )
                                    })
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

            <div className="col-xl-3 col-md-3">
                <div className="card quater-card summery-card">
                    <div className="card-block">
                        <h6 className="text-muted m-b-20">Summary</h6>

                        <h4>{default_currency + ' ' + totals.totalRefundableAmount}</h4>
                        <p className="text-muted">Total refundable amount</p>
                        <h5 className="m-t-30">{default_currency + ' ' + totals.totalRefundedAmount}</h5>
                        <p className="text-muted">Total Refunded <span
                            className="f-right">{totals.totalRefundedPercent + '%'}</span></p>
                        <div className="progress">
                            <div className="progress-bar bg-success"
                                 style={{width: totals.totalRefundedPercent + '%'}}/>
                        </div>
                        <h5 className="m-t-30">{default_currency + ' ' + (totals.totalRefundableAmount - totals.totalRefundedAmount)}</h5>
                        <p className="text-muted">Total Remaining <span
                            className="f-right">{totals.totalRemainingPercent + '%'}</span></p>
                        <div className="progress">
                            <div className="progress-bar bg-danger"
                                 style={{width: totals.totalRemainingPercent + '%'}}/>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} centered onHide={handleCloseModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Update Return: {marketReturn.reference}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="custom-form">
                        <div className="form-group">
                            <label htmlFor="expense_amount" className="custom-form-label">Expense Amount</label>
                            <input
                                value={marketReturn.amount}
                                className="custom-form-control"
                                readOnly={true}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="refundable_amount" className="custom-form-label">Refundable Amount</label>
                            <input
                                value={marketReturn.refundable_amount}
                                className="custom-form-control"
                                readOnly={true}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="refunded_amount" className="custom-form-label">Refunded Amount</label>
                            <input
                                value={marketReturn.refunded_amount}
                                className="custom-form-control"
                                readOnly={true}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="return_amount" className="custom-form-label">Return Amount</label>
                            <input
                                className="custom-form-control"
                                type="number"
                                onBlur={e => setMarketReturn({
                                    ...marketReturn,
                                    return_amount: parseFloat(e.target.value).toFixed(2)
                                })}
                                placeholder="Return Amount"
                            />
                            {errors && errors.type && (
                                <div className="text-danger mt-2">{errors.type[0]}</div>
                            )}
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-sm" variant="primary" onClick={submitForUpdate}>
                        Update
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}



