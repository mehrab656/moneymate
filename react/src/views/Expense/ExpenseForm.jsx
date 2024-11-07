import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosClient from "../../axios-client.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WizCard from "../../components/WizCard.jsx";

import {makeStyles} from "@mui/styles";
import MainLoader from "../../components/MainLoader.jsx";
import {notification} from "../../components/ToastNotification.jsx";
import {Col, Form, Modal, Row, Button} from "react-bootstrap";
import {useCreateExpenseMutation, useGetSingleExpenseDataQuery} from "../../api/slices/expenseSlice.js";
import Select from "react-select";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";
import {useGetCategoryListDataQuery} from "../../api/slices/categorySlice.js";

const _initialExpense = {
    id: null,
    amount: "", // Set default value to an empty string
    refundable_amount: 0, // Set default value to an empty string
    description: "",
    reference: "",
    date: "",
    note: "",
    attachment: "",
    account: [],
    category: [],

};
export default function ExpenseForm({handelCloseModal, id}) {
    const [expense, setExpense] = useState(_initialExpense);
    const [loading, setLoading] = useState(false);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [saveBtnTxt, setSaveBtnTxt] = useState('Save');
    const [comboBtnTxt, setComboBtnTxt] = useState('Save & Exit');
    // api call
    const {
        data: getBankData,
    } = useGetBankDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const {
        data: getCategoryListData,
        isFetching: categoryIsFetching,
    } = useGetCategoryListDataQuery({
        categoryType: 'expense'
    });
    const {
        data: getSingleExpenseData,
    } = useGetSingleExpenseDataQuery({
        id: id,
    });
    const [createExpense] = useCreateExpenseMutation();

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

        if(id){
            if ( id && getSingleExpenseData?.data) {

                setExpense(getSingleExpenseData?.data);
            }
        }
    }, [id, getSingleExpenseData, getBankData]);

    // set some default data
    useEffect(() => {
        if (expense?.date === "") {
            setExpense({
                ...expense,
                date: new Date().toISOString().split("T")[0],
            });
        }
    }, [expense?.date]);

    const expenseSubmit = async (event) => {
        event.preventDefault();
        setSaveBtnTxt('Saving...');
        // event.currentTarget.disabled = true;

        const formData = new FormData();
        formData.append("account_id", expense.account.value);
        formData.append("amount", expense.amount);
        formData.append("refundable_amount", expense.refundable_amount);
        formData.append("category_id", expense.category.value);
        formData.append("description", expense.description);
        formData.append("note", expense.note);
        formData.append("reference", expense.reference);
        formData.append("date", expense.date);
        formData.append("attachment", expense.attachment);

        const url = expense.id ? `/expense/${expense?.id}` : "/expense/add";
        try {
            const data = await createExpense({url: url, formData}).unwrap();
            notification("success", data?.message, data?.description);
            handelCloseModal();
        } catch (err) {
            notification(
                "error",
                err?.message || "An error occurred",
                err?.description || "Please try again later."
            );
        }
    };


    const handleFileInputChange = (event, name) => {
        const file = event.target.files[0];
        setExpense({...expense, attachment: file});
    };
    return (
        <>
            <Modal
                show={true}
                centered
                onHide={handelCloseModal}
                backdrop="static"
                keyboard={false}
                size={"lg"}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{id ? "Update" : "Add"} Expense</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MainLoader loaderVisible={loading}/>
                    <WizCard className="animated fadeInDown">
                        <Form>
                            <Row>
                                <Col xs={12} md={12} lg={12} sm={12}>
                                    <Form.Group className="mb-3" controlId="description">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            autoFocus
                                            rows={3}
                                            value={expense.description}
                                            name={"description"}
                                            onChange={(e) => {
                                                setExpense({
                                                    ...expense,
                                                    description: e.target.value,
                                                });
                                            }}
                                            placeholder="Enter description"
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
                                            value={expense.amount}
                                            onChange={(e) => {
                                                setExpense({...expense, amount: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="refundable_amount">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Refundable Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="i.g: 50 AED"
                                            value={expense.refundable_amount}
                                            onChange={(e) => {
                                                setExpense({...expense, refundable_amount: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="account">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Account</Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={expense.account}
                                            isSearchable={true}
                                            name="account"
                                            isLoading={false}
                                            options={accounts}
                                            onChange={(e) => {
                                                setExpense({...expense, account: e});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="category_id">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Category</Form.Label>
                                        <Select
                                            className="basic-single"
                                            classNamePrefix="select"
                                            value={expense.category}
                                            isSearchable={true}
                                            name="category_id"
                                            isLoading={categoryIsFetching}
                                            options={categories}
                                            onChange={(e) => {
                                                setExpense({...expense, category: e});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="date">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={expense.date}
                                            onChange={(e) => {
                                                setExpense({...expense, date: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="reference">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Reference</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="i.g: 50 AED"
                                            value={expense.reference}
                                            onChange={(e) => {
                                                setExpense({...expense, reference: e.target.value});
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>


                            <Row>
                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3" controlId="note">
                                        <Form.Label style={{marginBottom: '0px'}}
                                                    className="custom-form-label">Note</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={expense.note}
                                            name={"note"}
                                            onChange={(e) => {
                                                setExpense({
                                                    ...expense,
                                                    note: e.target.value,
                                                });
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={6} lg={6} sm={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Add Attachment</Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={handleFileInputChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="text-end">
                                {expense.id ? (
                                    <Button
                                        variant="warning"
                                        onClick={(e) => expenseSubmit(e)}
                                    >
                                        Update
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="primary"
                                            onClick={(e) => expenseSubmit(e)}
                                            className="me-2 btn-sm">{saveBtnTxt}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Form>
                    </WizCard>
                </Modal.Body>
            </Modal>
        </>
    );
}
