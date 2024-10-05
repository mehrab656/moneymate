import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowsToEye,
    faEye,
    faEyeDropper,
    faEyeSlash, faFilter,
    faListAlt,
    faStreetView
} from "@fortawesome/free-solid-svg-icons";
import ExpenseModal from "../helper/ExpenseModal.jsx";
import {Tooltip} from "react-tooltip";
import {Col, Container, Row} from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import {Link} from "react-router-dom";
import ExpenseFilter from "../helper/filter-icons/ExpenseFilter.jsx";
import {Box, Button} from "@mui/material";
import ReactToPrint from "react-to-print";


const defaultParams = {
    start_date: '',
    end_date: '',
    cat_id: '',
    sec_id: '',
    search_terms: '',
    orderBy: 'date',
    order: 'DESC',
    limit: 10,
}
export default function ExpenseReport() {
    const componentRef = useRef()
    const [loading, setLoading] = useState(false);
    const [expenseReport, setExpenseReport] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [totalExpense, setTotalExpense] = useState(parseFloat(0).toFixed(2));
    const [activeModal, setActiveModal] = useState('');
    const [modalData, setModalData] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        refundable_amount: 0, // Set default value to an empty string
        refunded_amount: 0,
        category_id: null,
        description: '',
        reference: '',
        date: '',
        note: '',
        attachment: ''
    });
    const [params, setParam] = useState(defaultParams);
    const [hasFilter, setHasFilter] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const {applicationSettings} = useContext(SettingsContext);
    let {
        default_currency
    } = applicationSettings;

    if (default_currency === undefined) {
        default_currency = 'AED ';
    }

    const showExpenseDetails = (expense, index) => {
        setActiveModal(index)
        setModalData(expense);
        setShowModal(true);
    }
    useEffect(() => {
        axiosClient.get('/expense-categories', {
            params: {sector_id: params.sec_id}
        })
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
            });
    }, [params.sec_id]);

    useEffect(() => {

        axiosClient.get('/sectors-list')
            .then(({data}) => {
                setSectors(data.sectors);
            }).catch(error => {
            console.warn('Error Loading sectors: ', error);
        });

    }, [])

    const handleCloseModal = () => {
        setActiveModal('');
        setShowModal(false);
    };
    const getExpenseReport = () => {
        setLoading(true);
        setTotalExpense(0);
        axiosClient
            .get("/report/expense", {params: params})
            .then(({data}) => {
                setExpenseReport(data.expenses);
                setTotalExpense(data.totalExpense);
                setLoading(false);
            }).catch((e) => {
            setLoading(false);
        })
    };
    useEffect(() => {
        document.title = "Expenses Report";
        getExpenseReport();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setHasFilter(true);
        getExpenseReport();
    };

    const resetFilterParameter = () => {
        setHasFilter(false);
        setParam(defaultParams);
        getExpenseReport();
    };

    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown wiz-card-mh expx">
                <div className="row">
                    <Container>
                        <Row>
                            <ExpenseFilter
                                params={params}
                                setParam={setParam}
                                handleSubmit={handleSubmit}
                                sectors={sectors}
                                expenseCategories={expenseCategories}
                                resetFilterParameter={resetFilterParameter}
                                hasFilter={hasFilter}
                            />
                        </Row>
                        <Row>
                            <Col xs={12} md={9} ref={componentRef}>
                                <div className="table-responsive-sm my-custom-scrollbar table-wrapper-scroll-y">
                                    <table className="table table-bordered custom-table">
                                        <thead>
                                        <tr className={'text-center'}>
                                            <th>Expense Date</th>
                                            <th>Expense Category</th>
                                            <th>Description</th>
                                            <th>Expense Amount</th>
                                        </tr>
                                        </thead>
                                        {loading && (
                                            <tbody>
                                            <tr className={'text-center'}>
                                                <td colSpan={4} className="text-center">
                                                    Loading...
                                                </td>
                                            </tr>
                                            </tbody>
                                        )}
                                        {!loading && (
                                            <tbody>
                                            {expenseReport.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        Nothing found !
                                                    </td>
                                                </tr>
                                            ) : (
                                                expenseReport.map((expense, index) => (
                                                    <tr key={expense.id} className={'text-start'}>
                                                        <td>{expense.date}</td>
                                                        <td>{expense.category_name}</td>
                                                        <td>{expense.description}
                                                            <a onClick={() => showExpenseDetails(expense, index)}
                                                               className={index === activeModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                                               data-tooltip-id='expense-details'
                                                               data-tooltip-content={"View details"}>
                                                    <span className="aside-menu-icon">
                                                        <FontAwesomeIcon
                                                            icon={index === activeModal ? faEye : faEyeSlash}/>
                                                    </span>
                                                            </a>
                                                            <Tooltip id={"expense-details"}/>
                                                        </td>
                                                        <td className={'text-end'}>{default_currency + ' ' + expense.amount}</td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        )}

                                        <tfoot>
                                        <tr>
                                            <td className={'text-center fw-bold'} colSpan={2}>Total Expense</td>
                                            <td className={'text-end fw-bold'}
                                                colSpan={2}>{default_currency + ' ' + totalExpense}</td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>

                            </Col>
                            <Col xs={12} md={3}>
                                <div className="card ">
                                    <div className="card-block">
                                        <h6 className="text-muted m-b-20">Total Expense</h6>
                                        <h4>{default_currency + ' ' + totalExpense}</h4>
                                        <p className="text-muted">Total expense amount</p>
                                    </div>
                                </div>

                                <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                    <ReactToPrint
                                        trigger={() => <Button sx={{ml: 1}} variant="outlined">Print</Button>}
                                        content={() => componentRef.current}
                                    />
                                </Box>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </WizCard>

            <ExpenseModal showModal={showModal}
                          handelCloseModal={handleCloseModal}
                          title={'Expense Details'}
                          data={modalData}
                          currency={default_currency}
            />
        </div>
    );
}
