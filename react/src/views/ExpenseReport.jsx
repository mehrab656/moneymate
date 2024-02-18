import React, {useContext, useEffect, useState} from "react";
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
    faEyeSlash,
    faListAlt,
    faStreetView
} from "@fortawesome/free-solid-svg-icons";
import ExpenseModal from "../helper/ExpenseModal.jsx";
import {Tooltip} from "react-tooltip";
import {Col, Container, Row} from "react-bootstrap";

export default function ExpenseReport() {
    const [loading, setLoading] = useState(false);
    const [expenseReport, setExpenseReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [selectedSectorId, setSelectedSectorId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [totalExpense, setTotalExpense] = useState(parseFloat(0).toFixed(2));
    const [activeModal, setActiveModal] = useState('')
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
            params: {sector_id: selectedSectorId ? selectedSectorId : null}
        })
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
            });
    }, [selectedSectorId]);

    useEffect(() => {

        axiosClient.get('/sectors-list')
            .then(({data}) => {
                setSectors(data.sectors);
            }).catch(error => {
            console.warn('Error Loading sectors: ', error);
        });

    },[])

    const handleCloseModal = () => {
        setActiveModal('');
        setShowModal(false);
    };
    const getExpenseReport = () => {
        setLoading(true);
        setTotalExpense(0);
        axiosClient
            .get("/report/expense", {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    cat_id: selectedCategoryId,
                    sec_id: selectedSectorId
                },
            })
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
        getExpenseReport();
    };

    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedCategoryId('');
        setSelectedSectorId('')
        getExpenseReport();
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown wiz-card-mh expx">
                <div className="row">
                    <form onSubmit={handleSubmit}>
                        <div className="col-3">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="expense_category">Sectors</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedSectorId}
                                    id="sector"
                                    name="sector"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedSectorId(value);
                                    }}>
                                    <option defaultValue>Filter By Sectors</option>
                                    {sectors.map(sector => (
                                        <option key={"sec-" + sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="expense_category">Expense Category</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedCategoryId}
                                    id="expense-category"
                                    name="expense-category"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedCategoryId(value);
                                    }}>
                                    <option defaultValue>Filter By Category</option>
                                    {expenseCategories.map(category => (
                                        <option key={'cat-' + category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="start_date">Start Date</label>
                                <DatePicker
                                    className="custom-form-control"
                                    id="start_date"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="end_date">End Date:</label>
                                <DatePicker
                                    className="custom-form-control"
                                    id="end_date"
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>
                        <div className="col-2 mt-4">
                            <button className={'btn-add right mt-2'} type="submit">Filter</button>
                            <button className="btn btn-warning ml-2" onClick={resetFilterParameter}>Reset</button>
                        </div>
                    </form>
                </div>

                <br/>
                <div className="row">
                    <Container>
                        <Row>
                            <Col xs={12} md={9}>
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
                                            <td className={'text-end fw-bold'} colSpan={2}>{default_currency + ' ' + totalExpense}</td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>

                            </Col>
                            <Col xs={12} md={3}>
                                <div className="card quater-card summery-card">
                                    <div className="card-block">
                                        <h6 className="text-muted m-b-20">Total Expense</h6>
                                        <h4>{default_currency + ' ' + totalExpense}</h4>
                                        <p className="text-muted">Total expense amount</p>
                                    </div>
                                </div>

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
        </>
    );
}
