import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";

export default function IncomeReport() {
    const [loading, setLoading] = useState(false);
    const [incomeReport, setIncomeReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');


    const {applicationSettings} = useContext(SettingsContext);
    const {
        default_currency
    } = applicationSettings;


    useEffect(() => {
        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
                if(data?.categories.length>0){
                    setSelectedCategoryId(data?.categories[0].id)
                }
            })
            .catch(error => {
                console.error('Error loading income categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setIncomeCategories]);

    const getIncomeReport = () => {
        setLoading(true);
        axiosClient
            .get("/report/income", {
                params: {start_date: startDate, end_date: endDate, cat_id:selectedCategoryId},
            })
            .then(({data}) => {
                //console.log('Loading income data', data.data);
                setIncomeReport(data.data);
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Income Report";
        getIncomeReport();
    }, []);

    const handleIncomeFilterSubmit = (e) => {
        e.preventDefault();
        getIncomeReport();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Income Report</h1>
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="row">
                    <form onSubmit={handleIncomeFilterSubmit}>
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
                                        <option defaultValue>Select an income category</option>
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
                        </div>
                    </form>
                </div>

                <br/><br/>
                <div className="row">
                    <div className="table-responsive">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Income Category</th>
                                <th>Income Amount</th>
                                <th>Income Date</th>
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
                                incomeReport.map(income => (
                                    <tr key={income.id} className={'text-center'}>
                                        <td>{income.category_name}</td>
                                        <td>{default_currency + income.amount}</td>
                                        <td>{income.income_date}</td>
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
