import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axiosClient from "../../axios-client.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WizCard from "../../components/WizCard.jsx";

import { makeStyles } from "@mui/styles";
import MainLoader from "../../components/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { Col, Form, Modal, Row, Button } from "react-bootstrap";
import { useCreateExpenseMutation, useGetExpensElementeDataQuery, useGetSingleExpenseDataQuery } from "../../api/slices/expenseSlice.js";

const _initialExpense = {
  id: null,
  amount: "", // Set default value to an empty string
  refundable_amount: 0, // Set default value to an empty string
  description: "",
  reference: "",
  date: "",
  note: "",
  attachment: "",
};
export default function ExpenseForm({ handelCloseModal, id }) {
  const [expense, setExpense] = useState(_initialExpense);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const navigate = useNavigate();
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // api call
  const {
    data: getExpensElementeData,
    isFetching: elementIsFetching,
    isError: elementFetchingDataError,
} = useGetExpensElementeDataQuery();

const {
    data: getSingleExpenseData,
    isFetching: singleExpenseFetching,
    isError: singleExpenseDataError,
  } = useGetSingleExpenseDataQuery({id});

  const [createExpense] = useCreateExpenseMutation();

  useEffect(() => {
    if(getSingleExpenseData){
        if ( getExpensElementeData?.categories.length > 0) {
            getExpensElementeData?.categories.forEach((element) => {
              if (element.id === getSingleExpenseData.category_id) {
                setSelectedCategory(element);
              }
            });
          }
          if ( getExpensElementeData?.banks.length > 0) {
            getExpensElementeData?.banks.forEach((element) => {
              if (element.id === getSingleExpenseData.account_id) {
                setSelectedBankAccount(element);
              }
            });
          }
          if (getExpensElementeData?.users.length > 0) {
            getExpensElementeData?.users.forEach((element) => {
              if (element.id === getSingleExpenseData.user_id) {
                setSelectedUser(element);
              }
            });
          }
          setExpense((prevExpense) => ({
            ...prevExpense,
            ...getSingleExpenseData,
            date: getSingleExpenseData.date || "", // Set to empty string if the value is null or undefined
          }));
    }
  }, [getSingleExpenseData]);

//   console.log('getSingleExpenseData', getSingleExpenseData)
//   console.log('getExpensElementeData', getExpensElementeData) // bank account related 

  // set some default data
  useEffect(() => {
    if (expense?.date === "") {
      setExpense({
        ...expense,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [expense?.date]);

  const expenseSubmit = async(event, stay) => {
    event.preventDefault();
    // event.currentTarget.disabled = true;
    const {
      amount,
      refundable_amount,
      description,
      reference,
      date,
      note,
      attachment,
    } = expense;

    const formData = new FormData();
    formData.append("account_id", selectedBankAccount?.id);
    formData.append("amount", amount);
    formData.append("refundable_amount", refundable_amount);
    formData.append("category_id", selectedCategory?.id);
    formData.append("user_id", selectedUser?.id);
    formData.append("description", description);
    formData.append("note", note);
    formData.append("reference", reference);
    formData.append("date", date);
    formData.append("attachment", attachment);

    const url = expense.id ? `/expense/${expense?.id}` : "/expense/add";
      try {
        const data = await createExpense({ url: url, formData }).unwrap();
        notification("success", data?.message, data?.description);
        if(!stay){
            handelCloseModal();
        }else{
            setExpense(_initialExpense)
        }
      } catch (err) {
        notification(
            "error",
            err?.message || "An error occurred",
            err?.description || "Please try again later."
          );
      }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setExpense((prevExpense) => {
      return { ...prevExpense, attachment: file };
    });
  };

  console.log('expense', expense)

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
          <MainLoader loaderVisible={loading} />
          <WizCard className="animated fadeInDown">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        value={expense.description}
                        onChange={(e) =>
                          setExpense({
                            ...expense,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter description"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={expense.amount}
                        onChange={(e) =>
                          setExpense({ ...expense, amount: e.target.value })
                        }
                        placeholder="Enter amount"
                      />
                      {errors.amount && (
                        <p className="text-danger mt-2">{errors.amount[0]}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Refundable Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={expense.refundable_amount}
                        onChange={(e) =>
                          setExpense({
                            ...expense,
                            refundable_amount: e.target.value,
                          })
                        }
                        placeholder="Enter refundable amount"
                      />
                      {errors.refundable_amount && (
                        <p className="text-danger mt-2">
                          {errors.refundable_amount[0]}
                        </p>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference</Form.Label>
                      <Form.Control
                        type="text"
                        value={expense.reference}
                        onChange={(e) =>
                          setExpense({ ...expense, reference: e.target.value })
                        }
                        placeholder="Enter reference"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Additional Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={expense.note}
                        onChange={(e) =>
                          setExpense({ ...expense, note: e.target.value })
                        }
                        placeholder="Enter any additional notes"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <DatePicker
                        className="form-control"
                        selected={
                          expense.date ? new Date(expense.date) : new Date()
                        }
                        onChange={(date) =>
                          setExpense({
                            ...expense,
                            date: date ? date.toISOString().split("T")[0] : "",
                          })
                        }
                        dateFormat="dd-MM-yyyy"
                      />
                      {errors.start_date && (
                        <p className="text-danger mt-2">
                          {errors.start_date[0]}
                        </p>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Expense By</Form.Label>
                      <Form.Select
                        value={selectedUser?.id || ""}
                        onChange={(e) =>
                          setSelectedUser(
                            getExpensElementeData?.users.find((user) => String(user.id) === e.target.value)
                          )
                        }
                      >
                        <option value="">Select User</option>
                        {getExpensElementeData && getExpensElementeData?.users.length>0 && getExpensElementeData?.users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </option>
                        ))}
                      </Form.Select>
                      {errors.user_id && (
                        <p className="text-danger mt-2">{errors.user_id[0]}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Expense Category</Form.Label>
                      <Form.Select
                        value={selectedCategory?.id || ""}
                        onChange={(e) =>
                          setSelectedCategory(
                            getExpensElementeData?.categories.find(
                              (category) =>  String(category.id) === e.target.value
                            )
                          )
                        }
                      >
                        <option value="">Select Category</option>
                        {getExpensElementeData && getExpensElementeData?.categories.length>0 && getExpensElementeData?.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Bank Account</Form.Label>
                      <Form.Select
                        value={selectedBankAccount?.id || ""}
                        onChange={(e) =>
                          setSelectedBankAccount(
                            getExpensElementeData?.banks.find(
                              (account) => String(account.id) === e.target.value
                            )
                          )
                        }
                      >
                        <option value="">Select Bank Account</option>
                        {getExpensElementeData && getExpensElementeData?.banks.length>0 && getExpensElementeData?.banks.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bank_name} - {account.account_number} -{" "}
                            {account.balance}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.account_id && (
                        <p className="text-danger mt-2">
                          {errors.account_id[0]}
                        </p>
                      )}
                    </Form.Group>

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
                      onClick={(e) => expenseSubmit(e, false)}
                    >
                      Update
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={(e) => expenseSubmit(e, true)}
                        className="me-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={(e) => expenseSubmit(e, false)}
                      >
                        Save and Exit
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
