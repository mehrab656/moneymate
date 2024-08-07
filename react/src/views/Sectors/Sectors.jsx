import React, {useEffect, useState, useContext} from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import {Link, useNavigate} from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../../components/WizCard.jsx";
import {Modal, Table} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash, faPlus} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import {Tooltip} from "react-tooltip";
import MainLoader from "../../components/MainLoader.jsx";
import {checkPermission, compareDates} from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import {notification} from "../../components/ToastNotification.jsx";
import {CDropdown, CDropdownDivider, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/react";
import Checkbox from "@mui/material/Checkbox";
import ContractExtendCard from "../../helper/ContractExtendCard.jsx";

export default function Sectors() {
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const {num_data_per_page, default_currency} = applicationSettings;
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [modalSector, setModalSector] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showHelperModel, setShowHelperModel] = useState(false);
    const [showContractModel, setShowContractModel] = useState(false);
    const [showHelperModelType, setShowHelperModelType] = useState('');
    const pageSize = num_data_per_page;
    const totalPages = Math.ceil(totalCount / pageSize);
    const [activeElectricityModal, setActiveElectricityModal] = useState(null);
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
            setIncomeExpense(data);
        }).catch(e => {
            console.warn(e)
        })
        setModalSector(sector);
        setShowModal(true);
    };

    const showContractExtendModel = (sector)=>{
        setShowContractModel(true);
        setSector(sector);
    }
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
                    .then((data) => {
                        getSectors();
                        notification('success', data?.message, data?.description)
                    })
                    .catch(err => {
                        if (err.response) {
                            const error = err.response.data
                            notification('error', error?.message, error.description)
                        }
                    })
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
                    notification('success', data?.message, data?.description)
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                }).catch(err => {
                    if (err.response) {
                        const error = err.response.data
                        notification('error', error?.message, error.description)
                    }
                })
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
    const closeContractExtendModal = ()=>{
        setShowContractModel(false);
    }
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
                className={message === '' ? 'text-success' : 'text-warning'}>{message === '' ? 'All Clear' : message}</span>
        )
    }

    const showHelperModels = (sector, index, type = 'electricity') => {
        setActiveElectricityModal(index);
        setSector(sector);
        setShowHelperModelType(type)
        setShowHelperModel(true);
    }
    const showTableColumns = (column) => {
        console.log({column})
    }
    const remainingContract = ( end) => {

        let startDate = new Date();

        let endDate = new Date(end);

        const startYear = startDate.getFullYear();
        const february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
        const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        let yearDiff = endDate.getFullYear() - startYear;
        let monthDiff = endDate.getMonth() - startDate.getMonth();
        if (monthDiff < 0) {
            yearDiff--;
            monthDiff += 12;
        }
        let dayDiff = endDate.getDate() - startDate.getDate();
        if (dayDiff < 0) {
            if (monthDiff > 0) {
                monthDiff--;
            } else {
                yearDiff--;
                monthDiff = 11;
            }
            dayDiff += daysInMonth[startDate.getMonth()];
        }

        return yearDiff + ' Year ' + monthDiff + ' Months ' + dayDiff + ' Days.';
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
                    {checkPermission(userPermission.sector_create) &&
                        <div className="col-md-2">
                            <Link className='btn-add align-right mr-3' to='/sector/new'>
                                <FontAwesomeIcon icon={faPlus}/> Add New
                            </Link>
                        </div>
                    }

                </div>
                <div className='table-responsive-sm'>
                    <table className='table table-bordered custom-table'>
                        <thead>
                        <tr className={"text-center"}>
                            {
                                userRole === 'admin' &&
                                <th>id</th>
                            }
                            <th>Sector</th>
                            <th>Electricity next payment</th>
                            <th>Internet next payment</th>
                            <th>Cheque next payment</th>
                            <th>Action
                                <CDropdown variant="btn-group" direction="center">
                                    <CDropdownToggle color={''}></CDropdownToggle>
                                    <CDropdownMenu>
                                        <CDropdownItem href="#"><Checkbox
                                            checked={true} // Use menu[1] instead of menu[0]
                                            onChange={(e) => showTableColumns(e, true)}
                                            name='id'
                                            sx={{
                                                '& .MuiSvgIcon-root': {fontSize: 14}
                                            }}
                                        />{'id'}</CDropdownItem>
                                        <CDropdownItem href="#">Another action</CDropdownItem>
                                        <CDropdownItem href="#">Something else here</CDropdownItem>
                                        <CDropdownItem href="#">Separated link</CDropdownItem>
                                    </CDropdownMenu>
                                </CDropdown>
                            </th>
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
                                                if (payment.status === "unpaid" && payment.type === 'cheque') {
                                                    nextPayment = payment;
                                                    breakStatement = true;
                                                }
                                            });

                                            return (
                                                <tr key={sector.id}>
                                                    {
                                                        userRole === 'admin' &&
                                                        <td>{sector.id}</td>
                                                    }
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
                                                                    data-tooltip-content={`Payment Due: ${default_currency} ${nextPayment.amount}`}>
                                                                    {monthNames[new Date(nextPayment.date).getMonth()] + " " + dateOrdinal(new Date(nextPayment.date).getDate()) + ", " + new Date(nextPayment.date).getFullYear()}
                                                                </a>
                                                                <Tooltip id='next-payment-date'/>
                                                                {compareDates(nextPayment.date) === 'danger' &&
                                                                    <a className={"ml-3 fa-pull-right"}
                                                                       onClick={() => handlePay(nextPayment)}
                                                                       style={{cursor: "pointer"}}>
                                                                        pay
                                                                    </a>
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
                                                            editDropdown={userPermission.sector_edit}
                                                            showPermission={userPermission.sector_view}
                                                            deletePermission={userPermission.sector_delete}
                                                            contractExtend = {true}
                                                            contractShowModule = {showContractExtendModel}
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
                navigation={useNavigate}
                loadingMethod={setLoading}
            />
            <ContractExtendCard
                showModal ={showContractModel}
                sector={sector}
                closeContractExtendModal = {closeContractExtendModal}
            />

            <Modal size="lg" show={showModal} centered onHide={handleCloseModal} className="custom-modal lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{modalSector?.name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className='table table-bordered border-primary '>
                        <tbody>
                        <tr>
                            <td>Rent:<strong>{modalSector?.rent}</strong></td>
                            <td>Contract Start:<strong> {modalSector?.contract_start_date}</strong></td>
                            <td>Contract End:<strong> {modalSector?.contract_end_date}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>Contract Remaining</td>
                            <td>
                                <strong> {remainingContract(modalSector.contract_end_date)}</strong>
                            </td>
                        </tr>

                        <tr>
                            <td rowSpan={3}>DEWA account</td>
                            <td>AC/No:<strong> {modalSector?.el_acc_no}</strong></td>
                            <td>Business Num.:<strong> {modalSector?.el_business_acc_no}</strong></td>
                        </tr>
                        <tr>
                            <td>Premises:<strong> {modalSector?.el_premises_no}</strong></td>
                            <td>Billing Date:<strong> {modalSector?.el_billing_date}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>Note:</td>
                        </tr>
                        <tr>
                            <td rowSpan={2}>Internet</td>
                            <td>Acc No:<strong> {modalSector?.internet_acc_no}</strong></td>
                            <td>Billing Date:<strong> {modalSector?.internet_billing_date}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>{'Note: ' + modalSector?.int_note}</td>
                        </tr>

                        <tr>
                            <td rowSpan={2}>{' Income and Expense'}</td>
                            <td colSpan={2}>Total
                                Income: <strong>{default_currency + ' ' + incomeExpense.income}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                Total Expense: <strong>{default_currency + ' ' + incomeExpense.expense}</strong>
                            </td>
                        </tr>

                        {modalSector?.channels && modalSector?.channels.length > 0 &&
                            <>
                                <tr>
                                    <td rowSpan={modalSector.channels.length + 1}>{'Channels'}</td>
                                </tr>
                                {
                                    modalSector?.channels.map((data, i) => {
                                        return (
                                            <tr key={"channel-row-" + i}>
                                                <td colSpan={2}>{data.channel_name} listing reference
                                                    id <strong>{data.reference_id}</strong> and listed
                                                    on {data.listing_date}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </>

                        }

                        <tr>
                            <td colSpan={3}><strong>Payment Information</strong></td>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Payment No.</th>
                            <th>Amount</th>
                        </tr>
                        {modalSector?.payments && modalSector?.payments.length > 0 && modalSector?.payments.map((data, i) => {
                            return (<tr key={data.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {data?.payment_number}
                                    <ul style={{display: "inline"}}>
                                        ( <a href="#" style={{
                                        textDecoration: "none",
                                        marginRight: 10
                                    }}>{data.date}</a>

                                        <a href="#" style={{
                                            textDecoration: "none",
                                            marginRight: 10
                                        }}>{data?.type}</a>)
                                    </ul>
                                </td>
                                <td>{default_currency + ' ' + data?.amount}
                                    <div><a href="#" style={{
                                        textDecoration: "none",
                                        float: "right",
                                        color: data?.status === 'paid' ? 'green' : 'red'
                                    }}>{data?.status}</a></div>
                                </td>
                            </tr>)
                        })}
                        </tbody>
                    </table>
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