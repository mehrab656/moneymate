import React, { useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../../axios-client.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import {Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import ExpenseFilter from "../../helper/filter-icons/ExpenseFilter.jsx";
import { Box, Button } from "@mui/material";
import ReactToPrint from "react-to-print";
import ExpenseShow from "./ExpenseShow.jsx";
import {genRand} from "../../helper/HelperFunctions.js";
import {useGetExpenseReportDataQuery} from "../../api/slices/reportSlice.js"
import {useGetSectorListDataQuery} from "../../api/slices/sectorSlice.js";

const defaultQuery = {
  start_date: "",
  end_date: "",
  categoryIDS: [],
  sectorIDS: [],
  search_terms: "",
  orderBy: "date",
  order: "DESC",
  limit: 10,
};
export default function ExpenseReport() {
  const componentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [expenseReport, setExpenseReport] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [totalExpense, setTotalExpense] = useState(parseFloat(0).toFixed(2));
  const [activeModal, setActiveModal] = useState("");
  const [modalData, setModalData] = useState({
    id: null,
    user_id: null,
    account_id: "", // Set default value to an empty string
    amount: "", // Set default value to an empty string
    refundable_amount: 0, // Set default value to an empty string
    refunded_amount: 0,
    category_id: null,
    description: "",
    reference: "",
    date: "",
    note: "",
    attachment: "",
  });
  const [filterQuery, setFilterQuery] = useState(defaultQuery);
  const [hasFilter, setHasFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { applicationSettings } = useContext(SettingsContext);
  let { default_currency } = applicationSettings;

  if (default_currency === undefined) {
    default_currency = "AED ";
  }
  const showExpenseDetails = (expense, index) => {
    setActiveModal(index);
    setModalData(expense);
    setShowModal(true);
  };

  const {data: getExpenseReport} = useGetExpenseReportDataQuery({query:filterQuery});
  const {data: getSectorListData} = useGetSectorListDataQuery();

  useEffect(() => {
    document.title = "Expenses Report";
    if (getExpenseReport?.expenses.length>0){
      setExpenseReport(getExpenseReport?.expenses);
      setTotalExpense(getExpenseReport?.totalExpense);
    }
    if (getSectorListData?.data) {
      setSectors(getSectorListData.data);
    }
  }, [getExpenseReport?.expenses,hasFilter]);

  const handleCloseModal = () => {
    setActiveModal("");
    setShowModal(false);
  };


  const handleFilterSubmit = (e) => {
    setHasFilter(true);
  };
  const resetFilterParameter = () => {
    setFilterQuery(defaultQuery);
    setHasFilter(false);
  };

  return (
    <div>
      <MainLoader loaderVisible={loading} />
        <Container fluid>
            <Row>
              <Col xs={6} md={4}>
                <div className={"quick-filter"}>
                  <InputGroup className="mb-3" style={{width:'70%'}} >
                    <InputGroup.Text id="auick-filter-by-sector">
                      {"Quick Filter"}
                    </InputGroup.Text>
                    <Form.Select
                        value={filterQuery.sec_id}
                        aria-label="Filter By Sectors"
                        id="sector"
                        name="sector"
                        onChange={(event) => {
                          const value = event.target.value || '';
                          setFilterQuery({...filterQuery,sec_id:value,cat_id:''});
                        }}>

                      <option defaultValue>Filter By Sectors</option>
                      {sectors.map(sector => (
                          <option key={"sec-" + genRand(8)} value={sector.value}>
                            {sector.label}
                          </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                  <ExpenseFilter
                      params={filterQuery}
                      setParam={setFilterQuery}
                      handleFilterSubmit={handleFilterSubmit}
                      resetFilterParameter={resetFilterParameter}
                  />
                </div>
              </Col>
              <Col xs={12} md={5}>

                <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
                  <ReactToPrint
                      trigger={() => (
                          <Button sx={{ ml: 1 }} variant="outlined">
                            Print
                          </Button>
                      )}
                      content={() => componentRef.current}
                  />
                </Box>

              </Col>
              <Col xs={12} md={3}>
                <div className='form-group'>
                  <input
                      className='custom-form-control'
                      placeholder='search by keywards'
                      value={filterQuery.search_terms}
                      onChange={(ev) =>
                          setFilterQuery({...filterQuery, search_terms: ev.target.value})
                      }
                  />
                </div>
              </Col>

            </Row>
          <Row>
            <div className="report-table-containe">
              <table className={"report-table"}>
                <thead>
                <tr className={"text-center"}>
                  <th>Expense Date</th>
                  <th>Expense Category</th>
                  <th>Description</th>
                  <th>Expense Amount</th>
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
                        {expenseReport.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">
                              Nothing found !
                            </td>
                          </tr>
                        ) : (
                          expenseReport.map((expense, index) => (
                            <tr key={expense.id} className={"text-start"}>
                              <td>{expense.date}</td>
                              <td>{expense.category_name}</td>
                              <td>
                                {expense.description}
                                <a
                                  onClick={() =>
                                    showExpenseDetails(expense, index)
                                  }
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
                                        index === activeModal
                                          ? faEye
                                          : faEyeSlash
                                      }
                                    />
                                  </span>
                                </a>
                                <Tooltip id={"expense-details"} />
                              </td>
                              <td className={"text-end"}>
                                {default_currency + " " + expense.amount}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    )}

                    <tfoot>
                      <tr>
                        <td className={"text-center fw-bold"} colSpan={2}>
                          Total Expense
                        </td>
                        <td className={"text-end fw-bold"} colSpan={2}>
                          {default_currency + " " + totalExpense}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
            </Row>
          </Container>

      {showModal && (
        <ExpenseShow
          handelCloseModal={handleCloseModal}
          title={"Expense Details"}
          data={modalData}
          currency={default_currency}
        />
      )}
    </div>
  );
}
