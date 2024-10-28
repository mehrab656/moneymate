import {Col, Container, Form, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@mui/styles";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";
import {useGetCategoryListDataQuery} from "../../api/slices/categorySlice.js";
import Select from "react-select";
import {reservationValidationBuilder} from "../../helper/HelperFunctions.js";
import Button from "react-bootstrap/Button";
import {notification} from "../../components/ToastNotification.jsx";
import {useCreateIncomeMutation} from "../../api/slices/incomeSlice.js";
import {Autocomplete, Box, FormControl, TextField} from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

const useStyles = makeStyles({
    option: {
        "&:hover": {
            backgroundColor: "#ff7961 !important",
        },
    },
});
const defaultData = {
    id: null,
    user_id: null,
    income_type: "reservation",
    account: "", // Set default value to an empty string
    amount: "", // Set default value to an empty string
    description: "",
    reference: "",
    date: null,
    checkin_date: null,
    checkout_date: null,
    deposit: null,
    note: "",
    attachment: "",
    category: {}

}
const defaultReference = [
    {value: 'air-bnb', label: 'Airbnb'},
    {value: 'booking', label: 'Booking.com'},
    {value: 'vrbo', label: 'VRBO'},
    {value: 'expedia', label: 'Expedia'},
    {value: 'cash', label: 'Cash'},
    {value: 'cheque', label: 'Cheque'},
    {value: 'bankTransfer', label: 'Bank Transfer'},
];
const defaultIncomeType = [
    {value: 'reservation', label: 'Reservation'},
    {value: 'rent', label: 'Rent'},
    {value: 'electricity_bill', label: 'Electricity Bill'},
    {value: 'internet_bill', label: 'Internet Bill'},
    {value: 'service', label: 'Service Provide'},
    {value: 'others', label: 'Others'},
]
export default function IncomeForm({handelCloseModal, title, id}) {

    const classes = useStyles();

    const [income, setIncome] = useState(defaultData);
    const [incomeType, setIncomeType] = useState(defaultIncomeType);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [references, setReferences] = useState(defaultReference);
    const [accounts, setAccounts] = useState([]);
    const [reservationValidation, setReservationValidation] = useState('Select check in and check out dates.');
    const [reservationValidationClass, setReservationValidationClass] = useState('primary');
    const [csvCategoryValue, setCsvCategoryValue] = useState(null);
    const [showCSVModal, setShowCSVModal] = useState(false)
    const [channel, setChannel] = useState('airbnb')
    const [csvFile, setCSVFile] = useState({})

    // const {  need for update
    //     data: getSingleTaskData,
    //     isFetching: singleTaskFetching,
    //     isError: singleTaskDataError,
    // } = useGetSingleTaskDataQuery({
    //     id:id,
    // });
    const [createIncome] = useCreateIncomeMutation();

    const submit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("account", income.account.value);
        formData.append("income_type", income.income_type.value);
        formData.append("amount", income.amount);
        formData.append("category", income.category.value);
        formData.append("description", income.description);
        formData.append("note", income.note);
        formData.append("reference", income.reference.value);
        formData.append("date", income.date);
        formData.append("checkin_date", income.checkin_date);
        formData.append("checkout_date", income.checkout_date);
        formData.append("attachment", income.attachment);

        const url = id ? `/income/${id}` : `/income/add`;

        try {
            const data = await createIncome({url: url, formData}).unwrap();
            notification("success", data?.message, data?.description);
            handelCloseModal();
        } catch (err) {
            if (err.status === 406) {
                setShowExistingTask(true);
                setExistingTask(err?.errorData?.data);
            } else if (err.status === 422) {
                setErrors(err.errorData?.errors);
                notification("error", err?.message);
            } else {
                notification(
                    "error",
                    err?.message || "An error occurred",
                    err?.description || "Please try again later."
                );
                setErrors({});
            }
        }
    };

    const {
        data: getBankData,
        isFetching: bankIsFetching,
        isError: bankFetchingDataError,
    } = useGetBankDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const {
        data: getCategoryListData,
        isFetching: categoryIsFetching,
        isError: categoryFetchingDataError,
    } = useGetCategoryListDataQuery({
        categoryType: 'income'
    });
    const handleFileInputChange = (event, name) => {
        const file = event.target.files[0];
        setIncome({...income, attachment: file});
    };
    useEffect(() => {
        if (getBankData?.data.length > 0) {
            const modifiedAccounts = getBankData?.data.map(({id, bank_name, account_number}) => {
                return {
                    value: id,
                    label: bank_name + "(" + account_number + ")",
                }
            });
            setAccounts(modifiedAccounts);
        }

        if (getCategoryListData?.data.length > 0) {
            setCategories(getCategoryListData?.data);
        }

    }, [getBankData, getCategoryListData]);
    const handelCSVFileInputChange = (event) => {
        const file = event.target.files[0];
        setCSVFile({file: file})

    }
    const handleChangeToggle = (event) => {
        setChannel(event.target.value);
    };
    const handelCSVModal = (event) => {
        setShowCSVModal(!showCSVModal);
    }
    console.log(id);
    return (<>
            <Modal show={true} centered onHide={handelCloseModal} backdrop="static"
                   keyboard={false}
                   size={"lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Add new Income</span>
                    </Modal.Title>
                </Modal.Header>
                {
                    showCSVModal ?
                        <>
                            <Modal.Body>
                                {!income.id &&
                                    <Row>
                                        <div className={"text-end"}>
                                            <i><u><a onClick={handelCSVModal} className={"text-primary"}>add by manually?</a></u></i>
                                        </div>
                                    </Row>
                                }
                                <form className="custom-form">

                                    <div className="form-group">
                                        <label className='custom-form-label' htmlFor='csv_file'>
                                            Upload CSV file
                                        </label>
                                        <input
                                            className='custom-form-control'
                                            type='file'
                                            id={"csv_file"}
                                            onChange={handelCSVFileInputChange}
                                            placeholder='Attach CSV file here'
                                        />
                                    </div>

                                    <div className={"form-control"}>
                                        <FormControl>
                                            <FormLabel id="demo-controlled-radio-buttons-group">Channels</FormLabel>
                                            <RadioGroup
                                                aria-labelledby="demo-controlled-radio-buttons-group"
                                                name="controlled-radio-buttons-group"
                                                value={channel}
                                                onChange={handleChangeToggle}
                                            >
                                                <Box display={'flex'}>
                                                    <FormControlLabel value="airbnb" control={<Radio/>} label="Airbnb"/>
                                                    <FormControlLabel value="booking" control={<Radio/>}
                                                                      label="Booking.com"/>
                                                    <FormControlLabel value="vrbo" control={<Radio/>} label="VRBO"/>
                                                    <FormControlLabel value="experia" control={<Radio/>}
                                                                      label="Expedia"/>
                                                </Box>
                                            </RadioGroup>
                                        </FormControl></div>

                                    {
                                        channel === 'booking' &&
                                        <div className=''>
                                            <Autocomplete
                                                // value={expenseCategories[0]}
                                                classes={{option: classes.option}}
                                                options={incomeCategories}
                                                getOptionLabel={(option) => option.name}
                                                id='parentCategory'
                                                isOptionEqualToValue={(option, categoryValue) => option.id === categoryValue.id}
                                                value={csvCategoryValue}
                                                onChange={(ev, newValue) => {
                                                    if (newValue) {
                                                        setCsvCategoryValue(newValue)
                                                    }
                                                }}

                                                renderInput={(params) => (
                                                    <TextField
                                                        style={{backgroundColor: "#eeeeee"}}
                                                        {...params}
                                                        label='Income Category'
                                                        margin='normal'
                                                        placeholder='Income Category'
                                                    />
                                                )}
                                            />
                                        </div>

                                    }

                                </form>
                            </Modal.Body>
                        </> :
                        <>
                            <Modal.Body className={"add-or-update"}>
                                <Container>
                                    {!income.id &&
                                        <Row>
                                            <div className={"text-end"}>
                                                <i><u><a onClick={handelCSVModal} className={"text-primary"}>add income by CSV file?</a></u></i>
                                            </div>
                                        </Row>
                                    }
                                    <Row>
                                        <Col xs={12} md={12} lg={12} sm={12}>
                                            <Form.Group className="mb-3" controlId="description">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    autoFocus
                                                    rows={3}
                                                    value={income.description}
                                                    name={"description"}
                                                    onChange={(e) => {
                                                        setIncome({
                                                            ...income,
                                                            description: e.target.value,
                                                        });
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={6} lg={6} sm={12}>
                                            <Form.Group className="mb-3" controlId="amount">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="i.g: 50 AED"
                                                    value={income.amount}
                                                    onChange={(e) => {
                                                        setIncome({...income, amount: e.target.value});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6} lg={6} sm={12}>
                                            <Form.Group className="mb-3" controlId="account">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Account</Form.Label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={income.account}
                                                    isSearchable={true}
                                                    name="account"
                                                    isLoading={false}
                                                    options={accounts}
                                                    onChange={(e) => {
                                                        setIncome({...income, account: e});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={4} lg={4} sm={12}>
                                            <Form.Group className="mb-3" controlId="category_id">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Category</Form.Label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={income.category}
                                                    isSearchable={true}
                                                    name="category_id"
                                                    isLoading={categoryIsFetching}
                                                    options={categories}
                                                    onChange={(e) => {
                                                        setIncome({...income, category: e});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4} lg={4} sm={12}>
                                            <Form.Group className="mb-3" controlId="refrence">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Reference</Form.Label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={income.reference}
                                                    isSearchable={true}
                                                    name="reference"
                                                    isLoading={false}
                                                    options={references}
                                                    onChange={(e) => {
                                                        setIncome({...income, reference: e});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4} lg={4} sm={12}>
                                            <Form.Group className="mb-3" controlId="income_type">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Income Type</Form.Label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={income.income_type}
                                                    isSearchable={true}
                                                    name="income_type"
                                                    isLoading={false}
                                                    options={incomeType}
                                                    onChange={(e) => {
                                                        setIncome({...income, income_type: e});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={4} lg={4} sm={12}>
                                            <Form.Group className="mb-3" controlId="date">
                                                <Form.Label className="custom-form-label">Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={income.date}
                                                    onChange={(e) => {
                                                        setIncome({...income, date: e.target.value});
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        {
                                            income.income_type.value === 'reservation' &&
                                            <>
                                                <Col xs={12} md={4} lg={4} sm={12}>
                                                    <Form.Group className="mb-3" controlId="checkInDate">
                                                        <Form.Label className="custom-form-label">Check in
                                                            date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={income.checkin_date}
                                                            onChange={(e) => {
                                                                setIncome({...income, checkin_date: e.target.value});
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4} lg={4} sm={12}>
                                                    <Form.Group className="mb-3" controlId="checkOutDate">
                                                        <Form.Label className="custom-form-label">Checkout
                                                            Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={income.checkout_date}
                                                            onChange={(e) => {
                                                                setIncome({...income, checkout_date: e.target.value});
                                                                const validation = reservationValidationBuilder(income.checkin_date, e.target.value);
                                                                setReservationValidation(validation.message);
                                                                setReservationValidationClass(validation.class);
                                                            }}
                                                        />
                                                        <span className={'text-' + reservationValidationClass}>
                                                <small>{reservationValidation}</small>
                                            </span>
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        }
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={12} lg={12} sm={12}>
                                            <Form.Group className="mb-3" controlId="note">
                                                <Form.Label style={{marginBottom: '0px'}}
                                                            className="custom-form-label">Note</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    autoFocus
                                                    rows={3}
                                                    value={income.note}
                                                    name={"note"}
                                                    onChange={(e) => {
                                                        setIncome({
                                                            ...income,
                                                            note: e.target.value,
                                                        });
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={12} lg={12} sm={12}>
                                            <Form.Group className="mb-3" controlId="attachment">
                                                <Form.Label> Attachments</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleFileInputChange(e, 'id_copy')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Container>
                            </Modal.Body>
                        </>

                }

                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>
                        Add Task
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    )
}