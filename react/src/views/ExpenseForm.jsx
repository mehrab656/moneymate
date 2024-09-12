import {useNavigate, useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard";
import {
    TextField,
    Autocomplete, Grid,
} from "@mui/material";

import {makeStyles} from '@mui/styles';
import MainLoader from "../components/MainLoader.jsx";
import {notification} from "../components/ToastNotification.jsx";

const useStyles = makeStyles({
    option: {
        "&:hover": {
            backgroundColor: "#ff7961 !important"
        },
    }
});

const _initialExpense = {
    id: null,
    amount: '', // Set default value to an empty string
    refundable_amount: 0, // Set default value to an empty string
    description: '',
    reference: '',
    date: '',
    note: '',
    attachment: ''
};
export default function ExpenseForm() {
    const classes = useStyles();
    let {id} = useParams();
    const [expense, setExpense] = useState(_initialExpense);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const navigate = useNavigate();
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        axiosClient.get('/expense-elements')
            .then(({data}) => {
                setUsers(data.users);
                setBankAccounts(data.banks);
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.warn('Error fetching bank accounts:', error)
            });
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/expense/${id}`)
                .then(({data}) => {

                    if (expenseCategories.length > 0) {
                        expenseCategories.forEach(element => {
                            if (element.id === data.category_id) {
                                setSelectedCategory(element)
                            }
                        });
                    }
                    if (bankAccounts.length > 0) {
                        bankAccounts.forEach(element => {
                            if (element.id === data.account_id) {
                                setSelectedBankAccount(element);
                            }
                        });
                    }
                    if (users.length > 0) {
                        users.forEach(element => {
                            if (element.id === data.user_id) {
                                setSelectedUser(element);
                            }
                        });
                    }

                    setExpense((prevExpense) => ({
                        ...prevExpense,
                        ...data,
                        date: data.date || '', // Set to empty string if the value is null or undefined
                    }));
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id, expenseCategories]);


    // set some default data
    useEffect(() => {
        // select default date
        if (expense?.date === '') {
            setExpense({
                ...expense,
                date: new Date().toISOString().split('T')[0]
            });
        }

    }, [expense?.date])

    const expenseSubmit = (event, stay) => {
        event.preventDefault();
        setLoading(true)
        // event.currentTarget.disabled = true;
        const {amount, refundable_amount, description, reference, date, note, attachment} = expense;

        const formData = new FormData();
        formData.append('account_id', selectedBankAccount.id);
        formData.append('amount', amount);
        formData.append('refundable_amount', refundable_amount);
        formData.append('category_id', selectedCategory.id);
        formData.append('user_id', selectedUser.id);
        formData.append('description', description);
        formData.append('note', note);
        formData.append('reference', reference);
        formData.append('date', date);
        formData.append('attachment', attachment);

        const url = expense.id ? `/expense/${expense.id}` : '/expense/add';
        axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(({data}) => {
            notification('success', data?.message, data?.description)
            stay === true ? setExpense(_initialExpense) : navigate('/expenses')
            setLoading(false)
        }).catch(err => {
            if (err.response) {
                const error = err.response.data
                notification('error', error?.message, error.description)
            }
            setLoading(false)
        });
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setExpense((prevExpense) => {
            return {...prevExpense, attachment: file};
        });
    };

    return (
        <>
            <MainLoader loaderVisible={loading}/>
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
                    <form>
                        <div className="row">
                            <div className="col-md-6">
                                <TextField
                                    style={{marginBottom: "20px"}}
                                    fullWidth
                                    label="Description"
                                    variant="outlined"
                                    name="description"
                                    value={expense.description}
                                    onChange={ev => setExpense({...expense, description: ev.target.value})}
                                    focused={true}
                                />
                                <TextField
                                    style={{marginBottom: "20px"}}
                                    fullWidth
                                    label="Amount"
                                    variant="outlined"
                                    name="amount"
                                    value={expense.amount}
                                    onChange={ev => setExpense({...expense, amount: ev.target.value})}
                                    focused={true}
                                />
                                {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                                <TextField
                                    style={{marginBottom: "20px"}}
                                    fullWidth
                                    label="Refundable Amount"
                                    variant="outlined"
                                    name="refundableAmount"
                                    value={expense.refundable_amount}
                                    onChange={ev => setExpense({...expense, refundable_amount: ev.target.value})}
                                    focused={true}
                                />
                                {errors.refundable_amount &&
                                    <p className="error-message mt-2">{errors.refundable_amount[0]}</p>}

                                <TextField
                                    style={{marginBottom: "20px"}}
                                    fullWidth
                                    label="Additional Note"
                                    variant="outlined"
                                    name="note"
                                    value={expense.note}
                                    onChange={ev => setExpense({...expense, note: ev.target.value})}
                                    focused={true}
                                />

                                <TextField
                                    style={{marginBottom: "20px"}}
                                    fullWidth
                                    label="Reference"
                                    variant="outlined"
                                    name="reference"
                                    value={expense.reference}
                                    onChange={ev => setExpense({...expense, reference: ev.target.value})}
                                    focused={true}
                                />

                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="date">Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={expense.date ? new Date(expense.date) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !expense.date ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setExpense({
                                                ...expense,
                                                date: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="dd-MM-yyyy"

                                    />
                                    {errors.start_date && <p className="error-message mt-2">{errors.start_date[0]}</p>}
                                </div>
                                <div className="">
                                    <Autocomplete
                                        classes={{option: classes.option}}
                                        options={users}
                                        getOptionLabel={(option) => option.name + '(' + option.email + ')'}
                                        id="parentCategory"
                                        isOptionEqualToValue={(option, selectedUser) => option.id === selectedUser.id}
                                        value={selectedUser}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedUser(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label='Expense By'
                                                margin="normal"
                                                variant="outlined"
                                                placeholder="Select User"
                                                focused={true}
                                            />
                                        )}
                                    />
                                    {errors.user_id && <p className="error-message mt-2">{errors.user_id[0]}</p>}
                                </div>
                                <div className="">
                                    <Autocomplete
                                        classes={{option: classes.option}}
                                        options={expenseCategories}
                                        getOptionLabel={(option) => option.name}
                                        id="parentCategory"
                                        isOptionEqualToValue={(option, selectedCategory) => option.id === selectedCategory.id}
                                        value={selectedCategory}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedCategory(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label='Expense Category'
                                                margin="normal"
                                                variant="outlined"
                                                placeholder="Expense Category"
                                                focused={true}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Autocomplete
                                        classes={{option: classes.option}}
                                        options={bankAccounts}
                                        getOptionLabel={(option) => (option.bank_name + '-' + (option.account_number) + '-' + option.balance)}
                                        id="parentCategory"
                                        isOptionEqualToValue={(option, selectedBankAccount) => option.id === selectedBankAccount.id}
                                        value={selectedBankAccount}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedBankAccount(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label='Bank Account'
                                                variant="outlined"
                                                margin="normal"
                                                placeholder="Select Bank Account"
                                                focused={true}
                                            />
                                        )}
                                    />

                                    {errors.account_id && <p className="error-message mt-2">{errors.account_id[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="account_name">Add Attachment</label>
                                    <input className="custom-form-control" type="file" onChange={handleFileInputChange}
                                           placeholder="Attachment"/>
                                </div>
                            </div>
                        </div>
                        <div className="text-end">
                            {
                                expense.id &&
                                <button onClick={(e) => expenseSubmit(e, false)}
                                        className={expense.id ? "btn btn-warning" : "custom-btn btn-add"}>
                                    Update
                                </button>
                            }
                            {!expense.id &&
                                <>
                                    <button onClick={(e) => expenseSubmit(e, true)}
                                            className={"custom-btn btn-add ml-3"}>
                                        Save
                                    </button>
                                    <button onClick={(e) => expenseSubmit(e, false)}
                                            className={"custom-btn btn-add ml-3"}>
                                        Save and Exit
                                    </button>
                                </>
                            }
                        </div>
                    </form>
                )}
            </WizCard>
        </>
    )
}


