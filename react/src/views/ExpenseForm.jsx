import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard";

export default function ExpenseForm() {

    let {id} = useParams();

    const [expense, setExpense] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        refundable_amount: '', // Set default value to an empty string
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

    useEffect(() => {
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                //  console.log(data);
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.log('Error fetching bank accounts:', error)
            });

        axiosClient.get('/expense-categories')
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
                // handle error, e.g., show an error message to the user
            });

        axiosClient.get('/get-all-users')
            .then(({data}) => {
                setUsers(data.data);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setExpenseCategories, setBankAccounts, setUsers]);


    const handleCategoryChange = (event) => {
        setSelectedCategoryId(event.target.value);
    };


    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/expense/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setSelectedCategoryId(data.category_id);
                    setSelectedAccountId(data.account_id);
                    setSelectedUserId(data.user_id);

                    setExpense((prevExpense) => ({
                        ...prevExpense,
                        ...data,
                        expense_date: data.expense_date || '', // Set to empty string if the value is null or undefined
                    }));
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id]);


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

 // set default date(today)
     useEffect(()=>{
         if(expense?.expense_date ===''){
             setExpense({
                ...expense,
                expense_date: new Date().toISOString().split('T')[0]
               });
             }
        },[expense?.expense_date])


    const expenseSubmit = (event) => {
        event.preventDefault();

        if (expense.id) {

            const {amount, refundable_amount, description, reference, expense_date, note, attachment} = expense;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('refundable_amount', refundable_amount);
            formData.append('category_id', selectedCategoryId);
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
                navigate('/expenses');
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
            formData.append('category_id', selectedCategoryId);
            formData.append('user_id', selectedUserId);
            formData.append('description', description);
            formData.append('note', note);
            formData.append('reference', reference);
            formData.append('expense_date', expense_date);
            formData.append('attachment', attachment);

            console.log('adasa', expense_date)

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
                        navigate('/expenses');
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
        console.log(file);
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
                    <form onSubmit={expenseSubmit}>
                        {insufficientBalanceForCategory && (
                            <div className="text-danger mt-2 mb-3">{insufficientBalanceForCategory}</div>
                        )}

                        <div className="row">
                            <div className="col-md-6">
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
                                            setExpense({...expense, category_id: parseInt(value)});
                                        }}>
                                        <option defaultValue>Expense category</option>
                                        {expenseCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="error-message mt-2">{errors.category_id[0]}</p>}
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
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_amount">Amount</label>
                                    <input className="custom-form-control" type="number" step="any" value={expense.amount || ""}
                                           onChange={ev => setExpense({...expense, amount: ev.target.value})}
                                           placeholder="Amount"/>
                                    {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_date">Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={expense.expense_date ? new Date(expense.expense_date) : new Date() }
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
                                    <label className="custom-form-label" htmlFor="expense_description">Description</label>
                                    <input className="custom-form-control"
                                           value={expense.description !== 'null' ? expense.description : ''}
                                           onChange={ev => setExpense({...expense, description: ev.target.value})}
                                           placeholder="Description"/>
                                </div>
                            </div>

                            <div className="col-md-6">
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
                                                {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.account_id && <p className="error-message mt-2">{errors.account_id[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="refundable_amount">Refundable Amount</label>
                                    <input className="custom-form-control"
                                           type="number"
                                           step="any"
                                           value={expense.refundable_amount}
                                           onChange={ev => setExpense({...expense, refundable_amount: ev.target.value})}
                                           placeholder="Refundable Amount"/>
                                    {errors.refundable_amount && <p className="error-message mt-2">{errors.refundable_amount[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="expense_reference">Reference</label>
                                    <input className="custom-form-control" type="text" value={expense.reference}
                                           placeholder="Expense Reference"
                                           onChange={(e) => setExpense({...expense, reference: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="note">Note</label>
                                    <input className="custom-form-control"
                                           value={expense.note !== 'null' ? expense.note : ''}
                                           onChange={ev => setExpense({...expense, note: ev.target.value})}
                                           placeholder="Additional Note"/>
                                </div>

                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label className="custom-form-label" htmlFor="account_name">Add Attachment</label>
                                <input className="custom-form-control" type="file" onChange={handleFileInputChange}
                                       placeholder="Attachment"/>
                            </div>
                        </div>

                        <button className={expense.id ? "btn btn-warning" : "custom-btn btn-add"}>
                            {expense.id ? "Update Expense Record" : "Add New Expense"}
                        </button>

                    </form>
                )}
            </WizCard>

        </>
    )
}
