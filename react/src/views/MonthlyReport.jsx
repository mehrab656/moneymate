import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";
import DatePicker from "react-datepicker";
import MonthlyReportTable from "../components/MonthlyReportTable.jsx";

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

    const [overAllReport, setOverAllReport] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const {applicationSettings} = useContext(SettingsContext);
    const [fromDate, setFromDate] = useState(null);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);

    const [tableRow, setTableRow] = useState([]);
    var rows = [];
    const overallReportRow = () => {
        rows = [];
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
        console.log('foobar')
        setLoading(true);
        try {
            axiosClient.get('/report/get-monthly-report', {
                params: {from_date: fromDate, category_id: selectedCategoryId},
            }).then(({data}) => {
                if (data.status === 404) {
                    setAlertMessage(data.message);
                }else{
                    setAlertMessage(null)
                }

                setOverAllReport(data);
                overallReportRow();
                setLoading(false);
            })
        } catch (error) {
            console.warn(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Monthly Reports";
        getOverallReports();
    }, [overAllReport.length]);

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
        // setOverAllReport(initialState);
        getOverallReports();
    };
    const resetFilterParameter = () => {
        setLoading(true);
        setFromDate(null);
        setSelectedCategoryId('');
        setOverAllReport(initialState);
        setLoading(false);
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className="animated fadeInDown">
                <div className="row mb-3">
                    <table>
                        <tbody>
                        <tr style={{border:'hidden'}}>
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
                                            <b>{overAllReport.sector?.name ?? 'Monthly report'}</b></td>
                                    </tr>
                                    <tr className={'text-center'}>
                                        <td colSpan={2}><b>{'Reporting Month'}</b></td>
                                        <td colSpan={9}><b>{overAllReport.reportingMonth}</b></td>
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
                                            <b>{overAllReport.summery?.totalIncome}</b></td>
                                        <td style={{borderTop: "hidden"}}></td>
                                        <td className={'table_total bg-info'} colSpan={3}><b>Total</b></td>
                                        <td className={'amount bg-info'} colSpan={2}>
                                            <b>{overAllReport.summery?.totalExpense}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6}></td>
                                        {/*<td rowSpan={4}></td>*/}
                                        <td colSpan={5} rowSpan={3} contentEditable={true}>Remarks:</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}><b>Total Cost of {overAllReport.reportingMonth}</b></td>
                                        <td colSpan={2} className={'amount'}>
                                            <b>{overAllReport.summery?.totalExpense}</b></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}><b>Total Income of {overAllReport.reportingMonth}</b></td>
                                        <td colSpan={2} className={'amount'}><b>{overAllReport.summery?.totalIncome}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}>
                                            <b>Net {overAllReport.summery?.title} of {overAllReport.reportingMonth}</b>
                                        </td>
                                        <td colSpan={2} className={'amount'}><b>{overAllReport.summery?.net}</b></td>
                                        <td colSpan={3}><b>Net {overAllReport.summery?.title}</b></td>
                                        <td className={'amount'} colSpan={2}><b>{overAllReport.summery?.netPercent}</b>
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

