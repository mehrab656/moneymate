import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../../../axios-client.js";
import WizCard from "../../../components/WizCard.jsx";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import OverallReportTable from "./OverallReportTable.jsx";
import DatePicker from "react-datepicker";
import ReactToPrint from 'react-to-print'
import { Button } from "@mui/material";


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
    const componentRef  = useRef()

    const [overAllReport, setOverAllReport] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedFilterValue, setFilterValue] = useState('');
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
        getOverallReports();
    };
    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setFilterValue('');
        getOverallReports();
    };


    const setFilterDates=(filterValue)=> {
        if (filterValue){
            const startDate = new Date();
            if (filterValue<30){
                startDate.setDate(startDate.getDate()-filterValue);
            }
            if (filterValue>=30){
                startDate.setMonth(startDate.getMonth()-(filterValue/30));
            }
            setStartDate(startDate);
            setEndDate(new Date());
        }
        else {
            setStartDate(null);
            setEndDate(null);
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
                                <label className="custom-form-label" htmlFor="income_category">Filter</label>
                                <select
                                    className="custom-form-control"
                                    value={selectedFilterValue}
                                    id="income-category"
                                    name="income-category"
                                    onChange={(event) => {
                                        const value = event.target.value || '';
                                        setFilterValue(value);
                                        setFilterDates(value);
                                    }}>
                                    <option value={''}>Filter by Dates and Months</option>
                                    <option key={'filter_value_7'} value={'7'}>{'Last 7 Days'}</option>
                                    <option key={'filter_value_15'} value={'15'}>{'Last 15 Days'}</option>
                                    <option key={'filter_value_1'} value={'30'}>{'Last 1 Month'}</option>
                                    <option key={'filter_value_3'} value={'90'}>{'Last 3 Month'}</option>
                                    <option key={'filter_value_6'} value={'180'}>{'Last 6 Month'}</option>
                                    <option key={'filter_value_1_year'} value={'360'}>{'Last 1 Year'}</option>

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
                            <button className="btn btn-warning ml-2" onClick={resetFilterParameter}>Reset</button>
                            <ReactToPrint
                                trigger={() => <Button sx={{ml:1}} variant="outlined">Print</Button>}
                                content={()=> componentRef.current}
                             />
                        </div>
                    </form>
                </div>
                <div className="row"  ref={componentRef}>
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
                                        <th style={{background: '#d8f1f3'}}>S/L</th>
                                        <th style={{background: '#d8f1f3'}}>Investor</th>
                                        <th style={{background: '#d8f1f3'}}>Amount</th>
                                        <th style={{background: '#ffdd78'}}>S/L</th>
                                        <th style={{background: '#ffdd78'}}>Sector</th>
                                        <th style={{background: '#ffdd78'}}>Amount</th>
                                        <th style={{background: '#d8f1f3'}}>S/L</th>
                                        <th style={{background: '#d8f1f3'}}>Sector</th>
                                        <th style={{background: '#d8f1f3'}}>Amount</th>
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
                                        <th colSpan={3} className={"bg-success text-white"}><b>Cash IN</b></th>
                                        <th colSpan={3} style={{background: '#dc3545', color: '#ffffff'}}><b>Cash
                                            OUT</b></th>
                                        <th colSpan={4} rowSpan={2} className={'bg-success text-white'}><b>Final
                                            Summary</b></th>
                                    </tr>
                                    <tr>
                                        <th style={{background: '#5bd99e'}}>S/L</th>
                                        <th style={{background: '#5bd99e'}}>Details</th>
                                        <th style={{background: '#5bd99e'}}>Amount</th>
                                        <th style={{background: '#f58c96'}}>S/L</th>
                                        <th style={{background: '#f58c96'}}>Details</th>
                                        <th style={{background: '#f58c96'}}>Amount</th>
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
                                            <td style={{background: '#5bd99e'}} className={'sl_class'}>1</td>
                                            <td style={{background: '#5bd99e'}}>Investment</td>
                                            <td style={{background: '#5bd99e'}}
                                                className={'amount'}>{overAllReport.totalInvestment}</td>
                                            <td style={{background: '#f58c96'}} className={'sl_class'}>1</td>
                                            <td style={{background: '#f58c96'}}>Expense</td>
                                            <td style={{background: '#f58c96'}}
                                                className={'amount'}>{overAllReport.totalExpense}</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}>Current Balance</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}
                                                className={'amount'}>{overAllReport.current_balance}</td>
                                        </tr>
                                        <tr>
                                            <td style={{background: '#5bd99e'}} className={'sl_class'}>2</td>
                                            <td style={{background: '#5bd99e'}}>Income</td>
                                            <td style={{background: '#5bd99e'}}
                                                className={'amount'}>{overAllReport.totalIncome}</td>
                                            <td style={{background: '#f58c96'}} className={'sl_class'}>2</td>
                                            <td style={{background: '#f58c96'}}>Lend to Others</td>
                                            <td style={{background: '#f58c96'}}
                                                className={'amount'}>{overAllReport.lends}</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}>Account Receivable</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}
                                                className={'amount'}>{overAllReport.account_receivable}</td>
                                        </tr>
                                        <tr>
                                            <td style={{background: '#5bd99e'}} className={'sl_class'}>3</td>
                                            <td style={{background: '#5bd99e'}}>Refunded Amount</td>
                                            <td style={{background: '#5bd99e'}}
                                                className={'amount'}>{overAllReport.refunded_amount}</td>
                                            <td style={{background: '#f58c96'}} colSpan={3} rowSpan={2}></td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}>Account Liability</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={2}
                                                className={'amount'}>{overAllReport.borrow}</td>
                                        </tr>
                                        <tr>
                                            <td style={{background: '#5bd99e'}} className={'sl_class'}>4</td>
                                            <td style={{background: '#5bd99e'}}>Loan</td>
                                            <td style={{background: '#5bd99e'}}
                                                className={'amount'}>{overAllReport.borrow}</td>
                                            <td style={{background: '#d8f1f3'}} colSpan={4} rowSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td style={{background: '#d8f1f3'}}
                                                className={'table_total bg-success text-white'} colSpan={2}><b>Total</b>
                                            </td>
                                            <td style={{background: '#d8f1f3'}}
                                                className={'amount bg-success text-white'}>
                                                <b>{overAllReport.total_cash_in}</b></td>
                                            <td style={{background: '#dc3545', color: '#ffffff'}}
                                                className={'table_total'} colSpan={2}><b>Total</b></td>
                                            <td style={{background: '#dc3545', color: '#ffffff'}} className={'amount'}>
                                                <b>{overAllReport.total_cash_out}</b></td>
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

