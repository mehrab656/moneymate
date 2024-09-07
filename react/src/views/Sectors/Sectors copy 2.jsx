import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import WizCard from "../../components/WizCard.jsx";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import { Tooltip } from "react-tooltip";
import MainLoader from "../../components/MainLoader.jsx";
import { checkPermission, compareDates } from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import {
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import Checkbox from "@mui/material/Checkbox";
import useTable, { emptyRows, getComparator } from "../../hooks/useTable.js";
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  Divider,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
  Backdrop,
} from "@mui/material";
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TableToolbar,
} from "../../components/table/index.js";
import Scrollbar from "../../components/Scrollbar.jsx";
import SectorTableRow from "../../components/table/TableRows/SectorTableRow.jsx";
import HeaderBreadcrumbs from "../../components/HeaderBreadcrumbs.jsx";
import Iconify from "../../components/Iconify.jsx";

export default function Sectors() {
  const navigate = useNavigate()
  const [tableData, setTableData] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState(1);

  const TABLE_HEAD = [
    { id: "id", label: "ID", align: "left" },
    { id: "sector", label: "Sector", align: "left" },
    { id: "electricity", label: "Electricity next payment", align: "left" },
    { id: "internet", label: "Internet next payment", align: "left" },
    { id: "cheque", label: "Cheque next payment", align: "left" },
    { id: "action", label: "Actions", align: "right" },
    { id: "" },
  ];
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    onSelectRow,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterStatus,
  });

  const denseHeight = dense ? 52 : 72;

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleFilterRole = (event) => {
    setFilterRole(event.target.value);
  };

  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalSector, setModalSector] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHelperModel, setShowHelperModel] = useState(false);
  const [showHelperModelType, setShowHelperModelType] = useState("");
  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);
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
  const [sector, setSector] = useState({
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
  });

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
  const getSectors = (page, pageSize) => {
    setLoading(true);
    axiosClient
      .get("/sectors", { params: { page, pageSize } })
      .then(({ data }) => {
        setLoading(false);
        setSectors(data.data);
        setTableData(data.data);
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
            getSectors();
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

  const actionParams = {
    route: {
      editRoute: "/sector/update/",
      viewRoute: "",
      deleteRoute: "",
    },
  };
  const handleCloseModal = () => {
    setActiveElectricityModal("");
    setShowModal(false);
    setShowHelperModel(false);
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
    setActiveElectricityModal(index);
    setSector(sector);
    setShowHelperModelType(type);
    setShowHelperModel(true);
  };
  const showTableColumns = (column) => {
    console.log({ column });
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
  return (
    <div>
      <MainLoader loaderVisible={loading} />
      <Container maxWidth={"xl"}>
      <Card sx={{p:5}}>
        <HeaderBreadcrumbs
          heading="Sector List"
          links={[
            { name: "Dashboard", href:'/' },
            { name: "Sector" },
            { name: "List" },
          ]}
          action={
            <Button
              variant="contained"
              component={Link}
              to={'/dashboard/hr/jobCreate'}
              startIcon={<Iconify icon={"eva:plus-fill"} />}
            >
              New Sector
            </Button>
          }
        />

          <TableToolbar
            filterName={filterName}
            filterRole={filterRole}
            onFilterName={handleFilterName}
            onFilterRole={handleFilterRole}
          />

          <Scrollbar>
            <TableContainer >
              <Table size={dense ? "small" : "medium"}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, key) => (
                        <SectorTableRow
                      key={key}
                      row={row}
                      selected={selected.includes(row.uuid)}
                      onSelectRow={() => onSelectRow(row.uuid)}
                      onDeleteRow={() => handleDeleteRow(row.uuid)}
                      onEditRow={() => navigate(`sector/update/${roe?.id}`)}
                    />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: "relative" }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Dense"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: "absolute" } }}
            />
          </Box>
        </Card>
        {/* <ToastContainer /> */}
      </Container>

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

// ----------------------------------------------------------------------

function applySortFilter({
  tableData,
  comparator,
  filterName,
  filterStatus,
  filterRole,
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter(
      (item) =>
        item.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
