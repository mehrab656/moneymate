import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../../components/WizCard.jsx";
import { Button, Form, Modal } from "react-bootstrap";
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
  const [modalInvest, setModalInvest] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(null);

  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;

  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);

  const showInvestment = (invest) => {
    setModalInvest(invest);
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
            placeholder='Search Investment...'
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
                                {monthNames[
                                  new Date(nextPayment.date).getMonth()
                                ] +
                                  " " +
                                  dateOrdinal(
                                    new Date(nextPayment.date).getDate()
                                  ) +
                                  ", " +
                                  new Date(nextPayment.date).getFullYear()}
                              </a>
                              <Tooltip id='next-payment-date' />
                            </td>
                            <td>{0}</td>
                            <td>{0}</td>
                            <td>
                              <ActionButtonHelpers
                                module={sector}
                                showModule={showInvestment}
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
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>Investment Details</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className='footable table table-bordered table-striped mb-0'>
            <thead></thead>
            <tbody>
              <tr>
                <td width='50%'>
                  <strong>Investor Name :</strong>
                </td>
                <td>{modalInvest?.investor_name}</td>
              </tr>
              <tr>
                <td width='50%'>
                  <strong>Investment Amount :</strong>
                </td>
                <td> ${modalInvest?.amount}</td>
              </tr>
              <tr>
                <td width='50%'>
                  <strong>Note :</strong>
                </td>
                <td>{modalInvest?.note}</td>
              </tr>
              <tr>
                <td width='50%'>
                  <strong>Date :</strong>
                </td>
                <td>{modalInvest?.sector_date}</td>
              </tr>
            </tbody>
          </table>
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
