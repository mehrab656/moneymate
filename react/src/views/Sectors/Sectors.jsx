import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import {checkPermission, compareDates} from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import { notification } from "../../components/ToastNotification.jsx";

import {
  Box,

  Button,

} from "@mui/material";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";

const _initialSectorData = {
  contract_end_date: "",
  contract_start_date: "",
  el_acc_no: "",
  el_billing_date: "",
  el_business_acc_no: "",
  el_note: "",
  el_premises_no: "",
  id: null,
  int_note: "",
  internet_acc_no: "",
  internet_billing_date: "",
  name: "",
  payments: [],
};
export default function Sectors() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
  const [sectors, setSectors] = useState([]);
  const [sector, setSector] = useState(_initialSectorData);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { num_data_per_page,
    default_currency } = applicationSettings;
  const TABLE_HEAD = [
    { id: "name", label: "Sector", align: "left" },
    { id: "rent", label: "Rent", align: "right" },
    { id: "el_acc_no", label: "Elec. Account", align: "right" },
    { id: "internet_acc_no", label: "Int. Account", align: "right" },
    { id: "electricity", label: "Electricity next payment", align: "right" },
    { id: "internet", label: "Internet next payment", align: "left" },
    { id: "cheque", label: "Cheque next payment", align: "right" },
  ];
  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);
  const actionParams = {
    route: {
      editRoute: "/sector/update/",
      viewRoute: "",
      deleteRoute: "",
    },
  };

  const filteredSectors = sectors.filter(
      (sector) =>
          sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDelete = (sector) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover the sector !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient
            .delete(`sector/${sector.id}`)
            .then((data) => {
              getSectors(currentPage,pageSize);
              notification("success", data?.message, data?.description);
            })
            .catch((err) => {
              if (err.response) {
                const error = err.response.data;
                notification("error", error?.message, error.description);
              }
            });
      }
    });
  };

  const showSector = (sector) => {
    axiosClient(`/sectorsIncomeExpense/${sector.id}`)
        .then(({ data }) => {
          setIncomeExpense(data);
        })
        .catch((e) => {
          console.warn(e);
        });
    setModalSector(sector);

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setActiveElectricityModal("");
    setActiveInternetModal("");
    setShowModal(false);
    setShowHelperModel(false);
  };

  const getSectors = (page, pageSize) => {
    setLoading(true);
    axiosClient
        .get("/sectors", { params: { page, pageSize } })
        .then(({ data }) => {
          setLoading(false);
          setSectors(data.data);
          setTotalCount(data.total);
        })
        .catch(() => {
          setLoading(false);
        });
  };

  useEffect(() => {
    document.title = "Manage Sectors";
    getSectors(currentPage, pageSize);
  }, [currentPage, pageSize]);
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const [modalSector, setModalSector] = useState(false);
  const [showHelperModel, setShowHelperModel] = useState(false);
  const [showHelperModelType, setShowHelperModelType] = useState("");
  const [activeInternetModal, setActiveInternetModal] = useState(null);
  const [activeElectricityModal, setActiveElectricityModal] = useState(null);
  const [incomeExpense, setIncomeExpense] = useState({
    income: 0,
    expense: 0,
  });
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


  // handle pay
  const handlePay = async (payment) => {
    await Swal.fire({
      title: `${default_currency + " " + payment.amount} has already paid?`,
      text: "Are You sure the payment has paid!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes ! Sure",
      cancelButtonText: "Not Now !",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient
          .post(`/change-payment-status/${payment.id}`)
          .then(({ data }) => {
            notification("success", data?.message, data?.description);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          })
          .catch((err) => {
            if (err.response) {
              const error = err.response.data;
              notification("error", error?.message, error.description);
            }
          });
      }
    });
  };



  const checkPayments = (payments, type) => {
    let message = "";
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      if (payment.type === type && payment.status === "unpaid") {
        message = payment.date;
        break;
      }
    }
    return (
      <span className={message === "" ? "text-success" : "text-warning"}>
        {message === "" ? "All Clear" : message}
      </span>
    );
  };

  const showHelperModels = (sector, index, type = "electricity") => {
    if (type==='electricity'){
      setActiveElectricityModal(index);
    }else{
      setActiveInternetModal(index);
    }
    setSector(sector);
    setShowHelperModelType(type);
    setShowHelperModel(true);
  };

  const remainingContract = (end) => {
    let startDate = new Date();

    let endDate = new Date(end);

    const startYear = startDate.getFullYear();
    const february =
      (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0
        ? 29
        : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
    return yearDiff + " Year " + monthDiff + " Months " + dayDiff + " Days.";
  };
  const nextPaymentColumn = (payments,currency,handelPayment)=>{
    let breakStatement = false;
    let nextPayment;
    payments.map((payment) => {
      if (breakStatement) {
        return;
      }
      if (payment.status === "unpaid" && payment.type === 'cheque') {
        nextPayment = payment;
        breakStatement = true;
      }
    });

    if (nextPayment) {
    return <Box display={'flex'}>
      <Box sx={{ml: 2}}>
        <span className={"text-" + compareDates(nextPayment.date)}>{nextPayment.date}</span>
        {compareDates(nextPayment.date) === 'danger' &&
            <Button
                onClick={() => handlePay(nextPayment)}
                sx={{cursor: "pointer"}}>
              <small>pay</small>
            </Button>
        }
      </Box>

    </Box>
    }else {
      return <Box sx={{ml:2}}><Button variant='outlined'>All Paid</Button></Box>;
    }
  }

  const electricityBillColumn =(sector,index)=>{
    return (<Box display={'flex'}>
      <Box sx={{ml:2}} onClick={() => showHelperModels(sector, index)}>{checkPayments(sector.payments, 'internet')}</Box>
    </Box>)
  }
  const internetBillColumn =(sector,index)=>{
    return (<Box display={'flex'}>
      <Box sx={{ml:2}} onClick={() => showHelperModels(sector, index,"internet")}>{checkPayments(sector.payments, 'internet')}</Box>
    </Box>)
  }

  const modifiedSectors = filteredSectors.map((sector,index)=>{
    sector.electricity = electricityBillColumn(sector,index);
    sector.internet = internetBillColumn(sector, index);
    sector.cheque = nextPaymentColumn(sector.payments,default_currency,handlePay);
    return sector;
  });


  return (
    <div>
      <MainLoader loaderVisible={loading} />
      <CommonTable
          cardTitle={"List of Sectors"}
          addBTN={
            {
              permission: checkPermission(userPermission.sector_create),
              txt: "Create New",
              icon:(<Iconify icon={"eva:plus-fill"} />), //"faBuildingFlag",
              link:"/sector/new"
            }
          }
          paginations={{
            totalPages: totalPages,
            totalCount: totalCount,
            currentPage: currentPage,
            handlePageChange: handlePageChange
          }}
          table={{
            size: "small",
            ariaLabel: 'sector table',
            showIdColumn: userRole === 'admin' ?? false,
            tableColumns: TABLE_HEAD,
            tableBody: {
              loading: loading,
              loadingColSpan: 8,
              rows: filteredSectors,//rendering data
            },
            actionBtn: {
              showModule: showSector,
              deleteFunc: onDelete,
              params: actionParams,
              editDropdown: userPermission.sector_edit,
              showPermission: userPermission.sector_view,
              deletePermission: userPermission.sector_delete
            }
          }}
          filter={{
            filterByText:true,
            placeHolderTxt:'Search Sector...',
            searchBoxValue:searchTerm,
            handelSearch: setSearchTerm
          }}
      />

      <SummeryCard
        showModal={showHelperModel}
        handelCloseModal={handleCloseModal}
        data={sector}
        currency={default_currency}
        modalType={showHelperModelType}
        Toast={Toast}
        navigation={useNavigate}
        loadingMethod={setLoading}
      />

      <Modal
        size="lg"
        show={showModal}
        centered
        onHide={handleCloseModal}
        className="custom-modal lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>{modalSector?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered border-primary ">
            <tbody>
              <tr>
                <td>
                  Rent:<strong>{modalSector?.rent}</strong>
                </td>
                <td>
                  Contract Start:
                  <strong> {modalSector?.contract_start_date}</strong>
                </td>
                <td>
                  Contract End:
                  <strong> {modalSector?.contract_end_date}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>Contract Remaining</td>
                <td>
                  <strong>
                    {" "}
                    {remainingContract(modalSector.contract_end_date)}
                  </strong>
                </td>
              </tr>

              <tr>
                <td rowSpan={3}>DEWA account</td>
                <td>
                  AC/No:<strong> {modalSector?.el_acc_no}</strong>
                </td>
                <td>
                  Business Num.:
                  <strong> {modalSector?.el_business_acc_no}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  Premises:<strong> {modalSector?.el_premises_no}</strong>
                </td>
                <td>
                  Billing Date:<strong> {modalSector?.el_billing_date}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>Note:</td>
              </tr>
              <tr>
                <td rowSpan={2}>Internet</td>
                <td>
                  Acc No:<strong> {modalSector?.internet_acc_no}</strong>
                </td>
                <td>
                  Billing Date:
                  <strong> {modalSector?.internet_billing_date}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>{"Note: " + modalSector?.int_note}</td>
              </tr>

              <tr>
                <td rowSpan={2}>{" Income and Expense"}</td>
                <td colSpan={2}>
                  Total Income:{" "}
                  <strong>
                    {default_currency + " " + incomeExpense.income}
                  </strong>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  Total Expense:{" "}
                  <strong>
                    {default_currency + " " + incomeExpense.expense}
                  </strong>
                </td>
              </tr>

              {modalSector?.channels && modalSector?.channels.length > 0 && (
                <>
                  <tr>
                    <td rowSpan={modalSector.channels.length + 1}>
                      {"Channels"}
                    </td>
                  </tr>
                  {modalSector?.channels.map((data, i) => {
                    return (
                      <tr key={"channel-row-" + i}>
                        <td colSpan={2}>
                          {data.channel_name} listing reference id{" "}
                          <strong>{data.reference_id}</strong> and listed on{" "}
                          {data.listing_date}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}

              <tr>
                <td colSpan={3}>
                  <strong>Payment Information</strong>
                </td>
              </tr>
              <tr>
                <th>#</th>
                <th>Payment No.</th>
                <th>Amount</th>
              </tr>
              {modalSector?.payments &&
                modalSector?.payments.length > 0 &&
                modalSector?.payments.map((data, i) => {
                  return (
                    <tr key={data.id}>
                      <td>{i + 1}</td>
                      <td>
                        {data?.payment_number}
                        <ul style={{ display: "inline" }}>
                          ({" "}
                          <a
                            href="#"
                            style={{
                              textDecoration: "none",
                              marginRight: 10,
                            }}
                          >
                            {data.date}
                          </a>
                          <a
                            href="#"
                            style={{
                              textDecoration: "none",
                              marginRight: 10,
                            }}
                          >
                            {data?.type}
                          </a>
                          )
                        </ul>
                      </td>
                      <td>
                        {default_currency + " " + data?.amount}
                        <div>
                          <a
                            href="#"
                            style={{
                              textDecoration: "none",
                              float: "right",
                              color: data?.status === "paid" ? "green" : "red",
                            }}
                          >
                            {data?.status}
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
