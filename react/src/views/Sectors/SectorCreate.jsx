import React, {Fragment, useState, useEffect} from 'react';
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
import {useStateContext} from "../../contexts/ContextProvider.jsx";

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

const initialSectorState = {
    name: '',
    contract_start_date: '',
    contract_end_date: '',
    el_premises_no: null,
    el_business_acc_no: null,
    el_acc_no: null,
    el_billing_date: null,
    int_note: '',
    internet_acc_no: null,
    internet_billing_date: null,
    contract_period: null
};
const initialPaymentState = [
    {
        paymentNumber: '',
        paymentDate: '',
        amount: '',
    },
];


function SectorCreate() {

    let {id} = useParams();
    const navigate = useNavigate();
    const {setNotification} = useStateContext();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)
    const [sector, setSector] = useState(initialSectorState);
    const [paymentData, setPaymentData] = useState(initialPaymentState);
    const [categoryName, setCategoryName] = useState([]);


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
        setSector({...sector, [name]: value});
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
        formData.append('name', sector.name);
        formData.append('contract_start_date', sector.contract_start_date);
        formData.append('contract_end_date', sector.contract_end_date);

        //for electricity
        formData.append('el_premises_no', sector.el_premises_no);
        formData.append('el_acc_no', sector.el_acc_no);
        formData.append('el_billing_date', sector.el_billing_date);
        formData.append('el_business_acc_no', sector.el_business_acc_no);

        //for internet
        formData.append('internet_acc_no', sector.internet_acc_no);
        formData.append('internet_billing_date', sector.internet_billing_date);
        formData.append('int_note', sector.int_note);
        if (id === null) {
            formData.append('contract_period', sector.contract_period);
        }
        //for payment
        if (id === null && paymentData && paymentData.length > 0) {
            paymentData.forEach(element => {
                formData.append('payment_amount[]', element.amount);
                formData.append('payment_date[]', element.paymentDate);
                formData.append('payment_number[]', element.paymentNumber);
            });
        }
        // for category
        if (id === null && categoryName && categoryName.length > 0) {
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
            if (stay) {
                setSector(initialSectorState);
                setPaymentData(initialPaymentState);
                setNotification('Sector data has been added.');

            } else {
                navigate('/sectors');
                setNotification('Sector data has been updated.');
            }
            setLoading(false)
        }).catch((error) => {
            const response = error.response;
            setNotification(response.data.message);
            setErrors(response.data.errors);
            setLoading(false)
        });

    };
    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/sector/${id}`)
                .then(({data}) => {
                    setSector(data.data)
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id]);
    return (
        <Fragment>
            <MainLoader loaderVisible={loading}/>
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
                                    value={sector.name}
                                    onChange={handleInputChange}
                                    focused
                                />
                                {errors.name && <p className="error-message mt-2">{errors.name[0]}</p>}
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Contact Start Date"
                                    type="date"
                                    variant="outlined"
                                    name="contract_start_date"
                                    value={sector.contract_start_date}
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
                                    name="contract_end_date"
                                    value={sector.contract_end_date}
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
                                    name="el_premises_no"
                                    value={sector.el_premises_no}
                                    onChange={ev => setSector({...sector, el_premises_no: ev.target.value})}
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
                                    name="el_business_acc_no"
                                    value={sector.el_business_acc_no}
                                    onChange={ev => setSector({...sector, el_business_acc_no: ev.target.value})}
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
                                    name="el_acc_no"
                                    value={sector.el_acc_no}
                                    onChange={ev => setSector({...sector, el_acc_no: ev.target.value})}
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
                                    name="el_billing_date"
                                    value={sector.el_billing_date}
                                    onChange={ev => setSector({...sector, el_billing_date: ev.target.value})}
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
                            <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    name="internet_acc_no"
                                    type="number"
                                    value={sector.internet_acc_no}
                                    onChange={ev => setSector({...sector, internet_acc_no: ev.target.value})}
                                    focused
                                />
                                {errors?.internet_acc_no &&
                                    <p className="error-message mt-2">{errors?.internet_acc_no[0]}</p>}
                            </Grid>
                            <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                                <TextField
                                    fullWidth
                                    label="Billing Date"
                                    type="date"
                                    variant="outlined"
                                    name="internet_billing_date"
                                    value={sector.internet_billing_date}
                                    onChange={ev => setSector({
                                        ...sector,
                                        internet_billing_date: ev.target.value
                                    })}
                                    focused
                                />
                            </Grid>
                            {
                                !sector.id &&
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Contract period"
                                        variant="outlined"
                                        name="contract_period"
                                        value={sector.contract_period}
                                        onChange={ev => setSector({...sector, contract_period: ev.target.value})}
                                        focused
                                    />
                                    {errors?.contract_period &&
                                        <p className="error-message mt-2">{errors?.contract_period[0]}</p>}
                                </Grid>
                            }

                            <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                                <TextField
                                    fullWidth
                                    label="Note"
                                    variant="outlined"
                                    name="note"
                                    value={sector.int_note}
                                    onChange={ev => setSector({...sector, int_note: ev.target.value})}
                                    focused
                                />
                                {errors?.int_note &&
                                    <p className="error-message mt-2">{errors?.int_note[0]}</p>}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
            {
                !sector.id &&
                <>

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
                </>
            }


            <Box display='flex' justifyContent='center' justifyItems='center' sx={{mt: 5, mb: 5}}>
                {
                    sector.id &&
                    <Button variant='contained' sx={{m: 2}} onClick={(e) => sectorSubmit(e, false)}>Update</Button>
                }{
                !sector.id &&
                <>
                    <Button variant='contained' sx={{m: 2}} onClick={(e) => sectorSubmit(e, true)}>Create</Button>
                    <Button variant='contained' sx={{m: 2}} onClick={(e) => sectorSubmit(e, false)}>Create &
                        Exist</Button>
                </>
            }</Box>

        </Fragment>

    );
}

export default SectorCreate;
