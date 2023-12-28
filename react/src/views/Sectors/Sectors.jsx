import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import {Link, useNavigate} from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../../components/WizCard.jsx";
import { Modal, Table} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash, faPlus} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import {Tooltip} from "react-tooltip";
import MainLoader from "../../components/MainLoader.jsx";
import {compareDates} from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";

export default function Sectors() {
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {num_data_per_page, default_currency} = applicationSettings;
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0);
    const [modalSector, setModalSector] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showHelperModel, setShowHelperModel] = useState(false);
    const [showHelperModelType, setShowHelperModelType] = useState('');
    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const [activeElectricityModal, setActiveElectricityModal] = useState('');
    const [incomeExpense, setIncomeExpense] = useState({
        income: 0,
        expense: 0
    });
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
    const [sector, setSector] = useState({
        contract_end_date: '',
        contract_start_date: '',
        el_acc_no: '',
        el_billing_date: '',
        el_business_acc_no: '',
        el_note: '',
        el_premises_no: '',
        id: null,
        int_note: '',
        internet_acc_no: '',
        internet_billing_date: '',
        name: '',
        payments: [],
    });

    const showSector = (sector) => {
        axiosClient(`/sectorsIncomeExpense/${sector.id}`).then(({data}) => {
            setIncomeExpense(data)
        }).catch(e => {
            console.warn(e)
        })
        setModalSector(sector);
        setShowModal(true);
    };
    const getSectors = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/sectors", {params: {page, pageSize}})
            .then(({data}) => {
                setLoading(false);
                setSectors(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Manage Sectors";
        getSectors(currentPage, pageSize);
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
                onClick={() => handlePageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    const onDelete = (sector) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the sector !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`sector/${sector.id}`)
                    .then(() => {
                        getSectors();
                        Swal.fire({
                            title: "Deleted!",
                            text: "sector has been deleted.",
                            icon: "success",
                        });
                    })
                    .catch((error) => {
                        Swal.fire({
                            title: "Error!",
                            text: error,
                            icon: "error",
                        }).then(r => {
                            console.warn(r);
                        });
                    });
            }
        });
    };


    function dateOrdinal(date) {
        return (
            date +
            (31 === date || 21 === date || 1 === date
                ? "st"
                : 22 === date || 2 === date
                    ? "nd"
                    : 23 === date || 3 === date
                        ? "rd"
                        : "th")
        );
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];


    // handle pay
    const handlePay = async (payment) => {
        await Swal.fire({
            title: `${default_currency + ' ' + payment.amount} has already paid?`,
            text: "Are You sure the payment has paid!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes ! Sure',
            cancelButtonText: 'Not Now !'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient.post(`/change-payment-status/${payment.id}`).then(({data}) => {
                    Swal.fire({
                        title: data.status === 400 ? 'Failed' : 'Paid',
                        text: data.message,
                        icon: data.status === 200 ? 'success' : 'error',
                    });
                    // window.location.reload();
                }).catch(e)
                {
                    console.warn(e)
                }
            }
        })
    }

    const actionParams = {
        route: {
            editRoute: "/sector/update/",
            viewRoute: "",
            deleteRoute: "",
        },
    };
    const handleCloseModal = () => {
        setActiveElectricityModal('');
        setShowModal(false);
        setShowHelperModel(false);

    };
    const checkPayments = (payments, type) => {
        let message = '';
        for (let i = 0; i < payments.length; i++) {
            const payment = payments[i];
            if (payment.type === type && payment.status === 'unpaid') {
                message = payment.date;
                break;
            }
        }

        return (
            <span
                className={message === '' ? 'text-success' : 'text-danger'}>{message === '' ? 'All Clear' : message}</span>
        )
    }

    const showHelperModels = (sector, index, type = 'electricity') => {
        setSector(sector);
        setShowHelperModelType(type)
        setShowHelperModel(true);

        // if (type === 'internet') {
        //     setActiveInternetModal(index);
        //     setShowInternetModal(true);
        // }
        // if (type === 'electricity') {
        //     setActiveElectricityModal(index);
        //
        // }
        // if (type === 'cheque') {
        //     setActiveChequeModal(index);
        //     setShowChequeModal(true);
        // }
    }

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <WizCard className='animated fadeInDown'>
                <div className='mb-4'>
                    <div className="col-md-10">
                        <input
                            className='custom-form-control mb-4'
                            type='text'
                            placeholder='Search Sector...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {userRole === "admin" && (
                        <div className="col-md-2">
                            <Link className='btn-add align-right mr-3' to='/sector/new'>
                                <FontAwesomeIcon icon={faPlus}/> Add New
                            </Link>
                        </div>
                    )}

                </div>
                <div className='table-responsive-sm'>
                    <table className='table table-bordered custom-table'>
                        <thead>
                        <tr className={"text-center"}>
                            <th>Sector</th>
                            <th>Electricity next payment</th>
                            <th>Internet next payment</th>
                            <th>Cheque next payment</th>
                            <th width='20%'>Action</th>
                        </tr>
                        </thead>
                        {loading && (
                            <tbody>
                            <tr>
                                <td colSpan={8} className='text-center'>
                                    Loading...
                                </td>
                            </tr>
                            </tbody>
                        )}
                        {!loading && (
                            <tbody>
                            {sectors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className='text-center'>
                                        No Sectors found
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {sectors &&
                                        sectors.length > 0 &&
                                        sectors.map((sector, index) => {
                                            let breakStatement = false;
                                            let nextPayment;
                                            sector?.payments.map((payment) => {
                                                if (breakStatement) {
                                                    return;
                                                }
                                                if (payment.status === "unpaid") {
                                                    nextPayment = payment;
                                                    breakStatement = true;
                                                }
                                            });

                                            return (
                                                <tr className={"text-center"} key={sector.id}>
                                                    <td>{sector.name}</td>
                                                    <td>
                                                        {checkPayments(sector.payments, 'electricity')}
                                                        <a onClick={() => showHelperModels(sector, index)}
                                                           style={{cursor: "pointer"}}
                                                           className={index === activeElectricityModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                                            data-tooltip-id='dewa-account'
                                                           data-tooltip-content={"Show this electricity details"}>
                                                            <span className="aside-menu-icon">
                                                                <FontAwesomeIcon
                                                                    icon={index === activeElectricityModal ? faEye : faEyeSlash}/>
                                                            </span>
                                                        </a>
                                                        <Tooltip id='dewa-account'/>
                                                    </td>
                                                    <td>
                                                        {checkPayments(sector.payments, 'internet')}
                                                        <a onClick={() => showHelperModels(sector, index, 'internet')}
                                                           style={{cursor: "pointer"}}
                                                           className={index === activeElectricityModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                                            data-tooltip-id='internet-account'
                                                           data-tooltip-content={"Show this internet details"}>
                                                    <span className="aside-menu-icon">
                                                        <FontAwesomeIcon
                                                            icon={index === activeElectricityModal ? faEye : faEyeSlash}/>
                                                    </span>
                                                        </a>
                                                        <Tooltip id='internet-account'/>
                                                    </td>
                                                    <td>{
                                                        nextPayment ?
                                                            <>
                                                                <a
                                                                    className={"text-" + compareDates(nextPayment.date)}
                                                                    data-tooltip-id='next-payment-date'
                                                                    data-tooltip-content={`Payment Due: ${default_currency} ${nextPayment.amount}`}
                                                                >
                                                                    {monthNames[new Date(nextPayment.date).getMonth()] + " " + dateOrdinal(new Date(nextPayment.date).getDate()) + ", " + new Date(nextPayment.date).getFullYear()}
                                                                </a>
                                                                <Tooltip id='next-payment-date'/>
                                                                {compareDates(nextPayment.date) === 'danger' &&
                                                                    <a className={"ml-3 fa-pull-right"}
                                                                       onClick={() => handlePay(nextPayment)}
                                                                       style={{cursor: "pointer"}}>
                                                                        pay
                                                                    </a>
                                                                    // <Button onClick={() => handlePay(nextPayment)}
                                                                    //         className="ml-3 btn-sm">Paid</Button>
                                                                }
                                                            </> :
                                                            <>
                                                                <a className="text-success">All Paid</a>
                                                            </>
                                                    }
                                                    </td>
                                                    <td>
                                                        <ActionButtonHelpers
                                                            module={sector}
                                                            showModule={showSector}
                                                            deleteFunc={onDelete}
                                                            params={actionParams}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </>
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

            <SummeryCard
                showModal={showHelperModel}
                handelCloseModal={handleCloseModal}
                data={sector}
                currency={default_currency}
                modalType={showHelperModelType}
                Toast={Toast}
                navigation = {useNavigate}
                loadingMethod = {setLoading}
            />

            <Modal size="lg" show={showModal} centered onHide={handleCloseModal} className="custom-modal lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Sector Details</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4 className="mt-3 mb-3">Sector Details </h4>
                    <table className='table table-bordered table-striped mb-0'>
                        <tbody>
                        <tr>
                            <td width='50%'>
                                <strong>Sector :</strong>
                            </td>
                            <td> {modalSector?.name}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Contact Start Date :</strong>
                            </td>
                            <td> {modalSector?.contract_start_date}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Contact End Date :</strong>
                            </td>
                            <td> {modalSector?.contract_end_date}</td>
                        </tr>
                        </tbody>
                    </table>

                    <h4 className="mt-3 mb-3">DEWA Details </h4>
                    <table className='table table-bordered table-striped mb-0'>
                        <tbody>
                        <tr>
                            <td width='50%'>
                                <strong>Electricity Acc No. :</strong>
                            </td>
                            <td> {modalSector?.el_acc_no}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Electricity Business Acc No:</strong>
                            </td>
                            <td> {modalSector?.el_business_acc_no}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Electricity Billing Date :</strong>
                            </td>
                            <td> {modalSector?.el_billing_date}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Electricity Premises No. :</strong>
                            </td>
                            <td> {modalSector?.el_premises_no}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Note:</strong>
                            </td>
                            <td> {modalSector?.el_note}</td>
                        </tr>
                        </tbody>
                    </table>

                    <h4 className="mt-3 mb-3">Internet Details </h4>
                    <table className='table table-bordered table-striped mb-0'>
                        <tbody>
                        <tr>
                            <td width='50%'>
                                <strong>Internet Acc No:</strong>
                            </td>
                            <td> {modalSector?.internet_acc_no}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Internet Billing Date:</strong>
                            </td>
                            <td> {modalSector?.internet_billing_date}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Note:</strong>
                            </td>
                            <td> {modalSector?.int_note}</td>
                        </tr>
                        </tbody>
                    </table>

                    <h4 className="mt-3 mb-3">Income and Expense: </h4>
                    <table className='table table-bordered table-striped mb-0'>
                        <tbody>
                        <tr>
                            <td width='50%'>
                                <strong>Total Income:</strong>
                            </td>
                            <td> {default_currency + ' ' + incomeExpense.income}</td>
                        </tr>
                        <tr>
                            <td width='50%'>
                                <strong>Total Expense:</strong>
                            </td>
                            <td> {default_currency + ' ' + incomeExpense.expense}</td>
                        </tr>
                        </tbody>
                    </table>
                    <h4 className="mt-3 mb-3">Payment Info </h4>
                    <Table responsive striped bordered hover variant="light">

                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Payment No.</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {modalSector?.payments && modalSector?.payments.length > 0 && modalSector?.payments.map((data, i) => {
                            return (
                                <tr key={data.id}>
                                    <td>{i + 1}</td>
                                    <td>{data?.payment_number}</td>
                                    <td>{default_currency + ' ' + data?.amount}</td>
                                    <td>{data?.date}</td>
                                    <td>{data?.type}</td>
                                    {data?.status === 'paid' ? <td style={{color: 'green'}}>{data?.status}</td> :
                                        <td style={{color: 'red'}}>{data?.status}</td>}
                                </tr>
                            )
                        })}

                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-primary' onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}