import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import DatePicker from "react-datepicker";
import MonthlyReportTable from "../components/MonthlyReportTable.jsx";
import Swal from "sweetalert2";

const initialState = {
    incomes: [],
    expenses: [],
    sector: {},
    length: 0,
    netIncome: '',
    netIncomePercent: '',
    reportingMonth: '',
    summery: []
}
export default function MonthlyReport() {

    const [monthlyReport, setMonthlyReport] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
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
    const [tableRow, setTableRow] = useState([]);
    var rows = [];
    const overallReportRow = () => {
        rows = [];
        for (let i = 0; i < monthlyReport.length; i++) {
            rows.push(<MonthlyReportTable income={monthlyReport.incomes[i]}
                                          expense={monthlyReport.expenses[i]}
                                          sectorName={monthlyReport.sector.name}
                                          sl={i}
                                          key={i}/>);
        }
        setTableRow(rows);
    }
    const getMonthlyReports = () => {
        setLoading(true);

        axiosClient.get('/report/get-monthly-report', {
            params: {from_date: fromDate, category_id: selectedCategoryId},
        }).then(({data}) => {
            setAlertMessage(null)
            setMonthlyReport(data);
            overallReportRow();
            setLoading(false);
        }).catch(err => {
            setAlertMessage(err.response.data.message);
            setTimeout(() => {
                setAlertMessage(null)
            }, 3000);
            setLoading(false);
        });
        setLoading(false);
    };

    useEffect(() => {
        document.title = "Monthly Reports";
        // getMonthlyReports();
    }, []);

    useEffect(() => {
        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading income categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        getMonthlyReports();
    };
    const resetFilterParameter = () => {
        setLoading(true);
        setFromDate(null);
        setSelectedCategoryId('');
        setMonthlyReport(initialState);
        setLoading(false);
        setAlertMessage(null);
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <div className="row mb-3">
                    <table>
                        <tbody>
                        <tr style={{border: 'hidden'}}>
                            <td>
                                <form onSubmit={handleSubmit}>
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
                                </form>
                            </td>
                            <td>
                                <form onSubmit={handleSubmit}>
                                    <DatePicker
                                        label={"Select Report Month"}
                                        className="custom-form-control"
                                        id="from_date"
                                        selected={fromDate}
                                        onChange={(date) => setFromDate(date)}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                    />
                                </form>
                            </td>
                            <td width={'5%'}>
                                <form onSubmit={handleSubmit}>
                                    <button className={'btn-add right'} type="submit">Filter</button>
                                </form>
                            </td>
                            <td>
                                <button className="btn btn-warning" onClick={resetFilterParameter}>Reset</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {
                    alertMessage &&
                    <div className="alert alert-danger" role="alert">
                        {alertMessage}
                    </div>
                }

                <div className="row">
                    <div className="col-12">
                        <div className="responsive" style={{overflow: 'auto'}}>
                            <div className="table-responsive-sm">
                                <table className="table  table-bordered">
                                    <thead>
                                    <tr className={'text-center'}>
                                        <td colSpan={11} className={'bg-info'}>
                                            <b>{monthlyReport.sector?.name ?? 'Monthly report'}</b></td>
                                    </tr>
                                    <tr className={'text-center'}>
                                        <td colSpan={2}><b>{'Reporting Month'}</b></td>
                                        <td colSpan={9}><b>{monthlyReport.reportingMonth}</b></td>
                                    </tr>
                                    <tr className={'text-center'}>
                                        <td colSpan={5}><b>{'Incomes'}</b></td>
                                        <td colSpan={1} rowSpan={13} width={'5%'}></td>
                                        <td colSpan={5}><b>{'Expenses'}</b></td>
                                    </tr>
                                    <tr>
                                        <td><b>{'S/L'}</b></td>
                                        <td colSpan={3}><b>{'Description'}</b></td>
                                        <td><b>{'Amount'}</b></td>
                                        <td><b>{'S/L'}</b></td>
                                        <td colSpan={3}><b>{'Description'}</b></td>
                                        <td><b>{'Amount'}</b></td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        tableRow
                                    }

                                    <tr>
                                        <td className={'table_total bg-warning'} colSpan={3}><b>Total</b></td>
                                        <td className={'amount bg-warning'} colSpan={2}>
                                            <b>{monthlyReport.summery?.totalIncome}</b></td>
                                        <td style={{borderTop: "hidden"}}></td>
                                        <td className={'table_total bg-info'} colSpan={3}><b>Total</b></td>
                                        <td className={'amount bg-info'} colSpan={2}>
                                            <b>{monthlyReport.summery?.totalExpense}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6}></td>
                                        {/*<td rowSpan={4}></td>*/}
                                        <td colSpan={5} rowSpan={3}>Remarks:</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}><b>Total Cost of {monthlyReport.reportingMonth}</b></td>
                                        <td colSpan={2} className={'amount'}>
                                            <b>{monthlyReport.summery?.totalExpense}</b></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}><b>Total Income of {monthlyReport.reportingMonth}</b></td>
                                        <td colSpan={2} className={'amount'}><b>{monthlyReport.summery?.totalIncome}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}>
                                            <b>Net {monthlyReport.summery?.title} of {monthlyReport.reportingMonth}</b>
                                        </td>
                                        <td colSpan={2} className={'amount'}><b>{monthlyReport.summery?.net}</b></td>
                                        <td colSpan={3}><b>Net {monthlyReport.summery?.title}</b></td>
                                        <td className={'amount'} colSpan={2}><b>{monthlyReport.summery?.netPercent}</b>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </WizCard>
        </>
    )
}

