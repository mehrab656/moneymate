import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosClient from "../../axios-client.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WizCard from "../../components/WizCard";
import {Box, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import MainLoader from "../../components/MainLoader.jsx";
import {notification} from "../../components/ToastNotification.jsx";
import {Col, Row} from "react-bootstrap";

const companyActivities = [
    'vacation homes rental',
    'grocery',
    'real estate',
    'printing',
    'shop',
    'restaurant',
    'super shop',
    'cleaning service',
    'management service',
]
const _initialCompany = {
    id: null,
    name: null,
    phone: null,
    email: null, // Set default value to an empty string
    address: null, // Set default value to an empty string
    activity: null,
    license_no: null,
    issue_date: null,
    expiry_date: null,
    registration_number: null,
    extra: null,
    logo: null,
};

export default function CompanyCreate() {
    let {uid} = useParams();

    const [companyData, setCompanyData] = useState(_initialCompany);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (uid) {
            setLoading(true);
            axiosClient
                .get(`/company/${uid}`)
                .then(({data}) => {

                    setCompanyData((prevCompanyData) => ({
                        ...prevCompanyData,
                        ...data,
                        date: data.date || "", // Set to empty string if the value is null or undefined
                    }));
                    setLoading(false);
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 400) {
                        setErrors(response.data.errors);
                    }
                    setLoading(false);
                });
        }
    }, []);

    // set default date(today)


    const submit = (event, stay) => {
        event.preventDefault();
        event.currentTarget.disabled = true;
        setLoading(true);
        const {
            name,
            phone,
            email,
            address,
            activity,
            license_no,
            issue_date,
            expiry_date,
            registration_number,
            extra,
            logo,
        } = companyData;
        let formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("email", email);
        formData.append("address", address);
        formData.append("activity", activity);
        formData.append("license_no", license_no);
        formData.append("issue_date", issue_date);
        formData.append("expiry_date", expiry_date);
        formData.append("registration_number", registration_number);
        formData.append("extra", extra);
        formData.append("logo", logo);

        //IF UPDATE
        if (uid) {
            axiosClient
                .post(`/company/update/${uid}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((data) => {
                    notification('success', data?.message, data?.description)
                    navigate("/companies");
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.response) {
                        const error = err.response.data
                        notification('error', error?.message, error.description)
                    }
                    setLoading(false);
                });
        } else { //create new one
            axiosClient
                .post("/addCompany", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((data) => {

                    notification('success', data?.message, data?.description);
                    navigate("/companies");
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.response) {
                        const error = err.response.data;
                        notification('error', error?.message, error.description)
                    }
                    setLoading(false);
                });
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setCompanyData((prevCompanyData) => {
            return {...prevCompanyData, logo: file};
        });
    };


    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <WizCard className='animated fadeInDown wiz-card-mh'>
                {uid && (
                    <h1 className='title-text mb-0'>{companyData.name}</h1>
                )}

                {loading && <div className='text-center'>Loading...</div>}

                {!loading && (
                    <form>
                        <div className='row'>
                            <div className='col-md-6'>
                                {/*name*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label
                                            className='custom-form-label'
                                            htmlFor='company_name'>
                                            Name
                                        </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            value={companyData.name === null ? "" : companyData.name}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, name: ev.target.value})
                                            }
                                            placeholder='Company Name. ig: ABC company'
                                        />
                                        {errors.name && (
                                            <p className='error-message mt-2'>{errors.name[0]}</p>
                                        )}
                                    </Col>
                                </Row>

                                {/*phone*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label className='custom-form-label' htmlFor='phone'>
                                            Phone
                                        </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            type='text'
                                            value={companyData.phone === null ? "" : companyData.phone}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, phone: ev.target.value})
                                            }
                                            placeholder='Phone. ig: +971... or 0567...'
                                        />
                                        {errors.phone && (
                                            <p className='error-message mt-2'>{errors.phone[0]}</p>
                                        )}
                                    </Col>
                                </Row>

                                {/*email*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label className='custom-form-label' htmlFor='email'>
                                            Email
                                        </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            type='text'
                                            value={companyData.email === null ? "" : companyData.email}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, email: ev.target.value})
                                            }
                                            placeholder='Email. ig: abc@...com'
                                        />
                                        {errors.email && (
                                            <p className='error-message mt-2'>{errors.email[0]}</p>
                                        )}
                                    </Col>
                                </Row>

                                {/*address*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label className='custom-form-label' htmlFor='address'>
                                            Address
                                        </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            type='text'
                                            value={companyData.address === null ? "" : companyData.address}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, address: ev.target.value})
                                            }
                                            placeholder='Address. Area: abc, Flat:#33...'
                                        />
                                        {errors.address && (
                                            <p className='error-message mt-2'>{errors.address[0]}</p>
                                        )}
                                    </Col>
                                </Row>
                                {/*activity*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label
                                            className='custom-form-label'
                                            htmlFor='company-activity-select'>
                                            Activity
                                        </label>

                                        <InputLabel id='company-activity-select'></InputLabel>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <Box sx={{minWidth: 120}}>
                                            <FormControl fullWidth>
                                                <InputLabel id='company-activity-select'>Activity</InputLabel>

                                                <Select
                                                    labelId='company-activity-select'
                                                    id='complay-activities'
                                                    value={companyData.activity?.toLowerCase() || ""}
                                                    label='Activity'
                                                    onChange={(e) => setCompanyData({
                                                        ...companyData,
                                                        activity: e.target.value
                                                    })}
                                                >
                                                    <MenuItem defaultValue={''}>{"Select Company Activity"}</MenuItem>

                                                    {
                                                        companyActivities.map(activity => (
                                                            <MenuItem key={activity}
                                                                      value={activity}>{activity.toUpperCase()}</MenuItem>

                                                        ))
                                                    }

                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Col>
                                </Row>
                            </div>
                            <div className='col-md-6'>
                                {/*license no*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={4}>
                                        <label className='custom-form-label' htmlFor='license_no'>
                                            License No.
                                        </label>
                                    </Col>
                                    <Col xs={12} md={8}>
                                        <input
                                            className='custom-form-control'
                                            value={companyData.license_no === null ? "" : companyData.license_no}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, license_no: ev.target.value})
                                            }
                                            placeholder='License Number'
                                        />
                                    </Col>
                                </Row>
                                {/*Reg. No.*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={4}>
                                        <label className='custom-form-label' htmlFor='registration_number'>
                                            Registration No.
                                        </label>
                                    </Col>
                                    <Col xs={12} md={8}>
                                        <input
                                            className='custom-form-control'
                                            value={companyData.registration_number !== "null" ? companyData.registration_number : ""}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, registration_number: ev.target.value})
                                            }
                                            placeholder='Registration Number'
                                        />
                                    </Col>
                                </Row>
                                {/*issue Data*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={4}>
                                        <label className='custom-form-label' htmlFor='issue-date'>
                                            Issue Date
                                        </label>
                                    </Col>
                                    <Col xs={12} md={8}>
                                        <DatePicker
                                            className='custom-form-control'
                                            selected={companyData.issue_date ? new Date(companyData.issue_date) : new Date()}
                                            onChange={(date) => {
                                                const selectedDate = date ? new Date(date) : null;
                                                const updatedDate =
                                                    selectedDate && !companyData.issue_date
                                                        ? new Date(
                                                            selectedDate.getTime() + 24 * 60 * 60 * 1000
                                                        )
                                                        : selectedDate;
                                                setCompanyData({
                                                    ...companyData,
                                                    issue_date: updatedDate
                                                        ? updatedDate.toISOString().split("T")[0]
                                                        : "",
                                                });
                                            }}
                                            dateFormat='yyyy-MM-dd'
                                            placeholderText='Company License issue date'
                                        />
                                        {errors.issue_date && (
                                            <p className='error-message mt-2'>{errors.issue_date[0]}</p>
                                        )}
                                    </Col>
                                </Row>

                                {/*expiry Data*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={4}><label className='custom-form-label' htmlFor='expiry-date'>
                                        Expiry Date
                                    </label>
                                    </Col>
                                    <Col xs={12} md={8}>
                                        <DatePicker
                                            className='custom-form-control'
                                            selected={companyData.expiry_date ? new Date(companyData.expiry_date) : new Date()}
                                            onChange={(date) => {
                                                const selectedDate = date ? new Date(date) : null;
                                                const updatedDate =
                                                    selectedDate && !companyData.expiry_date
                                                        ? new Date(
                                                            selectedDate.getTime() + 24 * 60 * 60 * 1000
                                                        )
                                                        : selectedDate;
                                                setCompanyData({
                                                    ...companyData,
                                                    expiry_date: updatedDate
                                                        ? updatedDate.toISOString().split("T")[0]
                                                        : "",
                                                });
                                            }}
                                            dateFormat='yyyy-MM-dd'
                                            placeholderText='Company License Expiry date'
                                        />
                                        {errors.expiry_date && (
                                            <p className='error-message mt-2'>{errors.expiry_date[0]}</p>
                                        )}
                                    </Col>
                                </Row>
                                {/*Extra.*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}>
                                        <label className='custom-form-label' htmlFor='extra'>
                                            Extra.
                                        </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            value={companyData.extra !== "null" ? companyData.extra : ""}
                                            onChange={(ev) =>
                                                setCompanyData({...companyData, extra: ev.target.value})
                                            }
                                            placeholder='Extra'
                                        />
                                    </Col>
                                </Row>
                                {/*logo*/}
                                <Row className={"mt-2"}>
                                    <Col xs={12} md={2}><label className='custom-form-label' htmlFor='comapny_logo'>
                                        Logo
                                    </label>
                                    </Col>
                                    <Col xs={12} md={10}>
                                        <input
                                            className='custom-form-control'
                                            type='file'
                                            onChange={handleFileInputChange}
                                            placeholder='Company Logo'
                                        />
                                    </Col>
                                </Row>
                            </div>

                        </div>

                        <div className='buttonGroups text-end'>
                            {uid && (
                                <button
                                    onClick={(e) => submit(e, false)}
                                    className={"btn btn-warning mt-2"}>
                                    {"Update"}
                                </button>
                            )}

                            {!uid && (
                                <>
                                    <button onClick={(e) => submit(e, true)}
                                            className={"custom-btn btn-add mt-2"}>
                                        {"Save"}
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
