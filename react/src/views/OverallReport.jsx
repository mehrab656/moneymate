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
    let rows = [];
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
                                        <th colSpan={3}><b>Investment</b></th>
                                        <th colSpan={3}><b>Expense</b></th>
                                        <th colSpan={3}><b>Income</b></th>
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
                                            <td colSpan={2}><b>Total</b></td>
                                            <td><b>{overAllReport.totalInvestment}</b></td>
                                            <td colSpan={2}><b>Total</b></td>
                                            <td><b>{overAllReport.totalExpense}</b></td>
                                            <td colSpan={2}><b>Total</b></td>
                                            <td><b>{overAllReport.totalIncome}</b></td>
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
