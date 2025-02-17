import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import {Form} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {notification} from "../../components/ToastNotification.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import {useGetBankDataQuery} from "../../api/slices/bankSlice.js";
import Select from "react-select";
import {genRand} from "../../helper/HelperFunctions.js";
import {TextField} from "@mui/material";
import {useCreateDebtMutation} from "../../api/slices/debtSlice.js";

const defaultDebtData = {
    amount:{
        label:'',
        value:''
    },
    person: '',
    date: '',
    note: '',
    account: {
        label:'',
        value:''
    },
    type: {
        label:'',
        value:''
    },
};

const types = [
    {
        label:'Lend(Give Loan to Others)',
        value:'lend'
    },
    {
        label:'Borrow(Taken Loan From Others)',
        value:'borrow'
    }
]
export default function DebtCreate({show, closeFunc}) {
    let {id} = useParams();
    const [debt, setDebt] = useState(defaultDebtData);
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);

    const {
        data: getBankData,
    } = useGetBankDataQuery({
        currentPage: "",
        pageSize: 100,
    });

    const [createDebt] = useCreateDebtMutation();
    const submit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('amount', debt.amount);
        formData.append('date', debt.date);
        formData.append('person', debt.person);
        formData.append('account_id', debt.account.value);
        formData.append('note', debt.note);
        formData.append('type', debt.type.value);

        try {
            const data = await createDebt({url: '/debts/store', formData}).unwrap();
            notification("success", data?.message, data?.description);
            closeFunc();
        }catch (err) {
            notification(
                "error",
                err?.message || "An error occurred",
                err?.description || "Please try again later."
            );
        }
    }

    const handleChange = (e, index) => {
        setDebt({...debt, [index]:e.target.value});
    }
    const inputs = [
        [{
            name: 'amount',
            type: 'number',
            label: 'Amount',
            placeholder: 'Input an amount...',
            size: 'small',
            colXS: 12,
            colMD: 6,
            col: 12,
            value:debt.amount,
            shrink:true

        },
            {
                name: 'person',
                type: 'text',
                label: 'Person',
                placeholder: 'Input person name...',
                size: 'small',
                colXS: 12,
                colMD: 6,
                col: 12,
                value:debt.person,
                shrink:true

            }],
        [{
            name: 'date',
            type: 'date',
            label: 'Date',
            placeholder: 'date...',
            size: 'small',
            colXS: 12,
            colMD: 6,
            col: 12,
            value:debt.date,
            shrink:true
        },
            {
                name: 'account',
                type: 'select',
                label: 'Bank Account',
                placeholder: 'Select Bank Account',
                size: 'small',
                colXS: 12,
                colMD: 6,
                col: 12,
                value:debt.account,
                shrink:true,
                options:accounts
            }
        ],
        [{
            name: 'type',
            type: 'select',
            label: 'Debt Type',
            placeholder: 'Select Debt Type',
            size: 'small',
            colXS: 12,
            colMD: 6,
            col: 12,
            value:debt.type,
            shrink:true,
            options:types
        },
            {
                name: 'note',
                type: 'text',
                label: 'Note',
                placeholder: 'Note...',
                size: 'small',
                colXS: 12,
                colMD: 6,
                col: 12,
                value:debt.note,
                shrink:true
            }
        ]
    ];

    const makeColumns = columns => {
        return columns.map(({colXS,shrink, options,colMD, type, label, name, size,value}) => (
            <Col sm={colXS} md={colMD} key={'debt-col-' + genRand(8)}>
                {

                    type==='select'?
                        <>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                value={value}
                                isSearchable={true}
                                name={name}
                                isLoading={false}
                                options={options}
                                onChange={(e)=>{
                                    setDebt({...debt,[name]: e})
                                }}
                            />
                            <></>
                        </>:
                        <>
                            <TextField
                                fullWidth
                                type={type}
                                label={label}
                                id={name}
                                name={name}
                                defaultValue={value}
                                InputLabelProps={{ shrink: shrink }}
                                size={size}
                                onBlur={(e) => {
                                    // setDebt({...debt, [name]: e.target.value});
                                    handleChange(e, name);
                                }}
                            />
                        </>
                }
            </Col>
        ))
    }
    const makeRows = (inputs) => {
        return inputs.map(columns => (
            <Row key={'debt-row-'+genRand(8)} className={"mb-2"}    >
                {makeColumns(columns)}
            </Row>
        ))
    }
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
    }, [getBankData]);
    return (
        <>
            <MainLoader loaderVisible={loading}/>

            <Modal
                show={show}
                onHide={closeFunc}
                backdrop="static"
                keyboard={false}
                size={'lg'}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{"Add new Debt"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form>
                            {
                                makeRows(inputs)
                            }
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={closeFunc}>Close</Button>
                    <Button variant="primary" onClick={(e) => submit(e)}>Add Employee</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}