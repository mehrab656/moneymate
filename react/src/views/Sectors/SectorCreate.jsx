import React, {Fragment, useState} from 'react';
import {Card, CardContent, Grid, TextField, Button, Typography, Box} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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
const associativeCategories = [
    'Electricity',
    'Gas',
    'Internet & TV',
    'Furniture',
    'Rental Cost',
    'Maintenance',
];

function SectorCreate() {
    const [formData, setFormData] = useState({
        sectorName: '',
        contactStartDate: '',
        contactEndDate: '',
    });

    const [electricityData, setElectricityData] = useState({
        el_premises_no: '',
        el_business_acc_no: '',
        el_acc_no: '',
        el_billing_date: '',
    });

    const [internetData, setInternetData] = useState({
        internet_acc_no: '',
        internet_billing_date: '',
        int_note: '',
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
            target: {value},
        } = event;
        setCategoryName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleContactInputChange = (e) => {
        const {name, value} = e.target;
        setContactData({...contactData, [name]: value});
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission, e.g., send data to an API
        console.log(formData);
    };

    return (
        <Fragment>

            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Sector Information
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Sector Name"
                                    variant="outlined"
                                    name="sectorName"
                                    value={formData.sectorName}
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
                                    value={formData.contactStartDate}
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
                                    value={formData.contactEndDate}
                                    onChange={handleInputChange}
                                    focused
                                />
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
                                    label="Premises Number"
                                    variant="outlined"
                                    name="el_premises_no"
                                    value={electricityData.el_premises_no}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Business Account No"
                                    variant="outlined"
                                    name="el_business_acc_no"
                                    value={electricityData.el_business_acc_no}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    name="el_acc_no"
                                    value={electricityData.el_acc_no}
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
                                    name="el_billing_date"
                                    value={electricityData.el_billing_date}
                                    onChange={handleElectricityInputChange}
                                    focused
                                />
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
                                    name="internet_acc_no"
                                    value={internetData.internet_acc_no}
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
                                    name="internet_billing_date"
                                    value={internetData.internet_billing_date}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Reference"
                                    variant="outlined"
                                    name="int_note"
                                    value={internetData.int_note}
                                    onChange={handleInternetInputChange}
                                    focused
                                />
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
                    <form>
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
                    </form>
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
                            {associativeCategories.map((name) => (
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
                <Button variant='contained' sx={{m: 2}}>Create</Button>
                <Button variant='contained' sx={{m: 2}}>Create & Exist</Button>
            </Box>

        </Fragment>
    );
}

export default SectorCreate;
