import MainLoader from "../../components/loader/MainLoader.jsx";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import { Form, InputGroup, TabContainer } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import { useUpdateContractMutation } from "../../api/slices/sectorSlice.js";
import { notification } from "../../components/ToastNotification.jsx";
import {
  ButtonGroup,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TextField,
  Typography,
} from "@mui/material";
import { genRand } from "../../helper/HelperFunctions.js";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const initialPaymentState = [
  {
    paymentNumber: "",
    paymentDate: "",
    amount: "",
  },
];

const initialSectorState = {
  contract_start_date: "",
  contract_end_date: "",
  rent: "",
  electricity_bill_month: "",
  internet_bill_month: "",
};
const months = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24,
];
export default function ContractExtendForm({ handleCloseModal, element }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(initialPaymentState);
  const [sector, setSector] = useState(initialSectorState);

  const [updateContract] = useUpdateContractMutation();
  const submit = async (e) => {
    e.preventDefault();

    let formData = new FormData();
    // formData.append('payment_account_id', sector.payment_account_id);
    formData.append("contract_start_date", sector.contract_start_date);
    formData.append("contract_end_date", sector.contract_end_date);
    formData.append("rent", sector.rent);
    formData.append("electricity_bill_month", sector.electricity_bill_month);
    formData.append("internet_bill_month", sector.internet_bill_month);
    if (paymentData && paymentData.length > 0) {
      paymentData.forEach((element) => {
        formData.append("payment_amount[]", element.amount);
        formData.append("payment_date[]", element.paymentDate);
        formData.append("payment_number[]", element.paymentNumber);
      });
    }

    try {
      const data = await updateContract({
        url: `/sector/update-contract/${element.id}`,
        formData,
      }).unwrap();
      notification("success", data?.message, data?.description);
      handleCloseModal();
    } catch (err) {
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    }
  };

  const handleChange = (e, index) => {
    let { name, value } = e.target;
    const onChangeValue = [...paymentData];
    onChangeValue[index][name] = value;
    setPaymentData(onChangeValue);
  };
  const handleAddInput = (e) => {
    setPaymentData([
      ...paymentData,
      { paymentNumber: "", paymentDate: "", amount: "" },
    ]);
  };

  const handleRemovePaymentRow = (index) => {
    const updatedPayments = [...paymentData];
    updatedPayments.splice(index, 1);
    setPaymentData(updatedPayments);
  };

  return (
    <>
      <>
        <MainLoader loaderVisible={loading} />
        <Modal
          show={true}
          onHide={handleCloseModal}
          backdrop="static"
          keyboard={false}
          size={"lg"}
        >
          <Modal.Header closeButton>
            <Modal.Title>{"Extend Contract"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
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
                        setSector({
                          ...sector,
                          contract_start_date: e.target.value,
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
                        setSector({
                          ...sector,
                          contract_end_date: e.target.value,
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
                        setSector({ ...sector, rent: e.target.value });
                      }}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="internet-billing-mobth">
                      Generate Internet Bill for
                    </InputGroup.Text>
                    <Form.Select
                      size={"sm"}
                      value={sector.internet_bill_month}
                      aria-label="Internet Bill"
                      onChange={(e) => {
                        setSector({
                          ...sector,
                          internet_bill_month: e.target.value,
                        });
                      }}
                    >
                      <option defaultValue value={""}>
                        Billing Month
                      </option>
                      {months.map((value) => (
                        <option key={genRand(8)} value={value}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Col>

                <Col xs={12} md={6}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="internet-billing-mobth">
                      Generate Electricity Bill for
                    </InputGroup.Text>
                    <Form.Select
                      size={"sm"}
                      value={sector.electricity_bill_month}
                      aria-label="Electircity Bill"
                      onChange={(e) => {
                        setSector({
                          ...sector,
                          electricity_bill_month: e.target.value,
                        });
                      }}
                    >
                      <option defaultValue value={""}>
                        Billing Month
                      </option>
                      {months.map((value) => (
                        <option key={genRand(8)} value={value}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
              <Typography variant="h5" gutterBottom>
                Payment
              </Typography>
              {paymentData.map((payment, index) => (
                <Row key={"paymentData-" + index} className={"mb-2"}>
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
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={(e) => submit(e)}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </>
  );
}
