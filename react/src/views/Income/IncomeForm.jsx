import {Col, Container, Form, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@mui/styles";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";
import {useGetCategoryListDataQuery} from "../../api/slices/categorySlice.js";
import Select from "react-select";

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

    // const {  need for update
    //     data: getSingleTaskData,
    //     isFetching: singleTaskFetching,
    //     isError: singleTaskDataError,
    // } = useGetSingleTaskDataQuery({
    //     id:id,
    // });

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
        categoryType:'income'
    });

    useEffect(() => {
        if (getBankData?.data.length > 0) {
            setAccounts(getBankData?.data);
        }

        if (getCategoryListData?.data.length > 0) {
            setCategories(getCategoryListData?.data);
        }

    }, [getBankData, getCategoryListData]);

    console.log(categories);
    return (<>
            <Modal show={true} centered onHide={handelCloseModal} backdrop="static"
                   keyboard={false}
                   size={"lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Add new Income</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col xs={12} md={12} lg={12} sm={12}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Description</Form.Label>
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
                                    {errors.description && (
                                        <p className="error-message mt-2">
                                            {errors.description[0]}
                                        </p>
                                    )}
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
                                    {errors.type && (
                                        <p className="error-message mt-2">{errors.type[0]}</p>
                                    )}
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
                                    {errors.type && (
                                        <p className="error-message mt-2">{errors.type[0]}</p>
                                    )}
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
                                    {errors.type && (
                                        <p className="error-message mt-2">{errors.type[0]}</p>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className={'mb-3'}>

                            <Col xs={12} md={4} lg={4} sm={12}>
                                <Form.Group className="mb-3" controlId="date">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={income.date}
                                        onChange={(e) => {
                                            setIncome({...income, date: e.target.value});
                                        }}
                                    />
                                    {errors.date && (
                                        <p className="error-message mt-2">{errors.date[0]}</p>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handelCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

        </>
    )
}