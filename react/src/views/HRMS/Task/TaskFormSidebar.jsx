import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import axiosClient from "../../../axios-client";
import { notification } from "../../../components/ToastNotification.jsx";
import { useGetEmployeeListQuery } from "../../../api/slices/employeeSlice.js";
import { useGetCategoryListDataQuery } from "../../../api/slices/categorySlice.js";
import { useGetSingleTaskDataQuery } from "../../../api/slices/taskSlice.js";
import { useSidebarActions } from "../../../components/GlobalSidebar";

const defaultTaskData = {
  description: "",
  category: {},
  employee_list: [],
  date: "",
  startTime: "",
  endTime: "",
  type: { label: "Income", value: "income" },
  amount: "",
  status: {},
  payment_status: {},
  workflow: [],
  comment: "",
};

const TaskFormSidebar = ({ taskId = null, onSuccess }) => {
  const [taskData, setTaskData] = useState(defaultTaskData);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { closeSidebar } = useSidebarActions();

  // Fetch single task when editing
  const { data: singleTaskResp } = useGetSingleTaskDataQuery(
    { id: taskId },
    { skip: !taskId }
  );

  // Category list depends on type
  const { data: catResp, isFetching: categoryDataFetching } =
    useGetCategoryListDataQuery({ categoryType: taskData?.type?.value });

  // Employee list
  const { data: empResp, isFetching: employeeFetching } = useGetEmployeeListQuery({});

  useEffect(() => {
    if (taskId && singleTaskResp?.data) {
      // Pre-fill when editing
      const t = singleTaskResp.data;
      setTaskData({
        description: t.description || "",
        category: t.category || {},
        employee_list: t.employee_list || [],
        date: t.date || "",
        startTime: t.startTime || "",
        endTime: t.endTime || "",
        type: t.type || { label: "Income", value: "income" },
        amount: t.amount || "",
        status: t.status || {},
        payment_status: t.payment_status || {},
        workflow: t.workflow || [],
        comment: t.comment || "",
      });
    }
  }, [taskId, singleTaskResp]);

  useEffect(() => {
    if (catResp?.data?.length) setCategories(catResp.data);
  }, [catResp]);

  const modifiedEmployeeList = (empResp?.data || []).map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let formData = new FormData();
    formData.append("employee_list", JSON.stringify(taskData.employee_list));
    formData.append("description", taskData.description);
    formData.append("categoryID", taskData.category?.value || "");
    formData.append("date", taskData.date);
    formData.append("startTime", taskData.startTime);
    formData.append("endTime", taskData.endTime);
    formData.append("type", taskData.type?.value || "income");
    formData.append("amount", taskData.amount);
    // On create only, include initial status/payment_status
    if (!taskId) {
      formData.append("status", taskData.status?.value || "pending");
      formData.append("payment_status", taskData.payment_status?.value || "pending");
    }
    formData.append("comment", taskData.comment);

    const url = taskId ? `/task/${taskId}` : `/task/add`;
    axiosClient
      .post(url, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(({ data }) => {
        notification("success", data?.message, data?.description);
        setErrors({});
        if (onSuccess) onSuccess();
        closeSidebar();
      })
      .catch((err) => {
        const status = err?.response?.status || 500;
        const errorData = err?.response?.data || {};
        if (status === 406) {
          notification("error", errorData?.message, errorData?.description);
        } else if (status === 422) {
          setErrors(errorData?.errors || {});
          notification("error", errorData?.message || "Validation error");
        } else {
          notification(
            "error",
            errorData?.message || "An error occurred",
            errorData?.description || "Please try again later."
          );
          setErrors({});
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="alert alert-warning" role="alert">
        If you mark payment as "Paid" here, record the income separately.
      </div>
      <Form onSubmit={submit}>
        <Row>
          <Col xs={12} md={12}>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              />
              {errors?.description && <small className="error-message mt-2">{errors?.description[0]}</small>}
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
                onChange={(e) => setTaskData({ ...taskData, date: e.target.value })}
              />
              {errors?.date && <small className="error-message mt-2">{errors?.date[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={4} sm={12}>
            <Form.Group className="mb-3" controlId="startTime">
              <Form.Label>Schedule Start Time</Form.Label>
              <Form.Control
                type="time"
                value={taskData.startTime}
                onChange={(e) => setTaskData({ ...taskData, startTime: e.target.value })}
              />
              {errors?.startTime && <small className="error-message mt-2">{errors?.startTime[0]}</small>}
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={4} sm={12}>
            <Form.Group className="mb-3" controlId="endTime">
              <Form.Label>Schedule End Time</Form.Label>
              <Form.Control
                type="time"
                value={taskData.endTime}
                onChange={(e) => setTaskData({ ...taskData, endTime: e.target.value })}
              />
              {errors?.endTime && <small className="error-message mt-2">{errors?.endTime[0]}</small>}
            </Form.Group>
          </Col>
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="type">
              <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                Type
              </Form.Label>
              <Select
                classNamePrefix="select"
                value={taskData.type}
                isSearchable
                name="type"
                options={[
                  { label: "Income", value: "income" },
                  { label: "Expense", value: "expense" },
                ]}
                onChange={(e) => setTaskData({ ...taskData, type: e, category: {} })}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="category">
              <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                Category
              </Form.Label>
              <Select
                classNamePrefix="select"
                value={taskData.category}
                isSearchable
                name="category"
                isLoading={categoryDataFetching}
                options={categories}
                onChange={(e) => setTaskData({ ...taskData, category: e })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={4}>
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                Amount
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="i.g: 50 AED"
                value={taskData.amount}
                onChange={(e) => setTaskData({ ...taskData, amount: e.target.value })}
              />
              {errors?.amount && <small className="error-message mt-2">{errors?.amount[0]}</small>}
            </Form.Group>
          </Col>

          {!taskId && (
            <>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                    Status
                  </Form.Label>
                  <Select
                    classNamePrefix="select"
                    value={taskData.status}
                    isSearchable
                    name="status"
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Complete", value: "complete" },
                    ]}
                    onChange={(e) => setTaskData({ ...taskData, status: e })}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3" controlId="payment_status">
                  <Form.Label style={{ marginBottom: "0px" }} className="custom-form-label">
                    Payment Status
                  </Form.Label>
                  <Select
                    classNamePrefix="select"
                    value={taskData.payment_status}
                    isSearchable
                    name="payment_status"
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Paid", value: "paid" },
                    ]}
                    onChange={(e) => setTaskData({ ...taskData, payment_status: e })}
                  />
                </Form.Group>
              </Col>
            </>
          )}
        </Row>

        <hr className="border-danger" />

        <Row>
          <Col xs={12} md={12}>
            <Form.Group className="mb-3" controlId="employee_id">
              <Form.Label>Assign to</Form.Label>
              <Select
                isMulti
                classNamePrefix="select"
                value={taskData.employee_list}
                isSearchable
                name="employee_id"
                isLoading={employeeFetching}
                options={modifiedEmployeeList}
                onChange={(e) => setTaskData({ ...taskData, employee_list: e })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={12}>
            <Form.Group className="mb-3" controlId="comment">
              <Form.Label>Comment (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="if any comment, put here..."
                value={taskData.comment}
                onChange={(e) => setTaskData({ ...taskData, comment: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={closeSidebar} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {taskId ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default TaskFormSidebar;