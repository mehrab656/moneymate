import React, { useEffect, useState } from "react";
import { Row, Col, Image } from "react-bootstrap";
import { Paper, Table, TableBody, TableContainer, TableRow, TableCell } from "@mui/material";
import axiosClient from "../../../axios-client";

const labelOf = (val) => {
  if (!val) return "N/A";
  if (typeof val === "string") return val;
  if (val?.label) return val.label;
  return JSON.stringify(val);
};

const TaskDetails = ({ taskId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    axiosClient
      .get(`/task/${taskId}`)
      .then(({ data }) => setData(data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) {
    return <div className="text-center p-4">Loading task details...</div>;
  }
  if (!data) {
    return <div className="text-center p-4">No task data available</div>;
  }

  return (
    <div className="p-3" style={{ boxSizing: "border-box" }}>
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <div className="d-flex flex-column gap-1">
            <div>
              <strong>Description:</strong> {data.description}
            </div>
            <div>
              <strong>Amount:</strong> {data.amount}
            </div>
            <div>
              <strong>Type:</strong> {labelOf(data.type)}
            </div>
            <div>
              <strong>Slot:</strong> {data.slot || `${data.date || ""} ${data.startTime || ""} - ${data.endTime || ""}`}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xs={12} md={6}>
          <div>
            <strong>Task Status:</strong> {labelOf(data.status)}
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div>
            <strong>Payment Status:</strong> {labelOf(data.payment_status)}
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xs={12}>
          <strong className="text-primary">History</strong>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="show-task-history">
              <TableBody>
                {(data.workflow || []).map((item, index) => (
                  <TableRow key={`${item?.date_time || index}-${index}`}>
                    <TableCell scope="row" style={{ textAlign: "left" }}>
                      {item?.avatar ? (
                        <Image src={item.avatar} roundedCircle style={{ height: "40px", width: "40px", padding: "3px" }} />
                      ) : null}
                      <small> [{(item?.type || "").replaceAll("_", " ")}] </small>
                      {`${item?.userName || ""} ${item?.description || ""}`} {" "}
                      <small className={"text-muted"}>({item?.date_time || ""})</small>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Col>
      </Row>
    </div>
  );
};

export default TaskDetails;