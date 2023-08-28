import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizCard from "../components/WizCard.jsx";

export default function InvestmentPlanForm() {
    const {user} = useStateContext();
    let {id} = useParams();

    const [plan, setPlan] = useState({
        id: null,
        plan_name: null,
        userId: user && user?.id,
        date: null,
        startDate: null,
        endDate: null,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const {setNotification} = useStateContext();
    const navigate = useNavigate();

    // for nested table row
    const [tableData, setTableData] = useState([
        {
            purpose: '',
            paymentTerms: '',
            amount: '',
            refundableAmount: '',
            remarks: ''
        }
    ]);

    const addRow = () => {
        setTableData([...tableData, {
            purpose: '',
            paymentTerms: '',
            amount: '',
            refundableAmount: '',
            remarks: ''
        }]);
    };

    const removeRow = (index) => {
        const updatedData = [...tableData];
        updatedData.splice(index, 1);
        setTableData(updatedData);
    };

    const handleInputChange = (event, index, columnName) => {
        const updatedData = [...tableData];
        updatedData[index][columnName] = event.target.value;
        setTableData(updatedData);
    };


// get single detials and update fields
    // useEffect(() => {
    //     if (id) {
    //         setLoading(true)
    //         axiosClient.get(`/income/${id}`)
    //             .then(({data}) => {
    //                 setLoading(false);
    //                 setIncome(data);
    //             })
    //             .catch(() => {
    //                 setLoading(false)
    //             })
    //     }
    // }, [id]);

    // set default date(today)
    useEffect(() => {
        if (plan?.date === null) {
            setPlan({
                ...plan,
                date: new Date().toISOString().split('T')[0],
                startDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [plan?.date, plan?.startDate])


    const planSubmit = (event) => {
        event.preventDefault();

        if (plan.id) {
            const {userId, date, startDate, endDate} = plan;
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('date', date);
            formData.append('start_date', startDate);
            formData.append('end_date', endDate);


            axiosClient.post(`/investment-plan/${plan.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(({data}) => {
                setNotification('Plan data has been updated')
                navigate('/investment-plan');
            })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            const {userId, plan_name, date, startDate, endDate, purposes} = plan;
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('plan_name', plan_name);
            formData.append('date', date);
            formData.append('start_date', startDate);
            formData.append('end_date', endDate);
            formData.append('purposes', tableData);

            axiosClient.post(`/investments/add-new-plan`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(({data}) => {
                setNotification('Plan data has been added')
                // navigate('/investment-plan');
            })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                {plan.id && <h1 className="title-text mb-0">Update Investment Plan </h1>}
                {!plan.id && <h1 className="title-text mb-0">Add New Investment Plan</h1>}
            </div>
            <WizCard className="animated fadeInDown wiz-card-mh">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}

                {!loading && (
                    <form onSubmit={planSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="plan_name">Plan Name</label>
                                    <input className="custom-form-control" type="text" step="any"
                                           value={plan.plan_name || ""}
                                           onChange={ev => setPlan({...plan, plan_name: ev.target.value})}
                                           placeholder="Plan Name"/>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="plan_start_date">Start Date(Contact
                                        Period)</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={plan.startDate ? new Date(plan.startDate) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !plan.startDate ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setPlan({
                                                ...plan,
                                                startDate: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Start Date(Contact Period)"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="plan_date">Plan Date</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={plan.date ? new Date(plan.date) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !plan.date ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setPlan({
                                                ...plan,
                                                date: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Income Date"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="plan_end_date">End Date(Contact
                                        Period)</label>
                                    <DatePicker
                                        className="custom-form-control"
                                        selected={plan.endDate ? new Date(plan.endDate) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate = selectedDate && !plan.endDate ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : selectedDate;
                                            setPlan({
                                                ...plan,
                                                endDate: updatedDate ? updatedDate.toISOString().split('T')[0] : ''
                                            });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="End Date(Contact Period)"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* infiniti rows */}
                        <div className="row mt-3">
                            <div className="col-md-12">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Purpose</th>
                                        <th>Payment Terms</th>
                                        <th>Amount</th>
                                        <th>Refundable Amount</th>
                                        <th>Remarks</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tableData.map((row, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input type="text" value={row.purpose}
                                                       onChange={(e) => handleInputChange(e, index, 'purpose')}/>
                                            </td>
                                            <td>
                                                <input type="text" value={row.paymentTerms}
                                                       onChange={(e) => handleInputChange(e, index, 'paymentTerms')}/>
                                            </td>
                                            <td>
                                                <input type="number" value={row.amount}
                                                       onChange={(e) => handleInputChange(e, index, 'amount')}/>
                                            </td>
                                            <td>
                                                <input type="number" value={row.refundableAmount}
                                                       onChange={(e) => handleInputChange(e, index, 'refundableAmount')}/>
                                            </td>
                                            <td>
                                                <input type="text" value={row.remarks}
                                                       onChange={(e) => handleInputChange(e, index, 'remarks')}/>
                                            </td>
                                            <td>
                                                <div className="d-grid gap-2 d-md-flex">
                                                    <button className="btn btn-sm btn-danger"
                                                            onClick={() => removeRow(index)}
                                                            title={'Remove this row'}>{'-'}
                                                    </button>
                                                    <button className="btn btn-sm btn-info" onClick={addRow}
                                                            title={'Add a new row'}>{'+'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                            </div>
                        </div>
                        <button className={plan.id ? "btn btn-info float-right mt:3" : "custom-btn btn-add mt:3"}>
                            {plan.id ? "Update Plan Record" : "Add Plan"}
                        </button>
                    </form>
                )}
            </WizCard>

        </>
    )
}
