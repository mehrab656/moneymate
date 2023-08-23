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

    const [expenseCategories, setExpenseCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [totalExpense,setTotalExpense] = useState(parseFloat(0).toFixed(2));
    
    const {applicationSettings} = useContext(SettingsContext);
    let {
        default_currency
    } = applicationSettings;

    if (default_currency===undefined){
        default_currency = 'AED ';
    }

    useEffect(() => {
        axiosClient.get('/expense-categories')
            .then(({data}) => {
                setExpenseCategories(data.categories);
                //no need to select the first one. it's confusing.
                // if(data?.categories.length>0){
                //     setSelectedCategoryId(data?.categories[0].id)
                // }
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setExpenseCategories]);


    

    const getExpenseReport = () => {
        setLoading(true);
        setTotalExpense(0);
        axiosClient
            .get("/report/expense", {
                params: {start_date: startDate, end_date: endDate, cat_id:selectedCategoryId},
            })
            .then(({data}) => {
                setExpenseReport(data.expenses);
                setTotalExpense(data.totalExpense);
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Expenses Report";
        getExpenseReport();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        getExpenseReport();
    };
    
    const resetFilterParameter = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedCategoryId('');
        getExpenseReport();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Expense Report</h1>
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                <div className="row">
                    <form onSubmit={handleSubmit}>
                        <div className="col-4">
                            <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_category">Expense Category</label>
                                    <select
                                        className="custom-form-control"
                                        value={selectedCategoryId}
                                        id="expense-category"
                                        name="expense-category"
                                        onChange={(event) => {
                                            const value = event.target.value || '';
                                            setSelectedCategoryId(value);
                                        }}>
                                        <option defaultValue>Filter By Category</option>
                                        {expenseCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                        </div>
                        <div className="col-3">
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
                    <div className="table-responsive">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Expense Date</th>
                                <th>Expense Category</th>
                                <th>Expense Amount</th>
                            </tr>
                            </thead>
                            {loading && (
                                <tbody>
                                <tr className={'text-center'}>
                                    <td colSpan={3} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                                </tbody>
                            )}
                            {!loading && (
                                <tbody>
                                {expenseReport.length===0?(
                                    <tr>
                                        <td colSpan={3} className="text-center">
                                            Nothing found !
                                        </td>
                                    </tr>
                                ):(
                                    expenseReport.map(expense => (
                                        <tr key={expense.id} className={'text-center'}>
                                            <td>{expense.expense_date}</td>
                                            <td>{expense.category_name}</td>
                                            <td className={'text-end'}>{default_currency + expense.amount}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            )}

                            <tfoot>
                            <tr>
                                <td className={'text-center fw-bold'} colSpan={2}>Total Expense</td>
                                <td className={'text-end fw-bold'}>{default_currency + parseFloat(totalExpense).toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </WizCard>
        </>
    );
}
