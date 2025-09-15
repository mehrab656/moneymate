import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../../components/WizCard.jsx";
import {SettingsContext} from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import IncomeModal from "../../helper/IncomeModal.jsx";
import ReactToPrint from 'react-to-print'

export default function IncomeReport() {
    const componentRef  = useRef()
    const [loading, setLoading] = useState(false);
    const [incomeReport, setIncomeReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [totalIncome, setTotalIncome] = useState(parseFloat(0).toFixed(2))
    const [activeModal, setActiveModal] = useState('')
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: 0, // Set default value to an empty string
        category_id: null,
        category_name: '',
        description: '',
        reference: '',
        date: '',
        note: '',
        attachment: ''
    });

    const {applicationSettings} = useContext(SettingsContext);
    let {
        default_currency
    } = applicationSettings;

    useEffect(() => {
        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading income categories:', error);
            });
    }, [setIncomeCategories]);

    const getIncomeReport = () => {
        setLoading(true);
        axiosClient
            .get("/report/income", {
                params: {start_date: startDate, end_date: endDate, cat_id: selectedCategoryId},
            })
            .then(({data}) => {
                setIncomeReport(data.incomes);
                setTotalIncome(data.totalIncome);
                setLoading(false);
            });
    };

    const showIncomeDetails = (income, index) => {
        setActiveModal(index)
        setModalData(income);
        setShowModal(true);
    }

    useEffect(() => {
        document.title = "Income Report";
        getIncomeReport();
    }, []);

    const handleIncomeFilterSubmit = (e) => {
        e.preventDefault();
        getIncomeReport();
    };
    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedCategoryId('');
        getIncomeReport();
    };
    const handleCloseModal = () => {
        setActiveModal('');
        setShowModal(false);
    };
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="row">
                    <form onSubmit={handleIncomeFilterSubmit}>
                        <div className="col-3">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="income_category">Income Category</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedCategoryId}
                                    id="income-category"
                                    name="income-category"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setSelectedCategoryId(value);
                                    }}>
                                    <option defaultValue>Filter by income category</option>
                                    {incomeCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="start_date">Start Date:</label>
                                <DatePicker
                                    className="custom-form-control"
                                    id="start_date"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>
                        <div className="col-3">
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
                        <div className="col-3 mt-4">
                            <button className={'btn-add right mt-2'} type="submit">Filter</button>
                            <button className={"btn btn-warning ml-2"} onClick={resetFilterParameter}>Reset</button>
                            <ReactToPrint
                                trigger={() => <button className="btn btn-success ml-2">Print</button>}
                                content={()=> componentRef.current}
                             />
                        </div>
                    </form>
                </div>
                <div className="row" ref={componentRef}>
                    <div className="table-responsive-sm">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Income Date</th>
                                <th>Income Description</th>
                                <th>Income Category</th>
                                <th>Income Amount</th>
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
                                {incomeReport.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            Nothing found !
                                        </td>
                                    </tr>
                                ) : (
                                    incomeReport.map((income, index) => (
                                        <tr key={income.id} className={'text-center'}>
                                            <td>{income.date}</td>
                                            <td>{income.description}
                                                <a onClick={() => showIncomeDetails(income, index)}
                                                   className={index === activeModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                                   data-tooltip-id='expense-details'
                                                   data-tooltip-content={"View details"}>
                                                      <span className="aside-menu-icon">
                                                        <FontAwesomeIcon icon={index === activeModal ? faEye : faEyeSlash}/>
                                                    </span>
                                                </a>
                                            </td>
                                            <td>{income.category_name}</td>
                                            <td className={'text-end'}>{default_currency + ' ' + +income.amount}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            )}

                            <tfoot>
                            <tr>
                                <td className={'text-center fw-bold'} colSpan={3}>Total Income</td>
                                <td className={'text-end fw-bold'}>{default_currency + ' ' + +parseFloat(totalIncome).toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </WizCard>

            <IncomeModal showModal={showModal}
                         handelCloseModal={handleCloseModal}
                         title={'Expense Details'}
                         data={modalData}
                         currency={default_currency}
            />
        </>
    );
}
