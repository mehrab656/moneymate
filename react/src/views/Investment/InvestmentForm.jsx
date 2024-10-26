import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {Form} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import {notification} from "../../components/ToastNotification.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import {
    useGetInvestmentDataQuery,
    useCreateInvestmentMutation,
    useGetSingleInvestmentDataQuery, useUpdateInvestmentMutation
} from "../../api/slices/investmentSlice.js";
import {useGetUserDataQuery, useGetInvestorDataQuery} from "../../api/slices/userSlice.js"
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBank} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

const defaultInvestmentData = {
    id: null,
    investor_id: null,
    investor: [],
    account_id: null,
    amount: '',
    investment_date: '',
    note: '',
};

function InvestmentForm({handelCloseModal, title, id}) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [investment, setInvestmentData] = useState(defaultInvestmentData);
    const [showExistingInvestment, setShowExistingInvestment] = useState(false);
    const [existingInvestment, setExistingInvestment] = useState({});
    const [users, setUsers] = useState([]);
    const {
        data: getInvestorData,
        isFetching: investorIsFetching,
        isError: investorFetchingDataError,
    } = useGetInvestorDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const {
        data: getBankData,
        isFetching: bankIsFetching,
        isError: bankFetchingDataError,
    } = useGetBankDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const {
        data: getSingleInvestmentData,
        isFetching: singleInvestmentFetching,
        isError: singleInvestmentDataError,
    } = useGetSingleInvestmentDataQuery({
        id: id,
    });

    const modifiedUserData = getInvestorData?.data.map(({slug, full_name}) => {
        return {
            value: slug,
            label: full_name
        }
    });

    const modifiedAccountData = getBankData?.data.map(({id, bank_name, account_number}) => {
        return {
            value: id,
            label: bank_name + '(' + account_number + ')'
        }
    })

    const [createInvestment] = useCreateInvestmentMutation();

    const submit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("account_id", investment.account_id);
        formData.append("amount", investment.amount);
        formData.append("investor_id", investment.investor_id);
        formData.append("note", investment.note);
        formData.append("investment_date", investment.investment_date);
        const url = id ? `/investment/${id}` : `/investment/add`;

        try {
            const data = await createInvestment({url: url, formData}).unwrap();
            notification("success", data?.message, data?.description);
            handelCloseModal();
        } catch (err) {
            if (err.status === 406) {
                setShowExistingInvestment(true);
                setExistingInvestment(err?.errorData?.data);
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
    useEffect(() => {
        if (id && getSingleInvestmentData?.data) {
            setInvestmentData(getSingleInvestmentData?.data);
        }
    }, [getSingleInvestmentData?.data]);
    console.log(id);
    return (
        <>
            <MainLoader loaderVisible={loading}/>
            <Modal
                show={true}
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={"lg"}
                // fullscreen={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{title.toUpperCase()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <div className="alert alert-warning" role="alert">
                            If you forgot to add any INVESTOR, please Click here to add <Link
                            className="custom-btn btn-add" to={''}>
                            <FontAwesomeIcon icon={faBank}/> Add New Investor</Link>.
                        </div>
                        <Form>
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="investment_users">
                                        <Form.Label>Investor</Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            defaultValue={investment.investor}
                                            isSearchable={true}
                                            name="investment-user"
                                            isClearable={true}
                                            isLoading={investorIsFetching}
                                            options={modifiedUserData}
                                            onChange={(e) => {
                                                if (e !== null) {
                                                    setInvestmentData({...investment, investor_id: e.value});
                                                }
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="bank_account">
                                        <Form.Label>Bank Account</Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            isSearchable={true}
                                            name="bank-account"
                                            isClearable={true}
                                            isLoading={bankIsFetching}
                                            options={modifiedAccountData}
                                            onChange={(e) => {
                                                if (e !== null) {
                                                    setInvestmentData({...investment, account_id: e.value});
                                                }
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                            </Row>
                            <Row>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="date">
                                        <Form.Label>Amount(*)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={investment.amount || ""}
                                            onChange={(e) => {
                                                setInvestmentData({...investment, amount: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="date">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={investment.investment_date || ''}
                                            onChange={(e) => {
                                                setInvestmentData({...investment, investment_date: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <hr className={"border-danger"}/>
                            <Row>
                                <Col xs={12} md={12} lg={12} sm={12}>
                                    <Form.Group className="mb-3" controlId="note">
                                        <Form.Label>Note</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            autoFocus
                                            rows={3}
                                            value={investment.note}
                                            name={"note"}
                                            onChange={(e) => {
                                                setInvestmentData({
                                                    ...investment,
                                                    note: e.target.value,
                                                });
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>
                        Add Investment
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default InvestmentForm;
