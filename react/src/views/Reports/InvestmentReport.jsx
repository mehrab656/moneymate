import React, { useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../../axios-client.js";
import SummeryCard from "../../components/SummeryCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WizCard from "../../components/WizCard";
import { SettingsContext } from "../../contexts/SettingsContext";
import InvestmentReportChart from "../../components/chart/InvestmentReportChart.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import ReactToPrint from "react-to-print";
import { Box, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFilter } from "@fortawesome/free-solid-svg-icons";
import { Form, InputGroup } from "react-bootstrap";
import { useTheme } from "@mui/material/styles";
import { createDateInputStyle, createInputGroupTextStyle } from "../../styles/formThemeStyles.js";

export default function InvestmentReport() {
  const componentRef = useRef();

  const [getTotalInvestments, setTotalInvestments] = useState(0);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { applicationSettings, userRole, themeMode } = useContext(SettingsContext);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { default_currency } = applicationSettings;
  const theme = useTheme();
  const dateInputStyle = createDateInputStyle(theme);
  const inputGroupTextStyle = createInputGroupTextStyle(theme);

  const getInvestmentReports = () => {
    setLoading(true);
    try {
      axiosClient
        .get("/report/investment", {
          params: { start_date: startDate, end_date: endDate },
        })
        .then(({ data }) => {
          setTotalInvestments(data.totalInvestment);
          setInvestments(data.investments);
          setLoading(false);
        });
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    document.title = "Investment Reports";
    getInvestmentReports();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    getInvestmentReports();
  };

  return (
    <>
      <MainLoader loaderVisible={loading} />
      <div className={'report-page'}>
        <div className={'report-header'}>
          <span className={'page-title-header'}>Investments</span>
          <div className={'d-flex align-items-center gap-2'}>
            <button className={"btn btn-secondary btn-sm"}>
              <FontAwesomeIcon icon={faDownload} />
              {" Download CSV"}
            </button>
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <ReactToPrint
                trigger={() => (
                  <Button sx={{ ml: 1 }} variant="outlined">
                    Print
                  </Button>
                )}
                content={() => componentRef.current}
              />
            </Box>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <WizCard className="animated fadeInDown">
          <div className="row">
            <form onSubmit={handleSubmit}>
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <InputGroup className="mb-3" size="sm">
                    <InputGroup.Text id="start_date_label" style={inputGroupTextStyle}>
                      Start Date
                    </InputGroup.Text>
                    <Form.Control
                      aria-describedby="start_date_label"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={dateInputStyle}
                    />
                  </InputGroup>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <InputGroup className="mb-3" size="sm">
                    <InputGroup.Text id="end_date_label" style={inputGroupTextStyle}>
                      End Date
                    </InputGroup.Text>
                    <Form.Control
                      aria-describedby="end_date_label"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={dateInputStyle}
                    />
                  </InputGroup>
                </div>
              </div>
              <div className="col-12">
                <button className={"btn-add right"} type="submit">
                  Filter
                </button>
              </div>
            </form>
          </div>
          <div className="row" ref={componentRef}>
            <div className="col-12">
              <h1 className="title-text text-center">
                Total Investment Reports
              </h1>
              <div className="table-scroll">
                <table className="table table-bordered custom-table">
                <thead>
                  <tr className={"text-center"}>
                    <th>Investor Name</th>
                    <th>Invested Amount</th>
                  </tr>
                </thead>
                {loading && (
                  <tbody>
                    <tr className={"text-center"}>
                      <td colSpan={6} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  </tbody>
                )}
                {!loading && (
                  <tbody>
                    {investments.map((investment) => (
                      <tr
                        key={investment.investor_id}
                        className={"text-center"}
                      >
                        <td>{investment.username}</td>
                        <td>{default_currency + " " + investment.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
                </table>
              </div>
            </div>
          </div>
        </WizCard>
      </div>
      <div className="col-md-4">
        <div className="row">
          <div className="mb-4">
            <SummeryCard
              value={getTotalInvestments}
              summary="Total Investments"
              icon={<AttachMoneyIcon />}
              iconClassName="icon-success"
              currency={default_currency}
            />
          </div>

          <div>
            <WizCard className="animated fadeInDown">
              <InvestmentReportChart
                totalInvestment={getTotalInvestments}
                investors={investments}
                checkLoading={loading}
                title="Investment chart"
              />
            </WizCard>
          </div>
        </div>
      </div>
    </>
  );
}
