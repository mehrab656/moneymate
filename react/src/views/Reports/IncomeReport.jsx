import React, { useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../../axios-client.js";
import WizCard from "../../components/WizCard.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import IncomeModal from "../../helper/IncomeModal.jsx";
import ReactToPrint from "react-to-print";
import { Row, Col, InputGroup, Form } from "react-bootstrap";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle, createSelectStyles, createDateInputStyle } from "../../styles/formThemeStyles.js";
import Select from "react-select";

export default function IncomeReport() {
  const componentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [incomeReport, setIncomeReport] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [totalIncome, setTotalIncome] = useState(parseFloat(0).toFixed(2));
  const [activeModal, setActiveModal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    id: null,
    user_id: null,
    account_id: "", // Set default value to an empty string
    amount: 0, // Set default value to an empty string
    category_id: null,
    category_name: "",
    description: "",
    reference: "",
    date: "",
    note: "",
    attachment: "",
  });

  const { applicationSettings, themeMode } = useContext(SettingsContext);
  let { default_currency } = applicationSettings;
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const inputFontSize = "0.875rem";
  const selectStyles = createSelectStyles(theme, inputFontSize);
  const inputStyle = createDateInputStyle(theme, inputFontSize);

  useEffect(() => {
    axiosClient
      .get("/income-categories")
      .then(({ data }) => {
        setIncomeCategories(data.categories);
      })
      .catch((error) => {
        console.error("Error loading income categories:", error);
      });
  }, [setIncomeCategories]);

  const getIncomeReport = () => {
    setLoading(true);
    axiosClient
      .get("/report/income", {
        params: {
          start_date: startDate,
          end_date: endDate,
          cat_id: selectedCategoryId,
        },
      })
      .then(({ data }) => {
        setIncomeReport(data.incomes);
        setTotalIncome(data.totalIncome);
        setLoading(false);
      });
  };

  const showIncomeDetails = (income, index) => {
    setActiveModal(index);
    setModalData(income);
    setShowModal(true);
  };

  useEffect(() => {
    document.title = "Income Report";
    getIncomeReport();
  }, []);

  const handleIncomeFilterSubmit = (e) => {
    e.preventDefault();
    getIncomeReport();
  };
  const resetFilterParameter = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCategoryId("");
    getIncomeReport();
  };
  const handleCloseModal = () => {
    setActiveModal("");
    setShowModal(false);
  };
  return (
    <>
      <MainLoader loaderVisible={loading} />
      <div className={"report-page"}>
        <div className={"report-header"}>
          <span className={"page-title-header"}>Income Report</span>
          <div className={"d-flex align-items-center gap-2"}>
            <ReactToPrint
              trigger={() => (
                <button className="btn btn-success btn-sm">Print</button>
              )}
              content={() => componentRef.current}
            />
            <button
              className={"btn btn-secondary btn-sm"}
              onClick={getIncomeReport}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      <WizCard className="animated fadeInDown wiz-card-mh mt-4">
        <Row className={"mb-3"}>
          <form onSubmit={handleIncomeFilterSubmit} className="w-100">
            <Row className="g-2">
              <Col xs={12} md={4}>
                <InputGroup className="mb-3" size="sm">
                  <InputGroup.Text id="income_category" style={inputGroupTextStyle}>
                    Income Category
                  </InputGroup.Text>
                  <div className="flex-grow-1" aria-describedby="income_category">
                    <Select
                      classNamePrefix="select"
                      styles={selectStyles}
                      isSearchable={false}
                      value={
                        incomeCategories.length > 0
                          ? incomeCategories
                              .map((c) => ({ value: String(c.id), label: c.name }))
                              .find((opt) => opt.value === (selectedCategoryId || "")) || null
                          : null
                      }
                      onChange={(opt) => setSelectedCategoryId(opt?.value || "")}
                      options={incomeCategories.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                      }))}
                    />
                  </div>
                </InputGroup>
              </Col>
              <Col xs={12} md={3}>
                <InputGroup className="mb-3" size="sm">
                  <InputGroup.Text id="start_date_label" style={inputGroupTextStyle}>
                    Start Date
                  </InputGroup.Text>
                  <Form.Control
                    aria-describedby="start_date_label"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={3}>
                <InputGroup className="mb-3" size="sm">
                  <InputGroup.Text id="end_date_label" style={inputGroupTextStyle}>
                    End Date
                  </InputGroup.Text>
                  <Form.Control
                    aria-describedby="end_date_label"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={2} >
                {/* <button className={"btn btn-primary"} type="submit">
                  Filter
                </button> */}
                <button
                  className={"btn btn-warning ml-2"}
                  type="button"
                  onClick={resetFilterParameter}
                >
                  Reset
                </button>
              </Col>
            </Row>
          </form>
        </Row>
      
        <div className="row" ref={componentRef}>
          <div className="table-scroll">
            <table className="table table-bordered custom-table">
              <thead>
                <tr className={"text-center"}>
                  <th>Income Date</th>
                  <th>Income Description</th>
                  <th>Income Category</th>
                  <th>Income Amount</th>
                </tr>
              </thead>
              {loading && (
                <tbody>
                  <tr className={"text-center"}>
                    <td colSpan={4} className="text-center">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              )}
              {!loading && (
                <tbody>
                  {incomeReport.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Nothing found !
                      </td>
                    </tr>
                  ) : (
                    incomeReport.map((income, index) => (
                      <tr key={income.id} className={"text-center"}>
                        <td>{income.date}</td>
                        <td>
                          {income.description}
                          <a
                            onClick={() => showIncomeDetails(income, index)}
                            className={
                              index === activeModal
                                ? "text-primary fa-pull-right "
                                : "text-muted fa-pull-right"
                            }
                            data-tooltip-id="expense-details"
                            data-tooltip-content={"View details"}
                          >
                            <span className="aside-menu-icon">
                              <FontAwesomeIcon
                                icon={
                                  index === activeModal ? faEye : faEyeSlash
                                }
                              />
                            </span>
                          </a>
                        </td>
                        <td>{income.category_name}</td>
                        <td className={"text-end"}>
                          {default_currency + " " + +income.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}

              <tfoot>
                <tr>
                  <td className={"text-center fw-bold"} colSpan={3}>
                    Total Income
                  </td>
                  <td className={"text-end fw-bold"}>
                    {default_currency +
                      " " +
                      +parseFloat(totalIncome).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </WizCard>

      <IncomeModal
        showModal={showModal}
        handelCloseModal={handleCloseModal}
        title={"Expense Details"}
        data={modalData}
        currency={default_currency}
      />
    </>
  );
}
