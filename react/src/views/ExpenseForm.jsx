import {useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard";
import {SettingsContext} from "../contexts/SettingsContext.jsx";

import {
    TextField,
    Autocomplete,
  } from "@mui/material";

export default function ExpenseForm() {

    let {id} = useParams();

    const [expense, setExpense] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        refundable_amount: 0, // Set default value to an empty string
        category_id: null,
        description: '',
        reference: '',
        expense_date: '',
        note: '',
        attachment: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectUserID, setUsers] = useState([]);
    const {setNotification} = useStateContext();
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const navigate = useNavigate();
    const [insufficientBalanceForCategory, setInsufficientBalanceForCategory] = useState(null);
    const {applicationSettings, userRole} = useContext(SettingsContext);

    const [categoryValue, setCategoryValue] = useState(null);
    const [storeCategoryValue, setStoreCategoryValue] = useState(null);




    const {
        num_data_per_page,
        default_currency,
        last_expense_cat_id,
        last_expense_account_id,
        last_expense_date,
    } = applicationSettings;

    useEffect(() => {
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                //by default select the last bank account used for expense purpose
                // if (data.data.length > 0) {
                //     setSelectedAccountId(data.data[0].id)
                // }
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.log('Error fetching bank accounts:', error)
            });

        axiosClient.get('/expense-categories')
            .then(({data}) => {
                if (data.categories.length > 0) {
                    setSelectedCategoryId(data.categories[0].id)
                }
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
                // handle error, e.g., show an error message to the user
            });

        axiosClient.get('/get-all-users')
            .then(({data}) => {
                if (data.data.length > 0) {
                    setSelectedUserId(data.data[0].id)
                }
                setUsers(data.data);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setExpenseCategories, setBankAccounts, setUsers]);

    //set default category value
    useEffect(()=>{
        if(expenseCategories && expenseCategories.length>0 && !id){
            setCategoryValue(expenseCategories[0])
        }
        if(storeCategoryValue !==null && id){
            setCategoryValue(storeCategoryValue)
        }
    },[expenseCategories,storeCategoryValue])




    const handleCategoryChange = (event) => {
        setSelectedCategoryId(event.target.value);
    };


    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/expense/${id}`)
                .then(({data}) => {
                    setSelectedCategoryId(data.category_id);
                    setSelectedAccountId(data.account_id);
                    setSelectedUserId(data.user_id);
                    if(expenseCategories.length>0){
                        expenseCategories.forEach(element => {
                            if(element.id===data.category_id){
                                setStoreCategoryValue(element)
                            }
                        });
                    }

                    setExpense((prevExpense) => ({
                        ...prevExpense,
                        ...data,
                        expense_date: data.expense_date || '', // Set to empty string if the value is null or undefined
                    }));
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id,expenseCategories]);


    useEffect(() => {
        if (id) {
            setLoading(true)
            axiosClient.get(`/expense/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setExpense(data);
                })
                .catch(() => {
                    setLoading(false)
                })
        }
    }, [id]);

    // set some default data
    useEffect(() => {

        // select default date
        if (expense?.expense_date === '') {
            // if (last_expense_date) {
            //     setExpense({
            //         ...expense,
            //         expense_date: new Date(last_expense_date).toISOString().split('T')[0]
            //     });
            // } else {
            //     setExpense({
            //         ...expense,
            //         expense_date: new Date().toISOString().split('T')[0]
            //     });
            // }

            setExpense({
                ...expense,
                expense_date: new Date().toISOString().split('T')[0]
            });
        }

        // //select default category
        // if (last_expense_cat_id) {
        //     setSelectedCategoryId(last_expense_cat_id)
        // }
        //
        // //set last used bank account
        // if (last_expense_account_id) {
        //     setSelectedAccountId(last_expense_account_id)
        // }

    }, [expense?.expense_date, last_expense_cat_id, last_expense_account_id])

    const expenseSubmit = (event, stay) => {
        event.preventDefault();

        if (expense.id) {

            const {amount, refundable_amount, description, reference, expense_date, note, attachment} = expense;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('refundable_amount', refundable_amount);
            formData.append('category_id', categoryValue.id);
            formData.append('user_id', selectedUserId);
            formData.append('description', description);
            formData.append('note', note);
            formData.append('reference', reference);
            formData.append('expense_date', expense_date);
            formData.append('attachment', attachment);

            axiosClient.post(`/expense/${expense.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(() => {
                setNotification('expense data has been updated')
                if(stay ===true){
                    window.location.reload()
                }else{
                    navigate('/expenses');
                }
               
            })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {

            const {amount, refundable_amount, description, reference, expense_date, note, attachment} = expense;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('refundable_amount', refundable_amount);
            formData.append('category_id', categoryValue.id);
            formData.append('user_id', selectedUserId);
            formData.append('description', description);
            formData.append('note', note);
            formData.append('reference', reference);
            formData.append('expense_date', expense_date);
            formData.append('attachment', attachment);

            axiosClient.post('/expense/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(({data}) => {
                    if (data.action_status === 'insufficient_balance') {
                        setInsufficientBalanceForCategory(data.message);
                    } else {
                        setNotification('expense has been added.');
                        if(stay ===true){
                            window.location.reload()
                        }else{
                            navigate('/expenses');
                        }
                    }


                })
                .catch((error) => {
                    const response = error.response;
                    setErrors(response.data.errors);
                });
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setExpense((prevExpense) => {
            return {...prevExpense, attachment: file};
        });
    };




    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                {expense.id && <h1 className="title-text mb-0">Update expense : {expense.description}</h1>}
                {!expense.id && <h1 className="title-text mb-0">Add New expense</h1>}
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}

                {!loading && (
                    <form >
                        {insufficientBalanceForCategory && (
                            <div className="text-danger mt-2 mb-3">{insufficientBalanceForCategory}</div>
                        )}

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label"
                                           htmlFor="expense_description">Description</label>
                                    <textarea
                                        style={{height: 130}}
                                        className="form-control"
                                        id="expense_description"
                                        rows="3"
                                        value={expense.description !== 'null' ? expense.description : ''}
                                        onChange={ev => setExpense({...expense, description: ev.target.value})}
                                        placeholder="Description"/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_amount">Amount</label>
                                    <input className="custom-form-control" type="number" step="any"
                                           value={expense.amount || ""}
                                           onChange={ev => setExpense({...expense, amount: ev.target.value})}
                                           placeholder="Amount"/>
                                    {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="refundable_amount">Refundable
                                        Amount</label>
                                    <input className="custom-form-control"
                                           type="number"
                                           step="any"
                                           value={expense.refundable_amount}
                                           onChange={ev => setExpense({...expense, refundable_amount: ev.target.value})}
                                           placeholder="Refundable Amount"/>
                                    {errors.refundable_amount &&
                                        <p className="error-message mt-2">{errors.refundable_amount[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="note">Note</label>
                                    <textarea
                                        style={{height: 130}}
                                        className="form-control"
                                        id="expense_note"
                                        rows="3"
                                        value={expense.note !== 'null' ? expense.note : ''}
                                        onChange={ev => setExpense({...expense, note: ev.target.value})}
                                        placeholder="Additional Note"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_date">Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={expense.expense_date ? new Date(expense.expense_date) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !expense.expense_date ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setExpense({
                                                ...expense,
                                                expense_date: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Expense Date"
                                    />
                                    {errors.start_date && <p className="error-message mt-2">{errors.start_date[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_user">Expense By</label>
                                    <select
                                        className="custom-form-control"
                                        value={selectedUserId}
                                        id="expense-by"
                                        name="expense-by"
                                        onChange={(event) => {
                                            const value = event.target.value || '';
                                            setSelectedUserId(value);
                                            setExpense({...expense, user_id: parseInt(value)});
                                        }}>
                                        <option defaultValue>Expense By</option>
                                        {selectUserID.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="error-message mt-2">{errors.user_id[0]}</p>}
                                </div>
                                <div className="">
                                    <Autocomplete
                                        // value={expenseCategories[0]}
                                        options={expenseCategories}
                                        getOptionLabel={(option) => option.name}
                                        id="parentCategory"
                                        value={categoryValue}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                            setCategoryValue(newValue);
                                            }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label='Expense Category'
                                        margin="normal"
                                        placeholder="Expense Category"
                                        />
                                    )}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="bank_account">Bank Account</label>
                                    <select
                                        className="custom-form-control"
                                        value={selectedAccountId}
                                        id="bank-account"
                                        name="bank-account"
                                        onChange={(event) => {
                                            const value = event.target.value || '';
                                            setSelectedAccountId(value);
                                            setExpense({...expense, account_id: parseInt(value)});
                                        }}>
                                        <option defaultValue>Bank account</option>
                                        {bankAccounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.bank_name} - {account.account_number} - Balance
                                                ({account.balance})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.account_id && <p className="error-message mt-2">{errors.account_id[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_reference">Reference</label>
                                    <input className="custom-form-control" type="text" value={expense.reference}
                                           placeholder="Expense Reference"
                                           onChange={(e) => setExpense({...expense, reference: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="account_name">Add Attachment</label>
                                    <input className="custom-form-control" type="file" onChange={handleFileInputChange}
                                           placeholder="Attachment"/>
                                </div>
                            </div>
                        </div>

                        <button onClick={(e)=>expenseSubmit(e,true)} className={expense.id ? "btn btn-warning" : "custom-btn btn-add"}>
                            {expense.id ? "Update Expense Record" : "Add New Expense"}
                        </button>
                        {expense.id && <button onClick={(e)=>expenseSubmit(e,false)} className={"custom-btn btn-add ml-3"}>
                            Update Expense & Exist
                        </button>}
                        {!expense.id && <button onClick={(e)=>expenseSubmit(e,false)} className={"custom-btn btn-add ml-3"}>
                            Add New Expense & Exist
                        </button>}
                        

                    </form>
                )}
            </WizCard>

        </>
    )
}
