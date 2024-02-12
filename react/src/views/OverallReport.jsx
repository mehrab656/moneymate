import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import Table from 'react-bootstrap/Table'
import MainLoader from "../components/MainLoader.jsx";
import ActionButtonHelpers from "../helper/ActionButtonHelpers.jsx";
import OverallReportTable from "./OverallReportTable.jsx";
import DatePicker from "react-datepicker";

const initialState = {
    investments: [],
    incomes: [],
    expenses: [],
    totalInvestment: 0,
    totalExpense: 0,
    totalIncome: 0,
    length: 0,
    refundable_amount: 0,
    refunded_amount: 0,
    market_receivable: 0,
    account_receivable: 0,
    lends: 0,
    borrow: 0,
    total_cash_in: 0,
    total_cash_out: 0,
    current_balance: 0,
}
export default function OverallReport() {

    const [overAllReport, setOverAllReport] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const {
        default_currency,
    } = applicationSettings;

    const [tableRow, setTableRow] = useState([]);
    var rows = [];
    const overallReportRow = () => {
        for (let i = 0; i < overAllReport.length; i++) {


            rows.push(<OverallReportTable investment={overAllReport.investments[i]}
                                          income={overAllReport.incomes[i]}
                                          expense={overAllReport.expenses[i]}
                                          sl={i}
                                          key={i}/>);
        }

        setTableRow(rows);
    }
    const getOverallReports = () => {
        setLoading(true);
        try {
            axiosClient.get('/report/over-all', {
                params: {start_date: startDate, end_date: endDate},
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
        getOverallReports();

    }, [overAllReport.length]);


    const handleSubmit = (e) => {
        e.preventDefault();
        // setOverAllReport(initialState);
        getOverallReports();
    };
    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        getOverallReports();
    };
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <h1 className="title-text text-center">Overall Reports</h1>
                <div className="row">
                    <form onSubmit={handleSubmit}>
                        <div className="col-4">
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
                        <div className="col-4">
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
                        <div className="col-4 mt-4">
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
                                        <th colSpan={3} className={'bg-info'}><b>Investment</b></th>
                                        <th colSpan={3} className={'bg-warning'}><b>Expense</b></th>
                                        <th colSpan={3} className={'bg-info'}><b>Income</b></th>
                                    </tr>
                                    <tr>
                                        <th>S/L</th>
                                        <th>Investor</th>
                                        <th>Amount</th>
                                        <th>S/L</th>
                                        <th>Sector</th>
                                        <th>Amount</th>
                                        <th>S/L</th>
                                        <th>Sector</th>
                                        <th>Amount</th>
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
                                            <td className={'table_total bg-info'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount bg-info'}><b>{overAllReport.totalInvestment}</b></td>
                                            <td className={'table_total bg-warning'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount bg-warning'}><b>{overAllReport.totalExpense}</b></td>
                                            <td className={'table_total bg-info'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount bg-info'}><b>{overAllReport.totalIncome}</b></td>
                                        </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>

                            <div className="table-responsive-sm">
                                <table className="table table-bordered custom-table">
                                    <thead>
                                    <tr className={'text-center'}>
                                        <th colSpan={3} className={"bg-info"}><b>Cash IN</b></th>
                                        <th colSpan={3} className={'bg-primary'}><b>Cash OUT</b></th>
                                        <th colSpan={4} rowSpan={2} className={'bg-success text-white'}><b>Final Summary</b></th>
                                    </tr>
                                    <tr>
                                        <th>S/L</th>
                                        <th>Details</th>
                                        <th>Amount</th>
                                        <th>S/L</th>
                                        <th>Details</th>
                                        <th>Amount</th>
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
                                        <tr>
                                            <td className={'sl_class'}>1</td>
                                            <td>Investment</td>
                                            <td className={'amount'}>{overAllReport.totalInvestment}</td>
                                            <td className={'sl_class'}>1</td>
                                            <td>Expense</td>
                                            <td className={'amount'}>{overAllReport.totalExpense}</td>
                                            <td colSpan={2}>Current Balance</td>
                                            <td colSpan={2} className={'amount'}>{overAllReport.current_balance}</td>
                                        </tr>
                                        <tr>
                                            <td className={'sl_class'}>2</td>
                                            <td>Income</td>
                                            <td className={'amount'}>{overAllReport.totalIncome}</td>
                                            <td className={'sl_class'}>2</td>
                                            <td>Lend to Others</td>
                                            <td className={'amount'}>{overAllReport.lends}</td>
                                            <td colSpan={2}>Account Receivable</td>
                                            <td colSpan={2} className={'amount'}>{overAllReport.account_receivable}</td>
                                        </tr>
                                        <tr>
                                            <td className={'sl_class'}>3</td>
                                            <td>Refunded Amount</td>
                                            <td className={'amount'}>{overAllReport.refunded_amount}</td>
                                            <td colSpan={3} rowSpan={2}></td>
                                            <td colSpan={2}>Account Liability</td>
                                            <td colSpan={2} className={'amount'}>{overAllReport.lends}</td>
                                        </tr>
                                        <tr>
                                            <td className={'sl_class'}>4</td>
                                            <td>Loan</td>
                                            <td className={'amount'}>{overAllReport.borrow}</td>
                                            <td colSpan={4} rowSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td className={'table_total bg-info'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount bg-info'}><b>{overAllReport.total_cash_in}</b></td>
                                            <td className={'table_total'} colSpan={2}><b>Total</b></td>
                                            <td className={'amount'}><b>{overAllReport.total_cash_out}</b></td>
                                        </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>


                        </div>
                    </div>
                </div>
            </WizCard>
        </>
    )
}
