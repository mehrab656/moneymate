import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axiosClient from "../../../axios-client.js";
import Select from "react-select";
import { notification } from "../../../components/ToastNotification.jsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLoader from "../../../components/MainLoader.jsx";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { useStateContext } from "../../../contexts/ContextProvider.jsx";
import { useGetCategoryDataQuery } from "../../../api/slices/categorySlice.js";
import { useGetAllEmployeeDataQuery } from "../../../api/slices/employeeSlice.js";
import { useCreateTaskMutation,useGetSingleTaskDataQuery } from "../../../api/slices/taskSlice.js";


const defaultTaskData = {
  description: "",
  employee: "",
  categoryID: "",
  employee_list: [],
  date: "",
  startTime: "",
  endTime: "",
  type: "income",
  amount: "",
  status: "pending",
  payment_status: "pending",
  workflow: [],
  comment: "",
};

function TaskAddModal({ handelCloseModal, title, id }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(defaultTaskData);
  const [showExistingTask, setShowExistingTask] = useState(false);
  const [existingTask, setExistingTask] = useState({});
  const {
    data: getSingleTaskData,
    isFetching: singleTaskFetching,
    isError: singleTaskDataError,
  } = useGetSingleTaskDataQuery({
    id:id,
  });

  const categoryQuery = {
    selectedSectorId:'',
    type: taskData?.type,
  }

  const {
    data: getCategoryData,
    isFetching: categoryDataFetching,
    isError: categoryDataError,
  } = useGetCategoryDataQuery({
    currentPage: "",
    pageSize: 100,
    query: categoryQuery,
  });
  
  const {
    data: getAllEmployeeData,
    isFetching: allEmployeeDataFetching,
    isError: allEmployeeDataDataError,
  } = useGetAllEmployeeDataQuery({
    currentPage: "",
    pageSize: 100,
  });



  useEffect(()=>{
    if(id &&  getSingleTaskData?.data){
      setTaskData(getSingleTaskData?.data);
    }
  },[id])

  const modifiedEmployeeList = getAllEmployeeData?.data.map(({id, name}) => {
    return {
        value: id,
        label: name
    }
});
  const [createTask] = useCreateTaskMutation();

  const submit = async (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("employee_list", JSON.stringify(taskData.employee_list));
    formData.append("description", taskData.description);
    formData.append("categoryID", taskData.category_id);
    formData.append("date", taskData.date);
    formData.append("startTime", taskData.startTime);
    formData.append("endTime", taskData.endTime);
    formData.append("type", taskData.type);
    formData.append("amount", taskData.amount);
    formData.append("status", taskData.task_status);
    formData.append("payment_status", taskData.payment);
    formData.append("comment", taskData.comment);

    const url = id ? `/task/${id}` : `/task/add`;

    try {
      const data = await createTask({ url: url, formData }).unwrap();
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

  return (
    <>
      <MainLoader loaderVisible={loading} />
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
              If you make the payment status as "Paid/Done" from here, it has to
              be added the income separately.
              <br />
            </div>
            <Form>
              <Row>
                <Col xs={12} md={12}>
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Task Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      autoFocus
                      rows={3}
                      value={taskData.description}
                      name={"description"}
                      onChange={(e) => {
                        setTaskData({
                          ...taskData,
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
                  <Form.Group className="mb-3" controlId="date">
                    <Form.Label>Schedule Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={taskData.date}
                      onChange={(e) => {
                        setTaskData({ ...taskData, date: e.target.value });
                      }}
                    />
                    {errors.date && (
                      <p className="error-message mt-2">{errors.date[0]}</p>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={4} lg={4} sm={12}>
                  <Form.Group className="mb-3" controlId="startTime">
                    <Form.Label>Schedule Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={taskData.startTime}
                      onChange={(e) => {
                        setTaskData({ ...taskData, startTime: e.target.value });
                      }}
                    />
                    {errors.startTime && (
                      <p className="error-message mt-2">
                        {errors.startTime[0]}
                      </p>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={4} lg={4} sm={12}>
                  <Form.Group className="mb-3" controlId="endTime">
                    <Form.Label>Schedule End Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={taskData.endTime}
                      onChange={(e) => {
                        setTaskData({ ...taskData, endTime: e.target.value });
                      }}
                    />
                    {errors.endTime && (
                      <p className="error-message mt-2">{errors.endTime[0]}</p>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <hr className={"border-danger"} />
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3" controlId="type">
                    <Form.Label>Task Type</Form.Label>
                    <Form.Select
                      aria-label="Task Type"
                      value={taskData.type}
                      onChange={(e) => {
                        setTaskData({ ...taskData, type: e.target.value });
                      }}
                    >
                      <option disabled>Select Task Type</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </Form.Select>
                    {errors.type && (
                      <p className="error-message mt-2">{errors.type[0]}</p>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3" controlId="categoryID">
                    <Form.Label>Task Category</Form.Label>
                    <Form.Select
                      aria-label="Task Categories"
                      value={taskData.category_id}
                      onChange={(e) => {
                        setTaskData({
                          ...taskData,
                          categoryID: e.target.value,
                        });
                      }}
                    >
                      <option defaultValue>{"Select task type First"}</option>
                      {getCategoryData?.data?.length > 0 ? (
                        getCategoryData?.data?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option defaultValue>{"Select task type First"}</option>
                      )}
                    </Form.Select>
                    {errors.categoryID && (
                      <p className="error-message mt-2">
                        {errors.categoryID[0]}
                      </p>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={4}>
                  <Form.Group className="mb-3" controlId="amount">
                    <Form.Label> Amount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="i.g: 50 AED"
                      value={taskData.amount}
                      onChange={(e) => {
                        setTaskData({ ...taskData, amount: e.target.value });
                      }}
                    />
                    {errors.amount && (
                      <p className="error-message mt-2">{errors.amount[0]}</p>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group className="mb-3" controlId="status">
                    <Form.Label>Task Status</Form.Label>
                    <Form.Select
                      aria-label="Task Status"
                      value={taskData.task_status}
                      onChange={(e) => {
                        setTaskData({
                          ...taskData,
                          task_status: e.target.value,
                        });
                      }}
                    >
                      <option defaultValue>Select Task Status</option>
                      <option value="pending">Pending</option>
                      {/*<option value="cancelled">Cancelled</option>*/}
                      <option value="complete">Complete</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group className="mb-3" controlId="payment_status">
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Select
                      aria-label="Payment Status"
                      value={taskData.payment}
                      onChange={(e) => {
                        setTaskData({ ...taskData, payment: e.target.value });
                      }}
                    >
                      <option defaultValue>Select Payment Status</option>
                      <option value="pending">Pending</option>
                      {/*<option value="partial_paid">Partially Paid</option>*/}
                      <option value="paid">Paid</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <hr className={"border-danger"} />
              <Row>
                <Col xs={12} md={12}>
                  <Form.Group className="mb-3" controlId="employee_id">
                    <Form.Label>Assign to</Form.Label>
                    <Select
                      isMulti
                      className="basic-single"
                      classNamePrefix="select"
                      defaultValue={taskData.employee_list}
                      isSearchable={true}
                      name="employee_id"
                      isClearable={true}
                      isLoading={allEmployeeDataFetching}
                      options={modifiedEmployeeList}
                      onChange={(e) => {
                        setTaskData({ ...taskData, employee_list: e });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={12}>
                  <Form.Group className="mb-3" controlId="comment">
                    <Form.Label> Comment(if any)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="if any comment, put here..."
                      value={taskData.comment}
                      onChange={(e) => {
                        setTaskData({ ...taskData, comment: e.target.value });
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
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TaskAddModal;
