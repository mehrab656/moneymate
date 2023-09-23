import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../../components/WizCard.jsx";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import ExpenseExportButton from "../../components/ExpenseExportButton.jsx";
import { Tooltip } from "react-tooltip";

export default function Sectors() {
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalSector, setModalSector] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(null);

  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;

  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);

  const showSector = (sector) => {
    console.log('sector', sector)
    setModalSector(sector);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    document.title = "Manage Sectors";
    getSectors(currentPage, pageSize);
  }, [currentPage, pageSize]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  // const filteredSectors = sectors.filter((sector) => {

  //     return sector.investor_id.toLowerCase().includes(searchTerm.toLowerCase())
  //         || sector.account_id.toLowerCase().includes(searchTerm.toLowerCase())
  //         || sector.amount.toLowerCase().includes(searchTerm.toLowerCase())
  // });

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
          .then((res) => {
            getSectors();
            Swal.fire({
              title: "Deleted!",
              text: "sector has been deleted.",
              icon: "success",
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "Error!",
              text: "sector could not be deleted.",
              icon: "error",
            });
          });
      }
    });
  };

  const actionParams = {
    route: {
      editRoute: "/sector/",
      viewRoute: "",
      deleteRoute: "",
    },
  };

  function dateOrdinal(date) {
    return (
      date +
      (31 === date || 21 === date || 1 === date
        ? "st"
        : 22 === date || 2 === date
        ? "nd"
        : 23 === date || 3 === date
        ? "rd"
        : "th")
    );
  }
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function compareDates(date) {
    const currentDate = new Date().getDate();

    const billingDate = new Date(date).getDate();
    const res = billingDate - currentDate;
    return res >= 5 ? "success" : "danger";
  }

  // handle pay
  const handlePay = async(payment)=>{
    console.log('payment', payment)
   await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.isConfirmed) {
         //methods
        }
      })
  }

  return (
    <div>
      <div className='d-flex justify-content-between align-content-center gap-2 mb-3'>
        <h1 className='title-text mb-0'>Sectors Histories</h1>
        {userRole === "admin" && (
          <Link className='btn-add align-right mr-3' to='/sector/new'>
            <FontAwesomeIcon icon={faPlus} /> Add New
          </Link>
        )}
      </div>

      <WizCard className='animated fadeInDown'>
        <div className='mb-4'>
          <input
            className='custom-form-control'
            type='text'
            placeholder='Search Sector...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='table-responsive-sm'>
          <table className='table table-bordered custom-table'>
            <thead>
              <tr className={"text-center"}>
                <th>Sector</th>
                <th>Electricity Billing Date</th>
                <th>Internet Billing Date</th>
                <th>Next Payment Date</th>
                <th>Total Expense</th>
                <th>Total Income</th>
                <th width='20%'>Action</th>
              </tr>
            </thead>
            {loading && (
              <tbody>
                <tr>
                  <td colSpan={8} className='text-center'>
                    Loading...
                  </td>
                </tr>
              </tbody>
            )}
            {!loading && (
              <tbody>
                {sectors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='text-center'>
                      No Sectors found
                    </td>
                  </tr>
                ) : (
                  <>
                    {sectors &&
                      sectors.length > 0 &&
                      sectors.map((sector, i) => {
                        var breakStatement = false;
                        var nextPayment;
                        var status;
                        sector?.payments.map((payment) => {
                          if (breakStatement) {
                            return;
                          }
                          if (payment.status === "unpaid") {
                            nextPayment = payment;
                            breakStatement = true;
                          }
                        });
                        return (
                          <tr className={"text-center"} key={sector.id}>
                            <td>{sector.name}</td>
                            <td>
                              <a
                                className={
                                  "text-" + compareDates(sector.el_billing_date)
                                }
                                data-tooltip-id='dewa-account'
                                data-tooltip-content={
                                  "Premises Number: " + sector.el_premises_no
                                }
                              >
                                {dateOrdinal(
                                  new Date(sector.el_billing_date).getDate()
                                ) +
                                  " of " +
                                  monthNames[new Date().getMonth()]}
                              </a>
                              <Tooltip id='dewa-account' />
                            </td>
                            <td>
                              <a
                                className={
                                  "text-" +
                                  compareDates(sector.internet_billing_date)
                                }
                                data-tooltip-id='internet-account'
                                data-tooltip-content={
                                  "Account Number: " +
                                  String(sector.internet_acc_no).slice(-4)
                                }
                              >
                                {dateOrdinal(
                                  new Date(
                                    sector.internet_billing_date
                                  ).getDate()
                                ) +
                                  " of " +
                                  monthNames[new Date().getMonth()]}
                              </a>
                              <Tooltip id='internet-account' />
                            </td>

                            <td>
                              <a
                                className={
                                  "text-" + compareDates(nextPayment.date)
                                }
                                data-tooltip-id='next-payment-date'
                                data-tooltip-content={`Payment Due: ${default_currency} ${nextPayment.amount}`}
                              >
                                {monthNames[new Date(nextPayment.date).getMonth()] +
                                  " " +
                                  dateOrdinal(
                                    new Date(nextPayment.date).getDate()
                                  ) +
                                  ", " +
                                  new Date(nextPayment.date).getFullYear()}
                              </a>
                              <Tooltip id='next-payment-date' />
                              {compareDates(nextPayment.date) ==='danger' && <Button onClick={(e)=> handlePay(nextPayment)} className="ml-3">Pay now</Button>}
                                {/* <Button onClick={(e)=> handlePay(nextPayment)} className="ml-3">Pay now</Button> */}
                              
                            </td>
                            <td>{0}</td>
                            <td>{0}</td>
                            <td>
                              <ActionButtonHelpers
                                module={sector}
                                showModule={showSector}
                                deleteFunc={onDelete}
                                params={actionParams}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </>
                )}
              </tbody>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />
            {paginationItems}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </Pagination>
        )}
      </WizCard>

      <Modal
        show={showModal}
        centered
        onHide={handleCloseModal}
        className='custom-modal'
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>Sector Details</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body scrollable={true}>
          <table className='footable table table-bordered table-striped mb-0'>
            <thead></thead>
            <tbody>
              <tr>
                <td width='50%'>
                  <strong>Sector Name :</strong>
                </td>
                <td >{modalSector?.name}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Contact Start Date :</strong>
                </td>
                <td> {modalSector?.contract_start_date}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Contact End Date :</strong>
                </td>
                <td> {modalSector?.contract_end_date}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Electricity Acc No. :</strong>
                </td>
                <td> {modalSector?.el_acc_no}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Electricity Business Acc No:</strong>
                </td>
                <td> {modalSector?.el_business_acc_no}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Electricity Billing Date :</strong>
                </td>
                <td> {modalSector?.el_billing_date}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Electricity Premises No. :</strong>
                </td>
                <td> {modalSector?.el_premises_no}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Electricity Note:</strong>
                </td>
                <td> {modalSector?.el_note}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Internet Acc No:</strong>
                </td>
                <td> {modalSector?.internet_acc_no}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Internet Billing Date:</strong>
                </td>
                <td> {modalSector?.internet_billing_date}</td>
              </tr>
              <tr>
                <td width='50%'> 
                  <strong>Internet Note:</strong>
                </td>
                <td> {modalSector?.int_note}</td>
              </tr>
              
              {/* payment table start */}
              {/* <tr>
                <td width='100%'>
                  <strong></strong>
                </td>
                <td></td>
              </tr>
              <tr>
                <td width='100%' className="display-flex justify-content-center">
                  <strong>Payment Info </strong>
                </td>
                <td>{modalSector?.sector_date}</td>
              </tr> */}

            


            </tbody>
          </table>
          <p className="mt-3 mb-3">Payment Info </p>
          <Table responsive striped bordered hover variant="light">
              
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Payment No.</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                {modalSector?.payments && modalSector?.payments.length>0 && modalSector?.payments.map((data, i)=>{
                    return(
                        <tr key={data.id}>
                            <td>{i+1}</td>
                            <td>{data?.payment_number}</td>
                            <td>{data?.amount}</td>
                            <td>{data?.date}</td>
                            {data?.status ==='paid'? <td style={{color:'green'}}>{data?.status}</td>:<td style={{color:'red'}}>{data?.status}</td>}
                        </tr>
                    )
                }) }
                  
                </tbody>
                </Table>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-primary' onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
