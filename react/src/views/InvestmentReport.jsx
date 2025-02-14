import React, {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import SummeryCard from "../components/SummeryCard";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import DatePicker from "react-datepicker";
import InvestmentReportChart from "../components/InvestmentReportChart.jsx";
import MainLoader from "../components/MainLoader.jsx";
import ReactToPrint from "react-to-print";
import { Box, Button } from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faFilter} from "@fortawesome/free-solid-svg-icons";

export default function InvestmentReport() {
    const componentRef  = useRef()

    const [getTotalInvestments, setTotalInvestments] = useState(0);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const {
        default_currency,
    } = applicationSettings;

    const getInvestmentReports= () =>{
        setLoading(true);
        try {
            axiosClient.get('/report/investment',{
                params: {start_date: startDate, end_date: endDate},
            }).then(({data}) => {
                setTotalInvestments(data.totalInvestment);
                setInvestments(data.investments);
                setLoading(false);
            })
        } catch (error) {
            console.warn(error);
        }
    };


    useEffect(() => {
        document.title = "Investment Reports";
        getInvestmentReports();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        getInvestmentReports();
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <div className={"row mb-2"}>
                <div className={"col-md-4"}>
                    <span className={"page-title-header"}>Investments</span>
                </div>
                <div className={"col-md-8 text-end"}>
                    <button className={'btn btn-secondary btn-sm mr-2'}>
                        <FontAwesomeIcon icon={faDownload}/>{' Download CSV'}
                    </button>
                    <button className={'btn-sm btn-add'} >
                        <FontAwesomeIcon icon={faFilter}/>{' Add Expense'}
                    </button>
                </div>
            </div>

            <div className="col-md-8">
                <WizCard className="animated fadeInDown">
                    <div className="row">
                        <form onSubmit={handleSubmit}>
                            <div className="col-6">
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
                            <div className="col-6">
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
                            <div className="col-12">
                                <button className={'btn-add right'} type="submit">Filter</button>
                            </div>
                        </form>
                    </div>
                    <div className="row" ref={componentRef}>
                        <div className="col-12">
                            <h1 className="title-text text-center">Total Investment Reports</h1>
                            <table className="table table-bordered custom-table">
                                <thead>
                                <tr className={'text-center'}>
                                    <th>Investor Name</th>
                                    <th>Invested Amount</th>
                                </tr>
                                </thead>
                                {loading && (
                                    <tbody>
                                    <tr className={'text-center'}>
                                        <td colSpan={6} className="text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                    </tbody>
                                )}
                                {!loading && (
                                    <tbody>
                                    {investments.map(investment => (
                                        <tr key={investment.investor_id} className={'text-center'}>
                                            <td>{investment.username}</td>
                                            <td>{default_currency + ' ' + investment.amount}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </WizCard>
            </div>
            <div className="col-md-4">
                <div className="row">
                    <div className="mb-4">
                        <SummeryCard value={getTotalInvestments} summary="Total Investments" icon={<AttachMoneyIcon/>}
                                     iconClassName="icon-success" currency={default_currency}/>

                    </div>

                    <div>
                        <WizCard className="animated fadeInDown">
                            <InvestmentReportChart totalInvestment={getTotalInvestments}
                                                   investors={investments}
                                                   checkLoading={loading}
                                                   title="Investment chart"/>
                        </WizCard>

                        <Box sx={{mt: 1}} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                            <ReactToPrint
                                trigger={() => <Button sx={{ml: 1}} variant="outlined">Print</Button>}
                                content={() => componentRef.current}
                            />
                        </Box>
                    </div>
                </div>
            </div>
        </>
    )
}
