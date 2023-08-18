import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";

export default function ExpenseReport() {
    const [loading, setLoading] = useState(false);
    const [expenseReport, setExpenseReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const {applicationSettings} = useContext(SettingsContext);
    const {
        default_currency
    } = applicationSettings;

    // set default date(today)
     useEffect(()=>{
        if(startDate ===null){
            setStartDate(new Date())
         }
     },[startDate])
    

    const getIncomeReport = () => {
        setLoading(true);
        axiosClient
            .get("/report/expense", {
                params: {start_date: startDate, end_date: endDate},
            })
            .then(({data}) => {
                //console.log('Loading expense data', data.data);
                setExpenseReport(data.data);
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Expenses Report";
        getIncomeReport();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        getIncomeReport();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Expense Report</h1>
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
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

                <br/><br/>
                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Expense Category</th>
                                <th>Expense Amount</th>
                                <th>Expense Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr className={'text-center'}>
                                    <td colSpan={3} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                expenseReport.map(expense => (
                                    <tr key={expense.id} className={'text-center'}>
                                        <td>{expense.category_name}</td>
                                        <td>{default_currency + expense.amount}</td>
                                        <td>{expense.expense_date}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </WizCard>
        </>
    );
}
