import React, { useEffect, useState, useContext, useImperativeHandle, forwardRef, useRef } from "react";
import { notification } from "../../../components/ToastNotification.jsx";
import {Col, Form, Row, Button, InputGroup, Table} from "react-bootstrap";
import { useSidebarActions } from "../../../components/GlobalSidebar/index.js";

import {useGetSectorListDataQuery, useUpdateContractMutation} from "../../../api/slices/sectorSlice.js";
import {genRand} from "../../../helper/HelperFunctions.js";
import {TextField, Typography} from "@mui/material";
import Select from "react-select";
import {createInputGroupTextStyle, createSelectStyles} from "../../../styles/formThemeStyles.js";
import {useTheme} from "@mui/material/styles";

const _initialPayments = [
    {
        paymentNumber: "",
        paymentDate: "",
        amount: "",
    },
];

const _initialFormData = {
    new_start_date: "",
    new_end_date: "",
    new_rent: "",
};
const paymentTerms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const months = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24,
];

export default forwardRef(function ContractExtendSidebar({  onSuccess, element = null, formId: formIdProp = null, hideInternalFooter = false }, ref) {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState(_initialPayments);
    const [data, setData] = useState(_initialFormData);
    const [updateContract] = useUpdateContractMutation();
    const theme = useTheme();
    const inputFontSize = "0.875rem";
    const formId = formIdProp || "contract-extend-sidebar-form";
    const selectStyles = createSelectStyles(theme, inputFontSize);
    const inputGroupTextStyle = createInputGroupTextStyle(theme);

    // Use a fresh array/object for initial rows to prevent mutation of the template
    const [errors, setErrors] = useState({});

    const { closeSidebar } = useSidebarActions();

    const handleChange = (e, index) => {
        let { name, value } = e.target;
        const onChangeValue = [...payments];
        onChangeValue[index][name] = value;
        setPayments(onChangeValue);
    };
    const handleAddInput = (e) => {
        setPayments([
            ...payments,
            { paymentNumber: "", paymentDate: "", amount: "" },
        ]);
    };
    const handleRemovePaymentRow = (index) => {
        const updatedPayments = [...payments];
        updatedPayments.splice(index, 1);
        setPayments(updatedPayments);
    };


    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let formData = new FormData();
        // formData.append('payment_account_id', sector.payment_account_id);
        formData.append("contract_start_date", data.new_start_date);
        formData.append("contract_end_date", data.new_end_date);
        formData.append("rent", data.new_rent);
        if (payments && payments.length > 0) {
            payments.forEach((payment) => {
                formData.append("payment_amount[]", payment.amount);
                formData.append("payment_date[]", payment.paymentDate);
                formData.append("payment_number[]", payment.paymentNumber);
            });
        }

        try {
            const data = await updateContract({
                url: `/sector/update-contract/${element.id}`,
                formData,
            }).unwrap();
            notification("success", data?.message, data?.description);

            closeSidebar();
        } catch (err) {
            notification(
                "error",
                err?.message || "An error occurred",
                err?.description || "Please try again later."
            );
        } finally {
            setLoading(false)
        }
    };

    // Expose imperative methods for sticky footer actions (Save / Save and Exit)
    useImperativeHandle(ref, () => ({
        save: () => {
            // Programmatic submit that keeps the sidebar open
            submit({ preventDefault: () => {} }, true);
        },
        saveAndExit: () => {
            // Programmatic submit that closes the sidebar
            submit({ preventDefault: () => {} }, false);
        },
    }));

    return (
        <div className="contract-extend-sidebar">
            <Form id={formId} onSubmit={(e) => submit(e, true)}>
                {/* Sector Information Section */}
                <div className="mb-4">
                    <Typography variant="h5" gutterBottom>
                        Contract Info
                    </Typography>
                    <hr/>
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="current-starting-date">
                                    Current Starting Date
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={element.contract_start_date}
                                    disabled={true}
                                    id="current-starting-date"
                                    aria-describedby="basic-addon3"
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="new-starting-date">
                                    New Starting Date
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    id="new-starting-date"
                                    aria-describedby="basic-addon3"
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            new_start_date: e.target.value,
                                        });
                                    }}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="current-starting-date">
                                    Current Expire Date
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    disabled={true}
                                    value={element.contract_end_date}
                                    id="current-expire-date"
                                    aria-describedby="basic-addon3"
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="current-expire-date">
                                    New Expire Date
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    id="new-expire-date"
                                    aria-describedby="basic-addon3"
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            new_end_date: e.target.value,
                                        });
                                    }}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="current-contract-value">
                                    Current Contract Value
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    disabled={true}
                                    value={element.rent}
                                    id="current-contract-value"
                                    aria-describedby="basic-addon3"
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12} md={6}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="new-contract-value">
                                    New Contract Value
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    id="new-contract-value"
                                    aria-describedby="new-contract-value"
                                    onChange={(e) => {
                                        setData({ ...data, new_rent: e.target.value });
                                    }}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Typography variant="h5" gutterBottom>
                        Payment Info
                    </Typography>
                    <hr/>

                    {payments.map((payment, index) => (
                        <Row key={"payments-" + index} className={"mb-2"}>
                            <Col md={4} sm={4}>
                                <TextField
                                    className={"w-100"}
                                    label="Payment Details"
                                    id="paymentNumber"
                                    name="paymentNumber"
                                    defaultValue={payment.paymentNumber}
                                    size="small"
                                    onChange={(e) => {
                                        handleChange(e, index);
                                    }}
                                />
                            </Col>
                            <Col md={3} sm={3}>
                                <TextField
                                    type={"date"}
                                    label="Payment Date"
                                    id="paymentDate"
                                    name="paymentDate"
                                    InputLabelProps={{ shrink: true }}
                                    defaultValue={payment.paymentDate}
                                    size="small"
                                    onChange={(e) => {
                                        handleChange(e, index);
                                    }}
                                />
                            </Col>
                            <Col md={3} sm={3}>
                                <TextField
                                    label="Payment Amount"
                                    type={"number"}
                                    id="paymentAmount"
                                    name="amount"
                                    defaultValue={payment.amount}
                                    size="small"
                                    onChange={(e) => {
                                        handleChange(e, index);
                                    }}
                                />
                            </Col>
                            <Col md={2} sm={2}>
                                <div className={"add-remove-btn-grp"}>
                                    <Button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleAddInput}
                                    >
                                        +
                                    </Button>
                                    {index > 0 && (
                                        <Button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemovePaymentRow(index)}
                                        >
                                            -
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    ))}

                </div>


                {/* Submit Buttons - Responsive (hidden when using sticky footer) */}
                {!hideInternalFooter && (
                    <Row className="g-2">
                        <Col xs={12}>
                            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="flex-fill flex-sm-fill-0"
                                    >
                                        {loading ? "Updating..." : "Update Contract"}
                                    </Button>
                            </div>
                        </Col>
                    </Row>
                )}
            </Form>
        </div>
    );
})

