import React, { Fragment, useState } from 'react';
import { Card, CardContent, Grid, TextField, Button, Typography, Box } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { useParams } from 'react-router-dom';
import axiosClient from '../../axios-client';
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
const names = [
    'Electricity',
    'Internet & Mobile',
    'Internet & TV',
    'Furniture',
    'Rental Cost',
    'Maintenance',
];

function SectorCreate() {

    let {id} = useParams();


    const [sectorData, setSectorData] = useState({
        sectorName: '',
        contactStartDate: '',
        contactEndDate: '',
        DEWA: '',
        internetAccount: '',
    });

    const [contactData, setContactData] = useState({
        contactStartDate: '',
        contactEndDate: '',
    });

    const [electricityData, setElectricityData] = useState({
        DEWA: '',
        businessAccountNo: '',
        accountNumber: '',
        billingDate: '',
    });

    const [internetData, setInternetData] = useState({
        accountNumber: '',
        billingDate: '',
        reference: '',
    });

    const [paymentData, setPaymentData] = useState([
        {
            paymentNumber: '',
            paymentDate: '',
            amount: '',
        },
    ]);

    const [categoryName, setCategoryName] = useState([]);

    const handleChangeCategory = (event) => {
        const {
            target: { value },
        } = event;
        setCategoryName(
            // On autofill, we get a stringify value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSectorData({ ...sectorData, [name]: value });
    };

    const handleContactInputChange = (e) => {
        const { name, value } = e.target;
        setContactData({ ...contactData, [name]: value });
    };

    const handleElectricityInputChange = (e) => {
        const { name, value } = e.target;
        setElectricityData({ ...electricityData, [name]: value });
    };

    const handleInternetInputChange = (e) => {
        const { name, value } = e.target;
        setInternetData({ ...internetData, [name]: value });
    };

    //payment
    const handlePaymentInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedPayments = [...paymentData];
        updatedPayments[index][name] = value;
        setPaymentData(updatedPayments);
    };

    const handleAddPaymentRow = () => {
        setPaymentData([...paymentData, { paymentNumber: '', paymentDate: '', amount: '' }]);
    };

    const handleRemovePaymentRow = (index) => {
        const updatedPayments = [...paymentData];
        updatedPayments.splice(index, 1);
        setPaymentData(updatedPayments);
    };

    const sectorSubmit = (e, stay) => {
        e.preventDefault();
        // Handle form submission, e.g., send data to an API
        console.log('Form data submitted:', categoryName);
        console.log('staty', stay);

        let formData = new FormData();
        formData.append('sector_name', sectorData.sectorName);
        formData.append('sector_internet_account', sectorData.internetAccount);
        formData.append('sector_contact_startdate', sectorData.contactStartDate);
        formData.append('sector_contact_enddate', sectorData.contactEndDate);
        formData.append('sector_dewa', sectorData.DEWA);

        //for contact
        formData.append('contact_startdate', contactData.contactStartDate);
        formData.append('contact_enddate', contactData.contactEndDate);

        //for electricity
        formData.append('electricity_dewa', electricityData.DEWA);
        formData.append('electricity_acc_no', electricityData.accountNumber);
        formData.append('electricity_billing_date', electricityData.billingDate);
        formData.append('electricity_business_acc_no', electricityData.businessAccountNo);

        //for internet
        formData.append('internet_acc_no', internetData.accountNumber);
        formData.append('internet_billing_date', internetData.billingDate);
        formData.append('internet_reference', internetData.reference);

        //for payment
        if(paymentData && paymentData.length>0){
            paymentData.forEach(element => {
                formData.append('payment_amount[]', element.accountNumber);
                formData.append('payment_date[]', element.paymentDate);
                formData.append('payment_number[]', element.paymentNumber);
            });
        }

        // for category
        if(categoryName && categoryName.length>0){
            categoryName.forEach(element => {
                formData.append('category_name[]', element);
            });
        }
        let url;
        if(id){
            url =`/sector/${id}`
        }else{
            url=`/sector/new`
        }

        axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(() => {
            if(stay ===true){
                window.location.reload()
            }else{
                navigate('/sectors');
            }

        }).catch((e)=>{});

    };

    return (
        <Fragment>

            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Sector Information
                    </Typography>
                    <form >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Sector Name"
                                    variant="outlined"
                                    name="sectorName"
                                    value={sectorData.sectorName}
                                    onChange={handleInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Contact Start Date"
                                    type="date"
                                    variant="outlined"
                                    name="contactStartDate"
                                    value={sectorData.contactStartDate}
                                    onChange={handleInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Contact End Date"
                                    type="date"
                                    variant="outlined"
                                    name="contactEndDate"
                                    value={sectorData.contactEndDate}
                                    onChange={handleInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="DEWA"
                                    variant="outlined"
                                    name="DEWA"
                                    value={sectorData.DEWA}
                                    onChange={handleInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Internet Account"
                                    variant="outlined"
                                    name="internetAccount"
                                    value={sectorData.internetAccount}
                                    onChange={handleInputChange}
                                    focused
                                />
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Contact
                    </Typography>
                    <form >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Start Date"
                                    type="date"
                                    variant="outlined"
                                    name="contactStartDate"
                                    value={contactData.contactStartDate}
                                    onChange={handleContactInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact End Date"
                                    type="date"
                                    variant="outlined"
                                    name="contactEndDate"
                                    value={contactData.contactEndDate}
                                    onChange={handleContactInputChange}
                                    focused
                                />
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
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
                                    variant="outlined"
                                    name="DEWA"
                                    value={electricityData.DEWA}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Business Account No"
                                    variant="outlined"
                                    name="businessAccountNo"
                                    value={electricityData.businessAccountNo}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    name="accountNumber"
                                    value={electricityData.accountNumber}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Billing Date"
                                    type="date"
                                    variant="outlined"
                                    name="billingDate"
                                    value={electricityData.billingDate}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Internet
                    </Typography>
                    <form >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    name="accountNumber"
                                    value={internetData.accountNumber}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Billing Date"
                                    type="date"
                                    variant="outlined"
                                    name="billingDate"
                                    value={internetData.billingDate}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Reference"
                                    variant="outlined"
                                    name="reference"
                                    value={internetData.reference}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Payment
                    </Typography>
                    <form >
                        {paymentData.map((payment, index) => (
                            <Grid container spacing={2} key={index} sx={{mb:2}}>
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
                                        sx={{ml:2,mt:1.2}}
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddPaymentRow}
                                    >
                                        Add
                                    </Button>
                                    {index > 0 && (
                                        <Button
                                            sx={{ml:2,mt:1.2}}
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
                    </form>
                </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Associative Categories
                    </Typography>
                    <FormControl sx={{ m: 1}} fullWidth>
                        <InputLabel id="demo-multiple-checkbox-label"> Associative Categories</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={categoryName}
                            onChange={handleChangeCategory}
                            input={<OutlinedInput label=" Associative Categories" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            style={{ backgroundColor: '#eeeeee' }}
                        >
                            {names.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={categoryName.indexOf(name) > -1} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            <Box display='flex' justifyContent='center'  justifyItems='center' sx={{mt:5, mb:5}}>
                <Button variant='contained' sx={{m:2}} onClick={(e)=> sectorSubmit(e,true)}>Create</Button>
                <Button variant='contained' sx={{m:2}} onClick={(e)=> sectorSubmit(e,false)}>Create & Exist</Button>
            </Box>

        </Fragment>

    );
}

export default SectorCreate;
