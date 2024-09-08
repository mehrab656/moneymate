import React, {memo, useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {Autocomplete, Card, CardContent, Grid, TextField, Typography} from "@mui/material";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MainLoader from "../components/MainLoader.jsx";
import axiosClient from "../axios-client.js";
import {notification} from "../components/ToastNotification.jsx";
import {makeStyles} from "@mui/styles";
import {useNavigate} from "react-router-dom";

const useStyles = makeStyles({
    option: {
        "&:hover": {
            backgroundColor: "#ff7961 !important"
        },
    }
});

const initialPaymentState = [
    {
        paymentNumber: '',
        paymentDate: '',
        amount: '',
    },
];

const initialExtraFees = [
    {
        description: '',
        date: '',
        amount: '',
        refundable_amount: 0,
        reference: '',
        note: '',
        selectedAccount: null,
        selectedCategory: null
    }
]
const ContractExtendCard = ({showModal, sector, closeContractExtendModal}) => {

    const classes = useStyles();

    const [loading, setLoading] = useState(false)

    const [renewalData, setRenewalData] = useState({
        start_date: '',
        end_date: '',
        contract_period: 12,
        renewal_fee: ''
    });
    const [errors, setErrors] = useState({});
    const [paymentData, setPaymentData] = useState(initialPaymentState);
    const [extraFees, setExtraFees] = useState(initialExtraFees);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    useEffect(() => {
        axiosClient.get('/expense-categories')
            .then(({data}) => {
                setExpenseCategories(data.categories);
            })
            .catch(error => {
                console.error('Error loading expense categories:', error);
            });

        axiosClient.get('/all-bank-account')
            .then(({data}) => {
                setBankAccounts(data.data);
            })
            .catch(error => {
                console.warn('Error fetching bank accounts:', error)
            });
    }, [setExpenseCategories, setBankAccounts]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setRenewalData({...renewalData, [name]: value});
    };
    const handlePaymentInputChange = (e, index) => {
        const {name, value} = e.target;
        const updatedPayments = [...paymentData];
        updatedPayments[index][name] = value;
        setPaymentData(updatedPayments);
    };
    const handleAddPaymentRow = () => {
        setPaymentData([...paymentData, {paymentNumber: '', paymentDate: '', amount: ''}]);
    };

    const handleRemovePaymentRow = (index) => {
        const updatedPayments = [...paymentData];
        updatedPayments.splice(index, 1);
        setPaymentData(updatedPayments);
    };
    const handleExtraFeesInputChange = (e, index) => {
        const {name, value} = e.target;
        const updateExtraFees = [...extraFees];
        updateExtraFees[index][name] = value;
        setExtraFees(updateExtraFees);
    };

    const handleAddExtraFeesRow = () => {
        setExtraFees([...extraFees, {
            description: '',
            date: '',
            amount: '',
            refundable_amount: 0,
            reference: '',
            note: '',
            selectedAccount: null,
            selectedCategory: null
        }]);
    };
    const handleRemoveExtraFeesRow = (index) => {
        const updateExtraFees = [...extraFees];
        updateExtraFees.splice(index, 1);
        setExtraFees(updateExtraFees);
    };


    const renewContract = (e) => {
        e.preventDefault();
        setLoading(true);

        let formData = new FormData();

        formData.append('id', sector.id);
        formData.append('contract_start_date', renewalData.start_date);
        formData.append('contract_end_date', renewalData.end_date);
        formData.append('contract_period', renewalData.contract_period);
        formData.append('renewal_fee', renewalData.renewal_fee);

        if (paymentData && paymentData.length > 0) {
            paymentData.forEach(payment => {
                formData.append('payment_amount[]', payment.amount);
                formData.append('payment_date[]', payment.paymentDate);
                formData.append('payment_number[]', payment.paymentNumber);
            });
        }

        if (extraFees && extraFees.length > 0) {
            extraFees.forEach(extra => {
                formData.append('description[]', extra.description);
                formData.append('date[]', extra.date);
                formData.append('amount[]', extra.amount);
                formData.append('refundable_amount[]', extra.refundable_amount);
                formData.append('reference[]', extra.reference);
                formData.append('note[]', extra.note);
                formData.append('account_id[]', extra.selectedAccount?.id);
                formData.append('category_id[]', extra.selectedCategory?.id);
            });
        }

        // now submit the data

        axiosClient.post('/contract-renew', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(({data}) => {
            // navigate('/sectors');
            notification('success', data?.message, data?.description);
            setTimeout(() => {
                window.location.reload();
            }, 2000)
            setLoading(false)
        }).catch((error) => {
            const response = error.response;
            notification('error', response.data.message, response.data.description);
            setErrors(response.data.errors);
            setLoading(false)
        });
    }


    return (
        <Modal show={showModal}
               size={"xl"} centered onHide={closeContractExtendModal} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className="title-text">Contract Renew For {sector.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <MainLoader loaderVisible={loading}/>
                <form>
                    <div className="row">
                        <div className="col-6">
                            {/*prev start date*/}
                            <div className="form-group">
                                <label htmlFor="prev_start_date" className="custom-form-label">
                                    Previous Start Date:
                                </label>

                                <input
                                    className="custom-form-control"
                                    id={"prev_start_date"}
                                    value={sector.contract_start_date}
                                    type="text"
                                    placeholder="Previous Start Date"
                                    disabled={true}
                                />
                            </div>

                            {/*new start date*/}
                            <div className="form-group">
                                <label htmlFor="new_start_date" className="custom-form-label">
                                    New Start Date:
                                </label>

                                <input
                                    className="custom-form-control"
                                    id={"new_start_date"}
                                    value={renewalData.start_date}
                                    name={"start_date"}
                                    type="date"
                                    placeholder="New Start Date"
                                    onChange={handleInputChange}
                                />
                                {errors?.start_date &&
                                    <p className="error-message mt-2">{errors?.start_date[0]}</p>}
                            </div>
                        </div>

                        {/*2nd Part*/}
                        <div className="col-6">
                            {/*prev end date*/}
                            <div className="form-group">
                                <label htmlFor="prev_end_date" className="custom-form-label">
                                    Previous Expire Date:
                                </label>
                                <input
                                    className="custom-form-control"
                                    id={"prev_end_date"}
                                    value={sector.contract_end_date}
                                    type="text"
                                    placeholder="Previous End Date"
                                    disabled={true}
                                />
                            </div>

                            {/*new end date*/}
                            <div className="form-group">
                                <label htmlFor="new_end_date" className="custom-form-label">
                                    New End Date:
                                </label>

                                <input
                                    className="custom-form-control"
                                    id={"new_end_date"}
                                    value={renewalData.end_date}
                                    name={"end_date"}
                                    type="date"
                                    placeholder="New Start Date"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                    </div>
                    <Card className={"shadow-none"}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Payment
                            </Typography>
                            {paymentData.map((payment, index) =>
                                <Grid container spacing={2} key={index} sx={{mb: 2}}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Payment Number"
                                        variant="outlined"
                                        name="paymentNumber"
                                        value={payment.paymentNumber}
                                        onChange={(e) => handlePaymentInputChange(e, index)}
                                        focused={true}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Payment Date"
                                        type="date"
                                        variant="outlined"
                                        name="paymentDate"
                                        value={payment.paymentDate}
                                        onChange={(e) => handlePaymentInputChange(e, index)}
                                        InputLabelProps={{shrink: true}}
                                        focused={true}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        variant="outlined"
                                        name="amount"
                                        type='number'
                                        value={payment.amount}
                                        onChange={(e) => handlePaymentInputChange(e, index)}
                                        focused={true}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddPaymentRow}
                                    >
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </Button>
                                    {index > 0 && (
                                        <Button
                                            variant="contained"
                                            color="danger"
                                            onClick={() => handleRemovePaymentRow(index)}
                                        >
                                            <FontAwesomeIcon icon={faMinus}/>
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>)}
                        </CardContent>
                    </Card>
                    <Card className={"shadow-none"}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Extra Renewal Fees
                            </Typography>
                            {extraFees.map((fees, index) =>
                                <Grid container spacing={2} key={index} sx={{mb: 4}} className={"border-bottom"}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            className={"mb-2"}
                                            label="Description"
                                            variant="outlined"
                                            name="description"
                                            value={fees.description}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            focused={true}
                                            placeholder={"Expense Descriptions"}

                                        />
                                        <Autocomplete
                                            classes={{option: classes.option}}
                                            options={expenseCategories}
                                            getOptionLabel={(option) => option.name}
                                            id="parentCategory"
                                            isOptionEqualToValue={(option, selectedCategoryID) => option.id === selectedCategoryID.id}
                                            value={fees.selectedCategory}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const updateExtraFees = [...extraFees];
                                                    updateExtraFees[index]['selectedCategory'] = newValue;
                                                    setExtraFees(updateExtraFees);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label='Expense Category'
                                                    variant="outlined"
                                                    placeholder="Expense Category"
                                                    focused={true}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            className={"mb-2"}
                                            label="Payment Date"
                                            type="date"
                                            variant="outlined"
                                            name="date"
                                            value={fees.date}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            InputLabelProps={{shrink: true}}
                                            focused={true}
                                            placeholder={"Expense Date"}

                                        />

                                        <Autocomplete
                                            classes={{option: classes.option}}
                                            options={bankAccounts}
                                            getOptionLabel={(option) => (option.bank_name + '-' + (option.account_number))}
                                            id="parentCategory"
                                            isOptionEqualToValue={(option, selectedBankAccountID) => option.id === selectedBankAccountID.id}
                                            value={fees.selectedAccount}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    const updateExtraFees = [...extraFees];
                                                    updateExtraFees[index]['selectedAccount'] = newValue;
                                                    setExtraFees(updateExtraFees);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label='Bank Account'
                                                    variant="outlined"
                                                    placeholder="Expense Account"
                                                    focused={true}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            className={"mb-2"}
                                            label="Amount"
                                            variant="outlined"
                                            name="amount"
                                            type='number'
                                            value={fees.amount}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            focused={true}
                                            placeholder="Expense Amount"
                                        />
                                        <TextField
                                            fullWidth
                                            label="Refundable Amount"
                                            variant="outlined"
                                            name="refundable_amount"
                                            type='number'
                                            value={fees.refundable_amount}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            focused={true}
                                            placeholder="Refundable Account"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            className={"mb-2"}
                                            label="Reference"
                                            variant="outlined"
                                            name="reference"
                                            type='text'
                                            value={fees.reference}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            focused={true}
                                            placeholder="Expense Reference"
                                        />
                                        <TextField
                                            fullWidth
                                            label="Note"
                                            variant="outlined"
                                            name="note"
                                            type='text'
                                            value={fees.note}
                                            onChange={(e) => handleExtraFeesInputChange(e, index)}
                                            focused={true}
                                            placeholder="Extra Note"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <Button variant="contained" color="primary" onClick={handleAddExtraFeesRow}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </Button>
                                        {index > 0 && (
                                            <Button variant="contained" color="danger"
                                                    onClick={() => handleRemoveExtraFeesRow(index)}>
                                                <FontAwesomeIcon icon={faMinus}/>
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>)}
                        </CardContent>
                    </Card>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-sm" variant="primary" onClick={renewContract}>
                    Renew
                </Button>
            </Modal.Footer>
        </Modal>
    )
}


export default memo(ContractExtendCard)