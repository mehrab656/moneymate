import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../../../axios-client.js";
import WizCard from "../../../components/WizCard.jsx";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import OverallReportTable from "./OverallReportTable.jsx";
import ReactToPrint from 'react-to-print'
import { Button } from "@mui/material";
import { Row, Col, InputGroup, Form } from "react-bootstrap";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles, createDateInputStyle } from "../../../styles/formThemeStyles.js";
import Select from "react-select";


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
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedFilterValue, setFilterValue] = useState('');
    const {
        default_currency,
    } = applicationSettings;
    const theme = useTheme();
    const inputGroupTextStyle = createInputGroupTextStyle(theme);
    const inputFontSize = "0.875rem";
    const selectStyles = createSelectStyles(theme, inputFontSize);
    const inputStyle = createDateInputStyle(theme, inputFontSize);
    const isDark = theme.palette.mode === "dark";
    const headerDarkStyle = { backgroundColor: theme.palette.primary.main, color: theme.palette.common.white };
    const headerInvestIncomeStyle = isDark ? headerDarkStyle : { background: "#d8f1f3" };
    const headerExpenseStyle = isDark ? headerDarkStyle : { background: "#ffdd78" };
    const filterOptions = [
        { value: '', label: 'Filter by Dates and Months' },
        { value: '7', label: 'Last 7 Days' },
        { value: '15', label: 'Last 15 Days' },
        { value: '30', label: 'Last 1 Month' },
        { value: '90', label: 'Last 3 Month' },
        { value: '180', label: 'Last 6 Month' },
        { value: '360', label: 'Last 1 Year' },
    ];
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

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
        setStartDate("");
        setEndDate("");
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
            setStartDate(formatDate(startDate));
            setEndDate(formatDate(new Date()));
        }
        else {
            setStartDate("");
            setEndDate("");
        }
    }
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <div className={'report-page'}>
                <div className={'report-header'}>
                    <span className={'page-title-header'}>Overall Reports</span>
                    <div className={'d-flex align-items-center gap-2'}>
                        <ReactToPrint
                            trigger={() => <Button sx={{ml:1}} variant="outlined">Print</Button>}
                            content={()=> componentRef.current}
                        />
                    </div>
                </div>
            </div>
            <WizCard className="animated fadeInDown">
                <Row className={"mb-3"}>
                    <form onSubmit={handleSubmit} className="w-100">
                        <Row className="g-2">
                            <Col xs={12} md={4}>
                                <InputGroup className="mb-3" size="sm">
                                    <InputGroup.Text id="overall_filter_label" style={inputGroupTextStyle}>
                                        Filter
                                    </InputGroup.Text>
                                    <div className="flex-grow-1" aria-describedby="overall_filter_label">
                                        <Select
                                            classNamePrefix="select"
                                            styles={selectStyles}
                                            isSearchable={false}
                                            value={filterOptions.find(opt => opt.value === (selectedFilterValue ?? ''))}
                                            onChange={(opt) => {
                                                const value = opt?.value || '';
                                                setFilterValue(value);
                                                setFilterDates(value);
                                            }}
                                            options={filterOptions}
                                        />
                                    </div>
                                </InputGroup>
                            </Col>
                            <Col xs={12} md={3}>
                                <InputGroup className="mb-3" size="sm">
                                    <InputGroup.Text id="start_date_label" style={inputGroupTextStyle}>
                                        Start Date
                                    </InputGroup.Text>
                                    <Form.Control
                                        aria-describedby="start_date_label"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={inputStyle}
                                    />
                                </InputGroup>
                            </Col>
                            <Col xs={12} md={3}>
                                <InputGroup className="mb-3" size="sm">
                                    <InputGroup.Text id="end_date_label" style={inputGroupTextStyle}>
                                        End Date
                                    </InputGroup.Text>
                                    <Form.Control
                                        aria-describedby="end_date_label"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={inputStyle}
                                    />
                                </InputGroup>
                            </Col>
                            <Col xs={12} md={2}>
                                <button className="btn btn-warning" type="button" onClick={resetFilterParameter}>Reset</button>
                            </Col>
                        </Row>
                    </form>
                </Row>
                <div className="row"  ref={componentRef}>
                    <div className="col-12">
                        <div className="table-scroll">
                                <table className="table table-bordered custom-table">
                                    <thead>
                                    <tr className={'text-center'}>
                                        <th colSpan={3} className={'bg-info'}><b>Investment</b></th>
                                        <th colSpan={3} className={'bg-warning'}><b>Expense</b></th>
                                        <th colSpan={3} className={'bg-info'}><b>Income</b></th>
                                    </tr>
                                    <tr>
                                        <th style={headerInvestIncomeStyle}>S/L</th>
                                        <th style={headerInvestIncomeStyle}>Investor</th>
                                        <th style={headerInvestIncomeStyle}>Amount</th>
                                        <th style={headerExpenseStyle}>S/L</th>
                                        <th style={headerExpenseStyle}>Sector</th>
                                        <th style={headerExpenseStyle}>Amount</th>
                                        <th style={headerInvestIncomeStyle}>S/L</th>
                                        <th style={headerInvestIncomeStyle}>Sector</th>
                                        <th style={headerInvestIncomeStyle}>Amount</th>
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
                            <div className="table-scroll">
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
            </WizCard>
        </>
    )
}
