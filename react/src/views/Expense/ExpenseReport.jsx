import React, { useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../../axios-client.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash, faPrint
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
  quickFilterSectorID:"",
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
  const [searchTerms, setSearchTerms]=useState("");
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
    if (getExpenseReport?.expenses.length>0) {
      setExpenseReport(getExpenseReport?.expenses);
      setTotalExpense(getExpenseReport?.totalExpense);
    }else{
      setExpenseReport([]);
      setTotalExpense(parseFloat(0).toFixed(2));

    }

    if (getSectorListData?.data) {
      setSectors(getSectorListData.data);
    }
  }, [getExpenseReport?.expenses]);

  const filteredExpenseData = expenseReport.filter((expense)=>{
    return (
        expense.category_name.toLowerCase().includes(searchTerms?.toLowerCase()) ||
        expense.bank_name.toLowerCase().includes(searchTerms?.toLowerCase()) ||
        expense.amount.toLowerCase().includes(searchTerms?.toLowerCase()) ||
        expense.refundable_amount.toLowerCase().includes(searchTerms?.toLowerCase()) ||
        expense.refunded_amount.toLowerCase().includes(searchTerms?.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerms?.toLowerCase())
    );
  })
  const handleCloseModal = () => {
    setActiveModal("");
    setShowModal(false);
  };

  const handleFilterSubmit = (e) => {
    setHasFilter(true);
  };
  console.log(hasFilter)
  const resetFilterParameter = () => {
    setFilterQuery(defaultQuery);
    setHasFilter(false);
  };
  const handelQuickFilter = (e)=>{
    setFilterQuery(defaultQuery);
    setFilterQuery({...filterQuery,quickFilterSectorID: e.target.value})
  }

  return (
    <div>
      <MainLoader loaderVisible={loading} />
        <Container fluid>
            <Row>
              <Col xs={6} md={4}>
                <div className='form-group'>
                  <input
                      className='custom-form-control'
                      placeholder='search by keywards'
                      value={filterQuery.search_terms}
                      onChange={(ev) =>
                          setSearchTerms(ev.target.value)
                      }
                  />
                </div>
              </Col>

              <Col xs={6} md={4}>
                <div className={"quick-filter"}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="auick-filter-by-sector">
                      {"Quick Filter"}
                    </InputGroup.Text>
                    <Form.Select
                        value={filterQuery.quickFilterSectorID}
                        aria-label="Filter By Sectors"
                        id="sector"
                        name="sector"
                        onChange={(e)=>{handelQuickFilter(e)}}
                    >

                      <option defaultValue disabled={true}>Filter By Sectors</option>
                      {sectors.map(sector => (
                          <option key={"sec-" + genRand(8)} value={sector.value}>
                            {sector.label}
                          </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className={'expense-filter-actionBtn'}>
                  <ExpenseFilter
                      queryParams={filterQuery}
                      setQueryParams={setFilterQuery}
                      setHasFilter={setHasFilter}
                      defaultQueryParoms={defaultQuery}
                  />
                  <ReactToPrint
                      trigger={() => (
                          <button className={'btn btn-success btn-sm mr-2'}>
                            <FontAwesomeIcon icon={faPrint}/>{' Print'}</button>
                      )}
                      content={() => componentRef.current}
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
                        {filteredExpenseData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">
                              Nothing found !
                            </td>
                          </tr>
                        ) : (
                            filteredExpenseData.map((expense, index) => (
                            <tr className={"text-start"} key={`exp-rep-${index}`}>
                              <td>{expense.date}</td>
                              <td>{expense.category_name}</td>
                              <td className={"report-descriptions"}>
                                <span>{expense.description}</span>
                                {/*<a*/}
                                {/*  onClick={() =>*/}
                                {/*    showExpenseDetails(expense, index)*/}
                                {/*  }*/}
                                {/*  className={*/}
                                {/*    index === activeModal ? "text-primary fa-pull-right " : "text-muted fa-pull-right"*/}
                                {/*  }*/}
                                {/*  data-tooltip-id="expense-details"*/}
                                {/*  data-tooltip-content={"View details"}*/}
                                {/*>*/}
                                {/*  <span className="aside-menu-icon">*/}
                                {/*    <FontAwesomeIcon*/}
                                {/*      icon={*/}
                                {/*        index === activeModal*/}
                                {/*          ? faEye*/}
                                {/*          : faEyeSlash*/}
                                {/*      }*/}
                                {/*    />*/}
                                {/*  </span>*/}
                                {/*</a>*/}
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
