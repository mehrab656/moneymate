import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import MonthlyExpenseChart from "../components/MonthlyExpenseChart.jsx";
import SummeryCard from "../components/SummeryCard";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import DatePicker from "react-datepicker";

export default function InvestmentReport() {

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
            // console.log(error);
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
                    <div className="row">
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
                                            <td>{investment.name}</td>
                                            <td>{default_currency +' ' + investment.amount}</td>
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
                        <SummeryCard value={getTotalInvestments} summary="Total Investments" icon={<AttachMoneyIcon/>} iconClassName="icon-success" currency={default_currency}/>
                    </div>

                    <div>
                        <WizCard className="animated fadeInDown">
                            <MonthlyExpenseChart title="Investment chart"/>
                        </WizCard>
                    </div>
                </div>
            </div>
        </>
    )
}
