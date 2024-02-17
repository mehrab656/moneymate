import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import OverallReportTable from "./OverallReportTable.jsx";
import DatePicker from "react-datepicker";
import MonthlyReportTable from "../components/MonthlyReportTable.jsx";

const initialState = {
    incomes: [],
    expenses: [],
    sector: {},
    length: 0,
    totalIncome: '',
    totalExpense: '',
}
export default function MonthlyReport() {

    const [overAllReport, setOverAllReport] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectedFilterValue, setFilterValue] = useState('');
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const {
        default_currency,
    } = applicationSettings;

    const [tableRow, setTableRow] = useState([]);
    var rows = [];
    const overallReportRow = () => {

        for (let i = 0; i < overAllReport.length; i++) {
            rows.push(<MonthlyReportTable income={overAllReport.incomes[i]}
                                          expense={overAllReport.expenses[i]}
                                          sectorName={overAllReport.sector.name}
                                          sl={i}
                                          key={i}/>);
        }
        setTableRow(rows);
    }
    const getOverallReports = () => {
        setLoading(true);
        try {
            axiosClient.get('/report/get-monthly-report', {
                params: {from_date: fromDate, to_date: toDate, category_id: selectedCategoryId},
            }).then(({data}) => {
                setOverAllReport(data);
                rows = [];
                overallReportRow()

                setLoading(false);
            })
        } catch (error) {
            console.warn(error);
            setLoading(false);
        }
    };


    useEffect(() => {
        document.title = "Over-All Reports";
        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading income categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setIncomeCategories]);


    const handleSubmit = (e) => {
        e.preventDefault();
        // setOverAllReport(initialState);
        getOverallReports();
    };
    const resetFilterParameter = () => {
        setFromDate(null);
        setToDate(null);
        setSelectedCategoryId('');
        getOverallReports();
    };


    const setFilterDates = (filterValue) => {
        if (filterValue) {
            const fromDate = new Date();
            if (filterValue < 30) {
                fromDate.setDate(fromDate.getDate() - filterValue);
            }
            if (filterValue >= 30) {
                fromDate.setMonth(fromDate.getMonth() - (filterValue / 30));
            }
            setFromDate(fromDate);
            setToDate(new Date());
        } else {
            setFromDate(null);
            setToDate(null);
        }
    }
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <h1 className="title-text text-center">Overall Reports</h1>
                <div className="row">
                    <form onSubmit={handleSubmit}>
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
                                <label className="custom-form-label" htmlFor="from_date">From</label>
                                <DatePicker
                                    className="custom-form-control"
                                    id="from_date"
                                    selected={fromDate}
                                    onChange={(date) => setFromDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="to_date">To</label>
                                <DatePicker
                                    className="custom-form-control"
                                    id="to_date"
                                    selected={toDate}
                                    onChange={(date) => setToDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>
                        <div className="col-3 mt-4">
                            <button className={'btn-add right mt-2'} type="submit">Filter</button>
                            <button className="btn btn-warning ml-2" onClick={resetFilterParameter}>Reset</button>
                        </div>
                    </form>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="responsive" style={{overflow: 'auto'}}>
                            <div className="table-responsive-sm">
                                <table className="table table-bordered custom-table">
                                    <thead>
                                    <tr className={'text-center'}>
                                        <th colSpan={6} className={'bg-info'}><b>Income</b></th>
                                        <th colSpan={3} className={'bg-warning'}><b>Expense</b></th>
                                    </tr>
                                    <tr>
                                        <th style={{background: '#d8f1f3'}}>S/L</th>
                                        <th style={{background: '#d8f1f3'}} colSpan={4}>Description</th>
                                        <th style={{background: '#d8f1f3'}}>amount</th>
                                        <th style={{background: '#ffdd78'}}>S/L</th>
                                        <th style={{background: '#ffdd78'}}>Sector</th>
                                        <th style={{background: '#ffdd78'}}>Amount</th>
                                    </tr>
                                    </thead>
                                    {loading && (
                                        <tbody>
                                        <tr>
                                            <td colSpan={8} className="text-center">
                                                Loading...
                                            </td>
                                        </tr>
                                        </tbody>
                                    )}
                                    {!loading && (
                                        <tbody>
                                        {
                                            tableRow
                                        }
                                        <tr>

                                            <td className={'table_total bg-warning'} colSpan={5}><b>Total</b></td>
                                            <td className={'amount bg-warning'}><b>{overAllReport.totalIncome}</b></td>
                                            <td className={'table_total bg-info'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount bg-info'}><b>{overAllReport.totalExpense}</b></td>
                                        </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>

                            {/*<div className="table-responsive-sm">*/}
                            {/*    <table className="table table-bordered custom-table">*/}
                            {/*        <thead>*/}
                            {/*        <tr className={'text-center'}>*/}
                            {/*            <th colSpan={3} className={"bg-success text-white"}><b>Cash IN</b></th>*/}
                            {/*            <th colSpan={3} style={{background: '#dc3545', color: '#ffffff'}}><b>Cash*/}
                            {/*                OUT</b></th>*/}
                            {/*            <th colSpan={4} rowSpan={2} className={'bg-success text-white'}><b>Final*/}
                            {/*                Summary</b></th>*/}
                            {/*        </tr>*/}
                            {/*        <tr>*/}
                            {/*            <th style={{background: '#5bd99e'}}>S/L</th>*/}
                            {/*            <th style={{background: '#5bd99e'}}>Details</th>*/}
                            {/*            <th style={{background: '#5bd99e'}}>Amount</th>*/}
                            {/*            <th style={{background: '#f58c96'}}>S/L</th>*/}
                            {/*            <th style={{background: '#f58c96'}}>Details</th>*/}
                            {/*            <th style={{background: '#f58c96'}}>Amount</th>*/}
                            {/*        </tr>*/}
                            {/*        </thead>*/}
                            {/*        {loading && (*/}
                            {/*            <tbody>*/}
                            {/*            <tr>*/}
                            {/*                <td colSpan={8} className="text-center">*/}
                            {/*                    Loading...*/}
                            {/*                </td>*/}
                            {/*            </tr>*/}
                            {/*            </tbody>*/}
                            {/*        )}*/}
                            {/*        {!loading && (*/}
                            {/*            <tbody>*/}
                            {/*            <tr>*/}
                            {/*                <td style={{background: '#5bd99e'}} className={'sl_class'}>1</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}>Investment</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}*/}
                            {/*                    className={'amount'}>{overAllReport.totalInvestment}</td>*/}
                            {/*                <td style={{background: '#f58c96'}} className={'sl_class'}>1</td>*/}
                            {/*                <td style={{background: '#f58c96'}}>Expense</td>*/}
                            {/*                <td style={{background: '#f58c96'}}*/}
                            {/*                    className={'amount'}>{overAllReport.totalExpense}</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}>Current Balance</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}*/}
                            {/*                    className={'amount'}>{overAllReport.current_balance}</td>*/}
                            {/*            </tr>*/}
                            {/*            <tr>*/}
                            {/*                <td style={{background: '#5bd99e'}} className={'sl_class'}>2</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}>Income</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}*/}
                            {/*                    className={'amount'}>{overAllReport.totalIncome}</td>*/}
                            {/*                <td style={{background: '#f58c96'}} className={'sl_class'}>2</td>*/}
                            {/*                <td style={{background: '#f58c96'}}>Lend to Others</td>*/}
                            {/*                <td style={{background: '#f58c96'}}*/}
                            {/*                    className={'amount'}>{overAllReport.lends}</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}>Account Receivable</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}*/}
                            {/*                    className={'amount'}>{overAllReport.account_receivable}</td>*/}
                            {/*            </tr>*/}
                            {/*            <tr>*/}
                            {/*                <td style={{background: '#5bd99e'}} className={'sl_class'}>3</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}>Refunded Amount</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}*/}
                            {/*                    className={'amount'}>{overAllReport.refunded_amount}</td>*/}
                            {/*                <td style={{background: '#f58c96'}} colSpan={3} rowSpan={2}></td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}>Account Liability</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={2}*/}
                            {/*                    className={'amount'}>{overAllReport.borrow}</td>*/}
                            {/*            </tr>*/}
                            {/*            <tr>*/}
                            {/*                <td style={{background: '#5bd99e'}} className={'sl_class'}>4</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}>Loan</td>*/}
                            {/*                <td style={{background: '#5bd99e'}}*/}
                            {/*                    className={'amount'}>{overAllReport.borrow}</td>*/}
                            {/*                <td style={{background: '#d8f1f3'}} colSpan={4} rowSpan={2}></td>*/}
                            {/*            </tr>*/}
                            {/*            <tr>*/}
                            {/*                <td style={{background: '#d8f1f3'}}*/}
                            {/*                    className={'table_total bg-success text-white'} colSpan={2}><b>Total</b>*/}
                            {/*                </td>*/}
                            {/*                <td style={{background: '#d8f1f3'}}*/}
                            {/*                    className={'amount bg-success text-white'}>*/}
                            {/*                    <b>{overAllReport.total_cash_in}</b></td>*/}
                            {/*                <td style={{background: '#dc3545', color: '#ffffff'}}*/}
                            {/*                    className={'table_total'} colSpan={2}><b>Total</b></td>*/}
                            {/*                <td style={{background: '#dc3545', color: '#ffffff'}} className={'amount'}>*/}
                            {/*                    <b>{overAllReport.total_cash_out}</b></td>*/}
                            {/*            </tr>*/}
                            {/*            </tbody>*/}
                            {/*        )}*/}
                            {/*    </table>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </WizCard>
        </>
    )
}

