import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { checkPermission, compareDates } from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import { notification } from "../../components/ToastNotification.jsx";

import { Box, Button } from "@mui/material";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";
import {
  useChangePaymentStatusMutation,
  useDeleteSectorMutation,
  useGetSectorsDataQuery,
} from "../../api/slices/sectorSlice.js";
import ContractExtendForm from "./ContractExtendForm.jsx";
import Show from "./Show.jsx";
import SectorForm from "./SectorForm.jsx";
import SectorFilter from "./SectorFilter.jsx";

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

const defaultQuery = {
  searchTerm: "",
  payment_account_id: "",
  contract_start_date: "",
  contract_end_date: "",
  orderBy: "DESC",
  order: "",
  limit: 10,
};
export default function Sectors() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const [sectors, setSectors] = useState([]);
  const [sector, setSector] = useState(_initialSectorData);
  const [query, setQuery] = useState(defaultQuery);
  const [isPaginate, setIsPaginate] = useState(false);
  const [showHelperModel, setShowHelperModel] = useState(false);
  const [showHelperModelType, setShowHelperModelType] = useState("");
  const [activeInternetModal, setActiveInternetModal] = useState(null);
  const [activeElectricityModal, setActiveElectricityModal] = useState(null);
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [showContractExtend, setShowContractExtendModal] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);

  const { num_data_per_page, default_currency } = applicationSettings;

  const TABLE_HEAD = [
    { id: "name", label: "Sector", align: "left" },
    { id: "rent", label: "Rent", align: "right" },
    { id: "electricity", label: "Next Electricity Bill", align: "left" },
    { id: "internet", label: "Next internet Bill", align: "left" },
    { id: "cheque", label: "Next Payment", align: "left" },
  ];
  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);

  //api call
  const { data: getSectorsData, isFetching: sectorDataFetching } =
    useGetSectorsDataQuery(
      { currentPage, pageSize, query: query },
      { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
    );
  const [changePaymentStatus] = useChangePaymentStatusMutation();

  const [deleteSector] = useDeleteSectorMutation();
  useEffect(() => {
    document.title = "Manage Sectors";
    if (getSectorsData?.data) {
      setSectors(getSectorsData.data);
      setTotalCount(getSectorsData.total);
      setShowMainLoader(false);
      setSubTitle(`Showing ${getSectorsData?.data.length} results of ${getSectorsData.total}`);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getSectorsData, currentPage]);

  const showViewModalFunc = (sector) => {
    setShowDetails(true);
    setSector(sector);
  };

  const filteredSectors = sectors.filter((sector) =>
    sector.name.toLowerCase().includes(query.searchTerm.toLowerCase())
  );

  const onDelete = async (sector) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover the sector !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteSector({ id: sector.id }).unwrap(); // Using unwrap for error handling
          notification("success", response.message, response.description); // Display success message
        } catch (error) {
          notification(
            "error",
            error.data.message,
            error.data.description || "An error occurred."
          ); // Display error message
        }
      }
    });
  };

  const handleCloseModal = () => {
    setActiveElectricityModal("");
    setActiveInternetModal("");
    setShowHelperModel(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = await changePaymentStatus({
            paymentID: payment.id,
          }).unwrap();
          notification("success", data?.message, data?.description);
        } catch (err) {
          notification(
            "error",
            err?.message || "An error occurred",
            err?.description || "Please try again later."
          );
        }
      }
    });
  };

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };

  const filters = () => {
    return (
      <SectorFilter
        placeHolderTxt="Search by name..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
      />
    );
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
    if (type === "electricity") {
      setActiveElectricityModal(index);
    } else {
      setActiveInternetModal(index);
    }
    setSector(sector);
    setShowHelperModelType(type);
    setShowHelperModel(true);
  };

  const nextPaymentColumn = (payments, currency, handelPayment) => {
    let breakStatement = false;
    let nextPayment;
    payments.map((payment) => {
      if (breakStatement) {
        return;
      }
      if (payment.status === "unpaid" && payment.type === "cheque") {
        nextPayment = payment;
        breakStatement = true;
      }
    });

    if (nextPayment) {
      return (
        <>
          <span className={" text-" + compareDates(nextPayment.date)}>
            {nextPayment.date}
          </span>
          {compareDates(nextPayment.date) === "danger" && (
            <Button
              onClick={() => handlePay(nextPayment)}
              sx={{ cursor: "pointer" }}
            >
              <small>pay</small>
            </Button>
          )}
        </>
      );
    } else {
      return <span className={"text-success"}>All Paid</span>;
    }
  };

  const electricityBillColumn = (sector, index) => {
    return (
      <Box display={"flex"}>
        <Box sx={{ ml: 2 }} onClick={() => showHelperModels(sector, index,'electricity')}>
          {checkPayments(sector.payments, "electricity")}
        </Box>
      </Box>
    );
  };
  const internetBillColumn = (sector, index) => {
    return (
      <Box display={"flex"}>
        <Box
          sx={{ ml: 2 }}
          onClick={() => showHelperModels(sector, index, "internet")}
        >
          {checkPayments(sector.payments, "internet")}
        </Box>
      </Box>
    );
  };

  const modifiedSectors = filteredSectors.map(
    (
      {
        id,
        name,
        rent,
        payments,
        contract_start_date,
        contract_end_date,
        el_premises_no,
        el_business_acc_no,
        el_acc_no,
        el_note,
        el_billing_date,
        internet_acc_no,
        internet_billing_date,
        int_note,
        channels,
      },
      index
    ) => {
      const sector = {};
      sector.id = id;
      sector.name = name;
      sector.rent = rent;
      sector.contract_start_date = contract_start_date;
      sector.contract_end_date = contract_end_date;
      sector.el_premises_no = el_premises_no;
      sector.el_business_acc_no = el_business_acc_no;
      sector.el_acc_no = el_acc_no;
      sector.el_note = el_note;
      sector.el_billing_date = el_billing_date;
      sector.internet_acc_no = internet_acc_no;
      sector.internet_billing_date = internet_billing_date;
      sector.int_note = int_note;
      sector.payments = payments;
      sector.channels = channels;
      sector.electricity = electricityBillColumn(sector, index);
      sector.internet = internetBillColumn(sector, index);
      sector.cheque = nextPaymentColumn(payments, default_currency, handlePay);
      return sector;
    }
  );
  const showEditModalFunc = (sector) => {
    setShowSectorForm(true);
    setSector(sector);
  };
  const showContractExtendFunc = (sector) => {
    setShowContractExtendModal(true);
    setSector(sector);
  };
  const closeContractExtendModal = () => {
    setShowContractExtendModal(false);
  };
  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "sector_edit",
      textClass: "text-info",
    },
    {
      actionName: "Extend Contract",
      type: "modal",
      route: "",
      actionFunction: showContractExtendFunc,
      permission: "sector_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showViewModalFunc,
      permission: "sector_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "sector_delete",
      textClass: "text-danger",
    },
  ];
  const showSectorFormFunc = () => {
    setShowSectorForm(true);
  };
  const closeSectorModalFunc = () => {
    setShowSectorForm(false);
    setSector({});
  };
  const closeShowDetailsModal = () => {
    setShowDetails(false);
  };
  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />
      <CommonTable
        cardTitle={"List of Sectors"}
        cardSubTitle={subTitle}
        addBTN={{
          permission: checkPermission("sector_create"),
          txt: "New Sector",
          icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showSectorFormFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "sector table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: sectorDataFetching,
            loadingColSpan: 3,
            rows: modifiedSectors, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filters}
        loading={sectorDataFetching}
        loaderRow={query?.limit}
        loaderCol={3}
      />

      {showSectorForm && (
        <SectorForm
          handelCloseModal={closeSectorModalFunc}
          title={"Create New Sector"}
          id={sector.id}
        />
      )}

      {showContractExtend && (
        <ContractExtendForm
          handleCloseModal={closeContractExtendModal}
          element={sector}
        />
      )}
      {showDetails && (
        <Show
          handleCloseModal={closeShowDetailsModal}
          element={sector}
          currency={default_currency}
        />
      )}

      {
        showHelperModelType && (
              <SummeryCard
                  showModal={showHelperModel}
                  handelCloseModal={handleCloseModal}
                  data={sector}
                  currency={default_currency}
                  modalType={showHelperModelType}
                  Toast={Toast}
                  navigation={useNavigate}
              />
          )
      }

    </div>
  );
}
