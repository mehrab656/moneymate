import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard.jsx";

export default function InvestmentForm() {

    const {user, token, setUser, setToken, notification} = useStateContext();

    let {id} = useParams();

    const [investment, setInvestment] = useState({
        id: null,
        amount: '',
        investment_date: '',
        note: '',
    });


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [users, setUsers] = useState([]);
    const {setNotification} = useStateContext();
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const navigate = useNavigate();
    const [insufficientBalanceForCategory, setInsufficientBalanceForCategory] = useState(null);

    useEffect(() => {

        if(user){
            setLoading(true)
            axiosClient.get('/get-all-users')
            .then(({data}) => {
                setUsers(data.data);
                setLoading(false)
                var updatedUser = [];
                if(data?.data.length>0){
                    data.data.forEach(element => {
                        if(element.id !== user.id){
                            updatedUser.push(element)
                        }
                    });
                }
                setUsers(updatedUser)
            })
            .catch(error => {
                setLoading(false)
                console.error('Error loading investment user:', error);
                // handle error, e.g., show an error message to the user
            });
        }

        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                setBankAccounts(data.data);
            })
            .catch(error => {
                // console.log('Error fetching bank accounts:', error)
            });
    }, [setUsers, setBankAccounts]);


    // set default user-> current user
    useEffect(()=>{
        if(user.id){
            setSelectedUserId(user.id)
        }
    },[user])

    // set default bank accout
    useEffect(()=>{
        if(bankAccounts.length>0){
            setSelectedAccountId(bankAccounts[0].id)
        }
    },[bankAccounts])



    // set default date(today)
    useEffect(()=>{
        if(investment?.investment_date ===''){
            setInvestment({
                ...investment,
                investment_date: new Date().toISOString().split('T')[0]
            });
        }
    },[investment?.investment_date])




    useEffect(() => {
        if (id) {
            setLoading(true)
            axiosClient.get(`/investments/${id}`)
                .then(({data}) => {
                    setLoading(false);
                    setInvestment(data);
                })
                .catch(() => {
                    setLoading(false)
                })
        }
    }, [id]);


    const investmentSubmit = (event) => {
        event.preventDefault();

        if (investment.id) {

            const {amount, investment_date, note} = investment;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('user_id', selectedUserId);
            formData.append('note', note);
            formData.append('investment_date', investment_date);

            axiosClient.post(`/investments/${investment.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(() => {
                setNotification('Investments data has been updated')
                navigate('/investments');
            })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {

            const {amount, investment_date, note} = investment;
            const formData = new FormData();
            formData.append('account_id', selectedAccountId);
            formData.append('amount', amount);
            formData.append('user_id', selectedUserId);
            formData.append('note', note);
            formData.append('investment_date', investment_date);

            axiosClient.post('/investments/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(({data}) => {
                    if (data.action_status === 'insufficient_balance') {
                        setInsufficientBalanceForCategory(data.message);
                    } else {
                        setNotification('Investments has been added.');
                        navigate('/investments');
                    }


                })
                .catch((error) => {
                    const response = error.response;
                    setErrors(response.data.errors);
                });
        }
    };

    console.log('exsdsd', selectedAccountId)

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                {investment.id && <h1 className="title-text mb-0">Update Investment </h1>}
                {!investment.id && <h1 className="title-text mb-0">Add New Investment</h1>}
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}

                {!loading && (
                    <form onSubmit={investmentSubmit}>
                        {insufficientBalanceForCategory && (
                            <div className="text-danger mt-2 mb-3">{insufficientBalanceForCategory}</div>
                        )}

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="investment_users">User (*)</label>
                                    <select
                                        className="custom-form-control"
                                        value={selectedUserId}
                                        id="investment-user"
                                        name="investment-user"
                                        onChange={(event) => {
                                            const value = event.target.value || '';
                                            setSelectedUserId(value);
                                        }}>
                                         <option defaultValue value={user.id}>{user.name}</option>
                                        {users.map(singleUser => (
                                            <option key={singleUser.id} value={singleUser.id}>
                                                {singleUser.name}
                                            </option>
                                        ))}
                                    </select>
                                    {/* {selectedUserId ===''  && <p className="error-message mt-2">user Required</p>} */}
                                </div>
                              
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="investment_amount">Amount(*)</label>
                                    <input className="custom-form-control" type="number" step="any" value={investment.amount || ""}
                                           onChange={ev => setInvestment({...investment, amount: ev.target.value})}
                                           placeholder="Amount"/>
                                    {/* {errors.amount && <p className="error-message mt-2">{errors.amount[0]}</p>} */}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="investment_date">Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={investment.investment_date ? new Date(investment.investment_date) : new Date() }
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !investment.investment_date ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setInvestment({
                                                ...investment,
                                                investment_date: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Investment Date"
                                    />
                                    {/* {errors.start_date && <p className="error-message mt-2">{errors.start_date[0]}</p>} */}
                                </div>
                            </div>
                            
        

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="bank_account">Bank Account (*)</label>
                                    <select
                                        className="custom-form-control"
                                        value={selectedAccountId}
                                        id="bank-account"
                                        name="bank-account"
                                        onChange={(event) => {
                                            const value = event.target.value || '';
                                            setSelectedAccountId(value);
                                        }}>
                                        {bankAccounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.bank_name} - {account.account_number} - Balance ({account.balance})
                                            </option>
                                        ))}
                                    </select>
                                    {/* {errors.account_id && <p className="error-message mt-2">{errors.account_id[0]}</p>} */}
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="note">Note</label>
                                    <textarea 
                                    style={{height:130}}
                                            className="form-control" 
                                            id="exampleFormControlTextarea1"  
                                            rows="3"
                                            value={investment.note !== 'null' ? investment.note : ''}
                                            onChange={ev => setInvestment({...investment, note: ev.target.value})}
                                            placeholder="Additional Note"></textarea>
                                 
                                </div>

                            </div>
                        </div>
                        {(selectedUserId !=='' 
                        && investment?.amount !==''
                        && selectedAccountId !=='')
                        ? <button className={investment.id ? "btn btn-warning" : "custom-btn btn-add"}>
                            {investment.id ? "Update Investment Record" : "Add New Investment"}
                        </button>
                        :
                        <button className={investment.id ? "btn btn-secondary" : "btn btn-secondary"} disabled>
                            {investment.id ? "Update Investment Record" : "Add New Investment"}
                        </button>
                         }
                       

                    </form>
                )}
            </WizCard>

        </>
    )
}
