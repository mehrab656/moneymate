import React, { useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../../../axios-client.js";
import WizCard from "../../../components/WizCard.jsx";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { InputGroup, Form } from "react-bootstrap";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import {
  createInputGroupTextStyle,
  createSelectStyles,
  createDateInputStyle,
} from "../../../styles/formThemeStyles.js";
import MonthlyReportTable from "./MonthlyReportTable.jsx";
import Swal from "sweetalert2";
import ReactToPrint from "react-to-print";
import { Button } from "@mui/material";

const initialState = {
  incomes: [],
  expenses: [],
  sector: {},
  length: 0,
  netIncome: "",
  netIncomePercent: "",
  reportingMonth: "",
  summery: [],
};
export default function MonthlyReport() {
  const componentRef = useRef();

  const [monthlyReport, setMonthlyReport] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  const [tableRow, setTableRow] = useState([]);
  var rows = [];
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);
  const dateInputStyle = createDateInputStyle(theme, inputFontSize);
  const infoHeaderStyle = {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.getContrastText(theme.palette.info.main),
  };
  const warningHeaderStyle = {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.getContrastText(theme.palette.warning.main),
  };
  const isDark = theme.palette.mode === "dark";
  const baseDarkCellStyle = isDark
    ? { backgroundColor: theme.palette.primary.main, color: theme.palette.common.white }
    : {};
  const overallReportRow = () => {
    rows = [];
    for (let i = 0; i < monthlyReport.length; i++) {
      rows.push(
        <MonthlyReportTable
          income={monthlyReport.incomes[i]}
          expense={monthlyReport.expenses[i]}
          sectorName={monthlyReport.sector.name}
          sl={i}
          key={i}
        />
      );
    }
    setTableRow(rows);
  };
  const getMonthlyReports = () => {
    setLoading(true);

    axiosClient
      .get("/report/get-monthly-report", {
        params: { from_date: fromDate, category_id: selectedCategoryId },
      })
      .then(({ data }) => {
        setAlertMessage(null);
        setMonthlyReport(data);
        overallReportRow();
        setLoading(false);
      })
      .catch((err) => {
        setAlertMessage(err.response.data.message);
        setTimeout(() => {
          setAlertMessage(null);
        }, 3000);
        setLoading(false);
      });
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Monthly Reports";
    // getMonthlyReports();
  }, []);

  useEffect(() => {
    axiosClient
      .get("/income-categories")
      .then(({ data }) => {
        setIncomeCategories(data.categories);
      })
      .catch((error) => {
        console.error("Error loading income categories:", error);
        // handle error, e.g., show an error message to the user
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    getMonthlyReports();
  };
  const resetFilterParameter = () => {
    setLoading(true);
    setFromDate("");
    setSelectedCategoryId("");
    setMonthlyReport(initialState);
    setLoading(false);
    setAlertMessage(null);
  };

  return (
    <>
      <MainLoader loaderVisible={loading} />
      <WizCard className="animated fadeInDown">
        <div className="report-page">
          <div className="report-header">
            <div>
              <h2 className="h5 mb-0">Monthly Report</h2>
              <small className="text-muted">
                {monthlyReport.reportingMonth || "Select month to view report"}
              </small>
            </div>
            <div className="d-flex gap-2">
              <ReactToPrint
                trigger={() => (
                  <Button variant="outlined" size="small">
                    Print
                  </Button>
                )}
                content={() => componentRef.current}
              />
              <Button
                variant="contained"
                size="small"
                onClick={getMonthlyReports}
              >
                Refresh
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-3">
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <InputGroup className="mb-3" size="sm">
                  <InputGroup.Text
                    id="monthly_income_category"
                    style={inputGroupTextStyle}
                  >
                    Income Category
                  </InputGroup.Text>
                  <div
                    className="flex-grow-1"
                    aria-describedby="monthly_income_category"
                  >
                    <Select
                      classNamePrefix="select"
                      styles={selectStyles}
                      isSearchable={false}
                      value={
                        incomeCategories.length > 0
                          ? incomeCategories
                              .map((c) => ({
                                value: String(c.id),
                                label: c.name,
                              }))
                              .find(
                                (opt) =>
                                  opt.value === (selectedCategoryId || "")
                              ) || null
                          : null
                      }
                      onChange={(opt) =>
                        setSelectedCategoryId(opt?.value || "")
                      }
                      options={incomeCategories.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                      }))}
                    />
                  </div>
                </InputGroup>
              </div>
              <div className="col-12 col-md-4">
                <InputGroup className="mb-3" size="sm">
                  <InputGroup.Text
                    id="report_month_label"
                    style={inputGroupTextStyle}
                  >
                    Report Month
                  </InputGroup.Text>
                  <Form.Control
                    aria-describedby="report_month_label"
                    type="month"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={dateInputStyle}
                  />
                </InputGroup>
              </div>
              <div className="col-6 col-md-2 ">
                <button
                  className={"btn btn-warning ml-2"}
                  type="button"
                  onClick={resetFilterParameter}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {alertMessage && (
          <div className="alert alert-danger" role="alert">
            {alertMessage}
          </div>
        )}

        <div className="row" ref={componentRef}>
          <div className="col-12">
            <div className="table-scroll">
              <table className="table table-bordered align-middle">
                <thead>
                  <tr className={"text-center"}>
                    <td colSpan={11} style={infoHeaderStyle}>
                      <b>{monthlyReport.sector?.name ?? "Monthly report"}</b>
                    </td>
                  </tr>
                  <tr className={"text-center"}>
                    <td colSpan={2} style={baseDarkCellStyle}>
                      <b>{"Reporting Month"}</b>
                    </td>
                    <td colSpan={9} style={baseDarkCellStyle}>
                      <b>{monthlyReport.reportingMonth}</b>
                    </td>
                  </tr>
                  <tr className={"text-center"}>
                    <td colSpan={5} style={warningHeaderStyle}>
                      <b>{"Incomes"}</b>
                    </td>
                    <td colSpan={1} rowSpan={13} width={"5%"}></td>
                    <td colSpan={5} style={infoHeaderStyle}>
                      <b>{"Expenses"}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>{"S/L"}</b>
                    </td>
                    <td colSpan={3}>
                      <b>{"Description"}</b>
                    </td>
                    <td>
                      <b>{"Amount"}</b>
                    </td>
                    <td>
                      <b>{"S/L"}</b>
                    </td>
                    <td colSpan={3}>
                      <b>{"Description"}</b>
                    </td>
                    <td>
                      <b>{"Amount"}</b>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {tableRow}

                  <tr>
                    <td className={"table_total"} colSpan={3} style={warningHeaderStyle}>
                      <b>Total</b>
                    </td>
                    <td className={"amount"} colSpan={2} style={warningHeaderStyle}>
                      <b>{monthlyReport.summery?.totalIncome}</b>
                    </td>
                    <td style={{ borderTop: "hidden" }}></td>
                    <td className={"table_total"} colSpan={3} style={infoHeaderStyle}>
                      <b>Total</b>
                    </td>
                    <td className={"amount"} colSpan={2} style={infoHeaderStyle}>
                      <b>{monthlyReport.summery?.totalExpense}</b>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} style={baseDarkCellStyle}></td>
                    {/*<td rowSpan={4}></td>*/}
                    <td colSpan={5} rowSpan={3} style={baseDarkCellStyle}>
                      Remarks:
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={baseDarkCellStyle}>
                      <b>Total Cost of {monthlyReport.reportingMonth}</b>
                    </td>
                    <td colSpan={2} className={"amount"} style={baseDarkCellStyle}>
                      <b>{monthlyReport.summery?.totalExpense}</b>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={baseDarkCellStyle}>
                      <b>Total Income of {monthlyReport.reportingMonth}</b>
                    </td>
                    <td colSpan={2} className={"amount"} style={baseDarkCellStyle}>
                      <b>{monthlyReport.summery?.totalIncome}</b>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={baseDarkCellStyle}>
                      <b>
                        Net {monthlyReport.summery?.title} of{" "}
                        {monthlyReport.reportingMonth}
                      </b>
                    </td>
                    <td colSpan={2} className={"amount"} style={baseDarkCellStyle}>
                      <b>{monthlyReport.summery?.net}</b>
                    </td>
                    <td colSpan={3} style={baseDarkCellStyle}>
                      <b>Net {monthlyReport.summery?.title}</b>
                    </td>
                    <td className={"amount"} colSpan={2} style={baseDarkCellStyle}>
                      <b>{monthlyReport.summery?.netPercent}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </WizCard>
    </>
  );
}
