import React, {Fragment, useState,useEffect} from 'react';
import {Card, CardContent, Grid, TextField, Button, Typography, Box} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import {useNavigate, useParams} from 'react-router-dom';
import axiosClient from '../../axios-client';
import MainLoader from '../../components/MainLoader';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
const default_associative_categories = [
    'Electricity',
    'Internet',
    'Rental Cost',
];


function SectorCreate() {

    let {id} = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)
    const [sectorData, setSectorData] = useState({
        name: '',
        contractStartDate: '',
        contractEndDate: '',
    });

    const [electricityData, setElectricityData] = useState({
        premisesNumber: '',
        businessAccountNo: '',
        accountNumber: '',
        elBillingDate: '',
    });

    const [internetData, setInternetData] = useState({
        accountNumber: '',
        inBillingDate: '',
        note: '',
    });

    const [paymentData, setPaymentData] = useState([
        {
            paymentNumber: '',
            paymentDate: '',
            amount: '',
        },
    ]);

    const [categoryName, setCategoryName] = useState([]);
    const [associativeCategories, setAssociativeCategory] = useState([]);

    useEffect(()=>{
        axiosClient.get('/get-associative-categories')
            .then(({data}) => {
                console.log(data)
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                // handle error, e.g., show an error message to the user
            });
    }, []);


    const handleChangeCategory = (event) => {
        const {
            target: {value},
        } = event;
        setCategoryName(
            // On autofill, we get a stringify value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setSectorData({...sectorData, [name]: value});
    };

    const handleElectricityInputChange = (e) => {
        const {name, value} = e.target;
        setElectricityData({...electricityData, [name]: value});
    };

    const handleInternetInputChange = (e) => {
        const {name, value} = e.target;
        setInternetData({...internetData, [name]: value});
    };

    //payment
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

    const sectorSubmit = (e, stay) => {
        e.preventDefault();
        setLoading(true)
        // Handle form submission, e.g., send data to an API
        let formData = new FormData();
        formData.append('name', sectorData.name);
        formData.append('contract_start_date', sectorData.contractStartDate);
        formData.append('contract_end_date', sectorData.contractEndDate);

        //for electricity
        formData.append('el_premises_no', electricityData.premisesNumber);
        formData.append('el_acc_no', electricityData.accountNumber);
        formData.append('el_billing_date', electricityData.elBillingDate);
        formData.append('el_business_acc_no', electricityData.businessAccountNo);

        //for internet
        formData.append('internet_acc_no', internetData.accountNumber);
        formData.append('internet_billing_date', internetData.inBillingDate);
        formData.append('int_note', internetData.note);
        //for payment
        if (paymentData && paymentData.length > 0) {
            paymentData.forEach(element => {
                formData.append('payment_amount[]', element.amount);
                formData.append('payment_date[]', element.paymentDate);
                formData.append('payment_number[]', element.paymentNumber);
            });
        }
        // for category
        if (categoryName && categoryName.length > 0) {
            categoryName.forEach(element => {
                formData.append('category_name[]', element);
            });
        }

        const url = id ? `/sector/${id}` : `/sector/add`;

        axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(() => {
            stay === true ? window.location.reload() : navigate('/sectors');
            setLoading(false)
        }).catch((error) => {
            const response = error.response;
            setErrors(response.data.errors);
            setLoading(false)
        });

    };

    return (
        <Fragment>
            <MainLoader loaderVisible={loading} />
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Sector Information
                    </Typography>
                    <form>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Sector Name"
                                    variant="outlined"
                                    name="name"
                                    value={sectorData.name}
                                    onChange={handleInputChange}
                                    focused
                                />
                                {/*{errors.name && <p className="error-message mt-2">{errors.name[0]}</p>}*/}
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Contact Start Date"
                                    type="date"
                                    variant="outlined"
                                    name="contractStartDate"
                                    value={sectorData.contractStartDate}
                                    onChange={handleInputChange}
                                    focused
                                />
                                {errors?.contract_start_date &&
                                    <p className="error-message mt-2">{errors?.contract_start_date[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Contact End Date"
                                    type="date"
                                    variant="outlined"
                                    name="contractEndDate"
                                    value={sectorData.contractEndDate}
                                    onChange={handleInputChange}
                                    focused
                                />
                                {errors?.contract_end_date &&
                                    <p className="error-message mt-2">{errors?.contract_end_date[0]}</p>}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{marginTop: '20px'}}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Electricity
                    </Typography>
                    <form>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="DEWA"
                                    type="number"
                                    variant="outlined"
                                    name="premisesNumber"
                                    value={electricityData.premisesNumber}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                                {errors?.el_premises_no &&
                                    <p className="error-message mt-2">{errors?.el_premises_no[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Business Account No"
                                    type="number"
                                    variant="outlined"
                                    name="businessAccountNo"
                                    value={electricityData.businessAccountNo}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                                {errors?.el_business_acc_no &&
                                    <p className="error-message mt-2">{errors?.el_business_acc_no[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    type="number"
                                    name="accountNumber"
                                    value={electricityData.accountNumber}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                                {errors?.el_acc_no && <p className="error-message mt-2">{errors?.el_acc_no[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Billing Date"
                                    type="date"
                                    variant="outlined"
                                    name="elBillingDate"
                                    value={electricityData.elBillingDate}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                                {errors?.el_billing_date &&
                                    <p className="error-message mt-2">{errors?.el_billing_date[0]}</p>}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{marginTop: '20px'}}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Internet
                    </Typography>
                    <form>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    name="accountNumber"
                                    type="number"
                                    value={internetData.accountNumber}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                                {errors?.internet_acc_no &&
                                    <p className="error-message mt-2">{errors?.internet_acc_no[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Billing Date"
                                    type="date"
                                    variant="outlined"
                                    name="inBillingDate"
                                    value={internetData.inBillingDate}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Note"
                                    variant="outlined"
                                    name="note"
                                    value={internetData.note}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                                {errors?.internet_billing_date &&
                                    <p className="error-message mt-2">{errors?.internet_billing_date[0]}</p>}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{marginTop: '20px'}}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Payment
                    </Typography>
                    {paymentData.map((payment, index) => (
                        <Grid container spacing={2} key={index} sx={{mb: 2}}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Payment Number"
                                    variant="outlined"
                                    name="paymentNumber"
                                    value={payment.paymentNumber}
                                    onChange={(e) => handlePaymentInputChange(e, index)}
                                    focused
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
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    label="Amount"
                                    variant="outlined"
                                    name="amount"
                                    value={payment.amount}
                                    onChange={(e) => handlePaymentInputChange(e, index)}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    sx={{ml: 2, mt: 1.2}}
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddPaymentRow}
                                >
                                    Add
                                </Button>
                                {index > 0 && (
                                    <Button
                                        sx={{ml: 2, mt: 1.2}}
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleRemovePaymentRow(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    ))}
                </CardContent>
            </Card>

            <Card style={{marginTop: '20px'}}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Associative Categories
                    </Typography>
                    <FormControl sx={{m: 1}} fullWidth>
                        <InputLabel id="demo-multiple-checkbox-label"> Associative Categories</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={categoryName}
                            onChange={handleChangeCategory}
                            input={<OutlinedInput label=" Associative Categories"/>}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            style={{backgroundColor: '#eeeeee'}}
                        >
                            {default_associative_categories.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={categoryName.indexOf(name) > -1}/>
                                    <ListItemText primary={name}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            <Box display='flex' justifyContent='center' justifyItems='center' sx={{mt: 5, mb: 5}}>
                <Button variant='contained' sx={{m: 2}} onClick={(e) => sectorSubmit(e, true)}>Create</Button>
                <Button variant='contained' sx={{m: 2}} onClick={(e) => sectorSubmit(e, false)}>Create & Exist</Button>
            </Box>

        </Fragment>

    );
}

export default SectorCreate;
