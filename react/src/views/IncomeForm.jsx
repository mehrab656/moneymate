import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard";

export default function IncomeForm() {

    let {id} = useParams();

    const [income, setIncome] = useState({
        id: null,
        user_id: null,
        account_id: '', // Set default value to an empty string
        amount: '', // Set default value to an empty string
        category_id: null,
        description: '',
        reference: '',
        income_date: null,
        note: '',
        attachment: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const {setNotification} = useStateContext();
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                //console.log(data);
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.log('Error fetching bank accounts:', error)
            });


        axiosClient.get('/income-categories')
            .then(({data}) => {
                setIncomeCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading income categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, [setIncomeCategories, setBankAccounts]);


    const handleCategoryChange = (event) => {
        setSelectedCategoryId(event.target.value);
    };


    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/income/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setSelectedCategoryId(data.category_id);
                    setSelectedAccountId(data.account_id);
                    setIncome((prevIncome) => ({
                        ...prevIncome,
                        ...data,
                        income_date: data.income_date || '', // Set to empty string if the value is null or undefined
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
            axiosClient.get(`/income/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setIncome(data);
                })
                .catch(() => {
                    setLoading(false)
                })
        }
    }, [id]);


    const incomeSubmit = (event) => {
        event.preventDefault();

        if (income.id) {

            const {amount, description, reference, income_date, note, attachment} = income;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('category_id', selectedCategoryId);
            formData.append('description', description);
            formData.append('note', note);
            formData.append('reference', reference);
            formData.append('income_date', income_date);
            formData.append('attachment', attachment);

            axiosClient.post(`/income/${income.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(({data}) => {
                setNotification('Income data has been updated')
                navigate('/incomes');
            })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            const {amount, description, reference, income_date, note, attachment} = income;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('category_id', selectedCategoryId);
            formData.append('description', description);
            formData.append('note', note);
            formData.append('reference', reference);
            formData.append('income_date', income_date);
            formData.append('attachment', attachment);

            axiosClient.post('/income/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(({data}) => {
                    setNotification('Income has been added.');
                    navigate('/incomes');
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
        setIncome((prevIncome) => {
            return {...prevIncome, attachment: file};
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                {income.id && <h1 className="title-text mb-0">Update Income : {income.description}</h1>}
                {!income.id && <h1 className="title-text mb-0">Add New Income</h1>}
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}

                {!loading && (
                    <form onSubmit={incomeSubmit}>
                        <div className="row">
                            <div className="col-md-6">
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
                                            setIncome({...income, category_id: parseInt(value)});
                                        }}>
                                        <option defaultValue>Select an income category</option>
                                        {incomeCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="error-message mt-2">{errors.category_id[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="income_amount">Amount</label>
                                    <input className="custom-form-control" type="number" step="any" value={income.amount || ""}
                                           onChange={ev => setIncome({...income, amount: ev.target.value})}
                                           placeholder="Amount"/>
                                    {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="income_description">Description</label>
                                    <input className="custom-form-control"
                                           value={income.description !== 'null' ? income.description : ''}
                                           onChange={ev => setIncome({...income, description: ev.target.value})}
                                           placeholder="Description"/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="income_reference">Reference</label>
                                    <input className="custom-form-control" type="text" value={income.reference}
                                           placeholder="Income Reference"
                                           onChange={(e) => setIncome({...income, reference: e.target.value})}/>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="bank_account">Select Bank Account</label>
                                    <select className="custom-form-control"
                                            value={selectedAccountId}
                                            id="bank-account"
                                            name="bank-account"
                                            onChange={(event) => {
                                                const value = event.target.value || '';
                                                setSelectedAccountId(value);
                                                setIncome({...income, account_id: parseInt(value)});
                                            }}>
                                        <option defaultValue>Select a bank account</option>
                                        {bankAccounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.account_id && <p className="error-message mt-2">{errors.account_id[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="income_date">Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={income.income_date ? new Date(income.income_date) : null}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !income.income_date ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setIncome({
                                                ...income,
                                                income_date: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Income Date"
                                    />
                                    {errors.income_date && <p className="error-message mt-2">{errors.income_date[0]}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="note">Note</label>
                                    <input className="custom-form-control" value={income.note !== 'null' ? income.note : ''}
                                           onChange={ev => setIncome({...income, note: ev.target.value})}
                                           placeholder="Additional Note"/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="account_name">Add Attachment</label>
                                    <input className="custom-form-control" type="file" onChange={handleFileInputChange}
                                           placeholder="Attachment"/>
                                </div>
                            </div>
                        </div>








                        <button className={income.id ? "btn btn-info" : "custom-btn btn-add"}>
                            {income.id ? "Update Income Record" : "Add New Income"}
                        </button>

                    </form>
                )}
            </WizCard>

        </>
    )
}
