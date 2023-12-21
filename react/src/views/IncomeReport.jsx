import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";

export default function IncomeReport() {
    const [loading, setLoading] = useState(false);
    const [incomeReport, setIncomeReport] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [totalIncome,setTotalIncome]=useState(parseFloat(0).toFixed(2))


    const {applicationSettings} = useContext(SettingsContext);
    let {
        default_currency
    } = applicationSettings;

    if (default_currency === undefined){
        default_currency = 'AED ';
    }

    useEffect(() => {
        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
                // if(data?.categories.length>0){
                //     setSelectedCategoryId(data?.categories[0].id)
                // }
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
                setIncomeReport(data.incomes);
                setTotalIncome(data.totalIncome);
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
    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedCategoryId('');
        getIncomeReport();
    };
    return (
        <>
         <MainLoader loaderVisible={loading} />
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Income Report</h1>
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="row">
                    <form onSubmit={handleIncomeFilterSubmit}>
                        <div className="col-4">
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
                                        <option defaultValue>Filter by income category</option>
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
                        <div className="col-2 mt-4">
                            <button className={'btn-add right mt-2'} type="submit">Filter</button>
                            <button className="btn btn-warning ml-2" onClick={resetFilterParameter}>Reset</button>
                        </div>
                    </form>
                </div>

                <br/><br/>
                <div className="row">
                    <div className="table-responsive-sm">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Income Date</th>
                                <th>Income Description</th>
                                <th>Income Category</th>
                                <th>Income Amount</th>
                            </tr>
                            </thead>
                            {loading && (
                                <tbody>
                                <tr className={'text-center'}>
                                    <td colSpan={4} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                                </tbody>
                            )}
                            {!loading && (
                                <tbody>
                                {incomeReport.length===0?(
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            Nothing found !
                                        </td>
                                    </tr>
                                ):(
                                    incomeReport.map(income => (
                                        <tr key={income.id} className={'text-center'}>
                                            <td>{income.date}</td>
                                            <td>{income.description}</td>
                                            <td>{income.category_name}</td>
                                            <td className={'text-end'}>{default_currency + ' ' + + income.amount}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            )}

                            <tfoot>
                            <tr>
                                <td className={'text-center fw-bold'} colSpan={3}>Total Income</td>
                                <td className={'text-end fw-bold'}>{default_currency + ' ' + + parseFloat(totalIncome).toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </WizCard>
        </>
    );
}
