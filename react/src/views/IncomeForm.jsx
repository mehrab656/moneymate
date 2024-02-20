import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WizCard from "../components/WizCard";
import {TextField, Autocomplete, Box, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import {makeStyles} from "@mui/styles";
import MainLoader from "../components/MainLoader.jsx";

const useStyles = makeStyles({
    option: {
        "&:hover": {
            backgroundColor: "#ff7961 !important",
        },
    },
});

export default function IncomeForm() {
    const classes = useStyles();
    let {id} = useParams();

    const [income, setIncome] = useState({
        id: null,
        user_id: null,
        income_type: "reservation",
        account_id: "", // Set default value to an empty string
        amount: "", // Set default value to an empty string
        category_id: null,
        description: "",
        reference: "",
        date: null,
        checkin_date: null,
        checkout_date: null,
        deposit: null,
        note: "",
        attachment: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const {setNotification} = useStateContext();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [selectedIncomeType, setIncomeType] = useState("reservation");
    const navigate = useNavigate();

    const [categoryValue, setCategoryValue] = useState(null);
    const [storeCategoryValue, setStoreCategoryValue] = useState(null);
    useEffect(() => {

        axiosClient
            .get("/all-bank-account")
            .then(({data}) => {
                setSelectedAccountId(data.data[0].id);
                setBankAccounts(data.data);
            })
            .catch((error) => {
                console.warn("Error fetching bank accounts:", error);
            });
        axiosClient
            .get("/income-categories")
            .then(({data}) => {
                setIncomeCategories(data.categories);
            })
            .catch((error) => {
                console.error("Error loading income categories:", error);
                // handle error, e.g., show an error message to the user
            });
    }, []);

    //set default category value
    useEffect(() => {
        if (incomeCategories && incomeCategories.length > 0 && !id) {
            setCategoryValue(incomeCategories[0]);
        }
        if (storeCategoryValue !== null && id) {
            setCategoryValue(storeCategoryValue);
        }
    }, []);

    useEffect(() => {
        // get the incomes first if its update
        if (id) {
            setLoading(true);
            axiosClient
                .get(`/income/${id}`)
                .then(({data}) => {
                    setSelectedAccountId(data.account_id);
                    setIncomeType(data.income_type);
                    if (incomeCategories.length > 0) {
                        incomeCategories.forEach((element) => {
                            if (element.id === data.category_id) {
                                setStoreCategoryValue(element);
                            }
                        });
                    }
                    setIncome((prevIncome) => ({
                        ...prevIncome,
                        ...data,
                        date: data.date || "", // Set to empty string if the value is null or undefined
                    }));
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id, incomeCategories]);

    // set default date(today)
    useEffect(() => {
        if (income?.date === null) {
            setIncome({
                ...income,
                date: new Date().toISOString().split("T")[0],
            });
        }
    }, [income?.date]);

    const incomeSubmit = (event, stay) => {
        event.preventDefault();
        event.currentTarget.disabled = true;
        setLoading(true);
        if (income.id) {
            const {
                description,
                amount,
                reference,
                date,
                checkin_date,
                checkout_date,
                note,
                attachment
            } = income;
            const formData = new FormData();
            formData.append("account_id", selectedAccountId);
            // formData.append("income_type", selectedIncomeType);
            formData.append("amount", amount);
            formData.append("category_id", categoryValue.id);
            formData.append("description", description);
            formData.append("note", note);
            formData.append("reference", reference);
            formData.append("date", date);
            formData.append("checkin_date", checkin_date);
            formData.append("checkout_date", checkout_date);
            formData.append("attachment", attachment);

            axiosClient
                .post(`/income/${income.id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then(() => {

                    setNotification("Income data has been updated");
                    if (stay === true) {
                        window.location.reload();
                    } else {
                        navigate("/incomes");
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                    setLoading(false);
                });
        } else {
            const {
                income_type,
                amount,
                description,
                reference,
                date,
                checkin_date,
                checkout_date,
                note,
                attachment
            } = income;
            const formData = new FormData();
            formData.append("account_id", selectedAccountId);
            formData.append("income_type", income_type);
            formData.append("amount", amount);
            formData.append("category_id", categoryValue.id);
            formData.append("description", description);
            formData.append("note", note);
            formData.append("reference", reference);
            formData.append("date", date);
            formData.append("checkin_date", checkin_date);
            formData.append("checkout_date", checkout_date);
            formData.append("attachment", attachment);

            axiosClient
                .post("/income/add", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then(() => {
                    setNotification("Income has been added.");
                    if (stay === true) {
                        window.location.reload();
                    } else {
                        navigate("/incomes");
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    const response = error.response;
                    setErrors(response.data.errors);
                    setLoading(false);
                });
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setIncome((prevIncome) => {
            return {...prevIncome, attachment: file};
        });
    };

//   console.log('reference', income.reference)

    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className='animated fadeInDown wiz-card-mh'>
                {income.id && (
                    <h1 className='title-text mb-0'>{income.description}</h1>
                )}
                {!income.id && <h1 className='title-text mb-0'>Add New Income</h1>}

                {loading && <div className='text-center'>Loading...</div>}

                {!loading && (
                    <form>
                        <div className='row'>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label
                                        className='custom-form-label'
                                        htmlFor='income_description'
                                    >
                                        Description
                                    </label>
                                    <input
                                        className='custom-form-control'
                                        value={
                                            income.description !== "null" ? income.description : ""
                                        }
                                        onChange={(ev) =>
                                            setIncome({...income, description: ev.target.value})
                                        }
                                        placeholder='Description'
                                    />
                                </div>
                                <div className=''>
                                    <Autocomplete
                                        // value={expenseCategories[0]}
                                        classes={{option: classes.option}}
                                        options={incomeCategories}
                                        getOptionLabel={(option) => option.name}
                                        id='parentCategory'
                                        isOptionEqualToValue={(option, categoryValue) => option.id === categoryValue.id}
                                        value={categoryValue}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setCategoryValue(newValue);
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
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='income_amount'>
                                        Amount
                                    </label>
                                    <input
                                        className='custom-form-control'
                                        type='number'
                                        step='any'
                                        value={income.amount || ""}
                                        onChange={(ev) =>
                                            setIncome({...income, amount: ev.target.value})
                                        }
                                        placeholder='Amount'
                                    />
                                    {errors.amount && (
                                        <p className='error-message mt-2'>{errors.amount[0]}</p>
                                    )}
                                </div>
                                <div className='form-group'>
                                    <Box sx={{minWidth: 120}}>
                                        <FormControl fullWidth>
                                            <InputLabel id='demo-simple-select-label'>Reference</InputLabel>
                                            <Select
                                                labelId='demo-simple-select-label'
                                                id='demo-simple-select'
                                                value={income.reference}
                                                label='Reference'
                                                onChange={(e) => setIncome({...income, reference: e.target.value})}
                                            >
                                                <MenuItem value={'air-bnb'}>Air Bnb</MenuItem>
                                                <MenuItem value={'booking'}>Booking.com</MenuItem>
                                                <MenuItem value={'vrbo'}>VRBO</MenuItem>
                                                <MenuItem value={'expedia'}>Expedia</MenuItem>
                                                <MenuItem value={'cash'}>Cash</MenuItem>
                                                <MenuItem value={'cheque'}>Cheque</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </div>
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='income_type'>
                                        Select Income Type
                                    </label>
                                    <select
                                        className='custom-form-control'
                                        value={selectedIncomeType}
                                        disabled={!!id}
                                        id='income_type'
                                        name='income_type'
                                        onChange={(event) => {
                                            const value = event.target.value || "";
                                            setIncomeType(value);
                                            setIncome({...income, income_type: value});
                                        }}
                                    >
                                        <option defaultValue>Select income type</option>
                                        <option key={"income_type_reservation"} value={'reservation'}>Reservation
                                        </option>
                                        <option key={"income_type_electricity_bill"}
                                                value={'electricity_bill'}>Electricity Bill
                                        </option>
                                        <option key={"income_type_internet_bill"} value={'internet_bill'}>Internet
                                            Bill
                                        </option>
                                        <option key={"income_type_rent"} value={'rent'}>Rent
                                        </option>
                                    </select>
                                    {errors.account_id && (
                                        <p className='error-message mt-2'>{errors.account_id[0]}</p>
                                    )}
                                </div>
                                {
                                    selectedIncomeType === 'reservation' &&
                                    <div className='form-group'>
                                        <label className='custom-form-label' htmlFor='checkin_date'>
                                            Check in date
                                        </label>
                                        <DatePicker
                                            className='custom-form-control'
                                            selected={income.checkin_date ? new Date(income.checkin_date) : new Date()}
                                            onChange={(date) => {
                                                const selectedDate = date ? new Date(date) : null;
                                                const updatedDate =
                                                    selectedDate && !income.checkin_date
                                                        ? new Date(
                                                            selectedDate.getTime() + 24 * 60 * 60 * 1000
                                                        )
                                                        : selectedDate;
                                                setIncome({
                                                    ...income,
                                                    checkin_date: updatedDate
                                                        ? updatedDate.toISOString().split("T")[0]
                                                        : "",
                                                });
                                            }}
                                            dateFormat='yyyy-MM-dd'
                                            placeholderText='Check In Date'
                                        />
                                        {errors.date && (
                                            <p className='error-message mt-2'>{errors.checkin_date[0]}</p>
                                        )}
                                    </div>
                                }
                            </div>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='date'>
                                        Date
                                    </label>
                                    <DatePicker
                                        className='custom-form-control'
                                        selected={income.date ? new Date(income.date) : new Date()}
                                        onChange={(date) => {
                                            const selectedDate = date ? new Date(date) : null;
                                            const updatedDate =
                                                selectedDate && !income.date
                                                    ? new Date(
                                                        selectedDate.getTime() + 24 * 60 * 60 * 1000
                                                    )
                                                    : selectedDate;
                                            setIncome({
                                                ...income,
                                                date: updatedDate
                                                    ? updatedDate.toISOString().split("T")[0]
                                                    : "",
                                            });
                                        }}
                                        dateFormat='yyyy-MM-dd'
                                        placeholderText='Income Date'
                                    />
                                    {errors.date && (
                                        <p className='error-message mt-2'>{errors.date[0]}</p>
                                    )}
                                </div>
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='bank_account'>
                                        Select Bank Account
                                    </label>
                                    <select
                                        className='custom-form-control'
                                        value={selectedAccountId}
                                        id='bank-account'
                                        name='bank-account'
                                        onChange={(event) => {
                                            const value = event.target.value || "";
                                            setSelectedAccountId(value);
                                            setIncome({...income, account_id: parseInt(value)});
                                        }}
                                    >
                                        <option defaultValue>Select a bank account</option>
                                        {bankAccounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.bank_name} - {account.account_number} - Balance
                                                ({account.balance})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.account_id && (
                                        <p className='error-message mt-2'>{errors.account_id[0]}</p>
                                    )}
                                </div>
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='note'>
                                        Note
                                    </label>
                                    <input
                                        className='custom-form-control'
                                        value={income.note !== "null" ? income.note : ""}
                                        onChange={(ev) =>
                                            setIncome({...income, note: ev.target.value})
                                        }
                                        placeholder='Additional Note'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label className='custom-form-label' htmlFor='account_name'>
                                        Add Attachment
                                    </label>
                                    <input
                                        className='custom-form-control'
                                        type='file'
                                        onChange={handleFileInputChange}
                                        placeholder='Attachment'
                                    />
                                </div>
                                {
                                    selectedIncomeType === 'reservation' &&
                                    <div className='form-group'>
                                        <label className='custom-form-label' htmlFor='date'>
                                            Checkout Date
                                        </label>
                                        <DatePicker
                                            className='custom-form-control'
                                            selected={income.checkout_date ? new Date(income.checkout_date) : new Date()}
                                            onChange={(date) => {
                                                const selectedDate = date ? new Date(date) : null;
                                                const updatedDate =
                                                    selectedDate && !income.date
                                                        ? new Date(
                                                            selectedDate.getTime() + 24 * 60 * 60 * 1000
                                                        )
                                                        : selectedDate;
                                                setIncome({
                                                    ...income,
                                                    checkout_date: updatedDate
                                                        ? updatedDate.toISOString().split("T")[0]
                                                        : "",
                                                });
                                            }}
                                            dateFormat='yyyy-MM-dd'
                                            placeholderText='Checkout Date'
                                        />
                                        {errors.date && (
                                            <p className='error-message mt-2'>{errors.date[0]}</p>
                                        )}
                                    </div>
                                }
                            </div>

                        </div>

                        <div className='buttonGroups text-end'>
                            {income.id && (
                                <button
                                    onClick={(e) => incomeSubmit(e, false)}
                                    className={"btn btn-warning"}>
                                    {"Update"}
                                </button>
                            )}

                            {!income.id && (
                                <>
                                    <button
                                        onClick={(e) => incomeSubmit(e, true)}
                                        className={"custom-btn btn-add"}
                                    >
                                        {"Save"}
                                    </button>
                                    <button
                                        onClick={(e) => incomeSubmit(e, false)}
                                        className={"custom-btn btn-add ml-3"}
                                    >
                                        Save & Exit
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                )}
            </WizCard>
        </>
    );
}
