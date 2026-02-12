import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import { useThemedSwal } from "../../components/SwalConfirm.js";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { checkPermission, compareDates } from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import { notification } from "../../components/ToastNotification.jsx";

import { Box, Button, Card, Collapse, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from "@mui/material/styles";

import Iconify from "../../components/Iconify.jsx";
import SidebarFooterButtons from "../../components/SidebarFooterButtons.jsx";
import CommonTable from "../../components/table/CommonTable.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import {
  useChangePaymentStatusMutation,
  useDeleteSectorMutation,
  useGetSectorsDataQuery,
} from "../../api/slices/sectorSlice.js";
import ContractExtendForm from "./ContractExtendForm.jsx";
import SectorDetails from "./SectorDetails.jsx";
import SectorFormSidebar from "./SectorFormSidebar.jsx";
import SectorFilter from "./SectorFilter.jsx";
import AssetFormSidebar from "../Assets/AssetFormSidebar.jsx";
import ContractExtendSidebar from "./Components/ContractExtendSidebar.jsx";
import Swal from "sweetalert2";

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
  const theme = useTheme();
  const { confirmDelete, mixin } = useThemedSwal();
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
  // details handled via GlobalSidebar
  const [hasFilter, setHasFilter] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const { num_data_per_page, default_currency } = applicationSettings;

  const TABLE_HEAD = [
    { id: "name", label: "Sector", align: "left" },
    { id: "rent", label: "Rent", align: "right" },
    { id: "electricity", label: "Next Electricity Bill", align: "left" },
    { id: "internet", label: "Next internet Bill", align: "left" },
    { id: "cheque", label: "Next Payment", align: "left" },
  ];
  // page size derived from query limit with fallback to app setting
  const pageSize = Number(query.limit) > 0 ? Number(query.limit) : (num_data_per_page || 10);
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

  //api call
  const { data: getSectorsData, isFetching: sectorDataFetching, isError: sectorDataError } =
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

  // sync initial limit with app settings
  useEffect(() => {
    if (num_data_per_page && num_data_per_page > 0) {
      setQuery((prev) => ({ ...prev, limit: num_data_per_page }));
    }
  }, [num_data_per_page]);

  const showViewModalFunc = (sector) => {
    setSector(sector);
    showQuickDetails("Details", <SectorDetails data={sector} currency={default_currency} />);
  };

  const filteredSectors = sectors.filter((sector) =>
    sector.name.toLowerCase().includes(query.searchTerm.toLowerCase())
  );

  const onDelete = async (sector) => {
    confirmDelete('sector', { confirmButtonText: 'Yes, delete it!' }).then(async (result) => {
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
    setIsPaginate(true);
  };

  const handleRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, limit: newSize }));
    setCurrentPage(1);
    setIsPaginate(true);
  };

  const Toast = mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Toast.stopTimer;
      toast.onmouseleave = Toast.resumeTimer;
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
    setSector(sector);
    const editRef = React.createRef();
    const formId = "sector-form-global";
    showLargeContent(
      "Edit Sector",
      <SectorFormSidebar
        ref={editRef}
        sectorId={sector.id}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          setIsPaginate(true);
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[
              {
                label: "Update",
                type: "button",
                onClick: () => editRef.current?.saveAndExit(),
              },
            ]}
          />
        )
      }
    );
  };
  const showContractExtendFunc = (sector) => {
    setShowContractExtendModal(true);
    setSector(sector);

  };
  const closeContractExtendModal = () => {
    setShowContractExtendModal(false);
  };
  
  // Sidebar actions
  const { showLargeContent, showQuickDetails } = useSidebarActions();
  const showSectorFormFunc = () => {
    const createRef = React.createRef();
    const formId = "sector-form-global";
    showLargeContent(
      "Create Sector",
      <SectorFormSidebar
        ref={createRef}
        sectorId={null}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          setIsPaginate(true);
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[
              {
                label: "Save",
                type: "submit",
                formId: formId,
              },
              {
                label: "Save and Exit",
                type: "button",
                onClick: () => createRef.current?.saveAndExit(),
              },
            ]}
          />
        )
      }
    );
  };
  const closeSectorModalFunc = () => {
    setShowSectorForm(false);
    setSector({});
  };


  const showContractExtendSidebar = (sector) => {
    const createRef = React.createRef();
    const formId = "contract-extend-form";
    showLargeContent(
        `Extend Contract for ${sector.name}`,
        <ContractExtendSidebar
            ref={createRef}
            element={sector}S
            formId={formId}
            hideInternalFooter={true}
            onSuccess={() => {
              // Refresh the assets list after successful creation
              setIsPaginate(true);
            }}
        />, {
          footerActions: (
              <SidebarFooterButtons
                  actions={[
                    {
                      label: "Update Contract",
                      type: "submit",
                      formId: formId,
                    }
                  ]}
              />
          )
        }
    );
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
      // actionFunction: showContractExtendFunc,
      actionFunction: showContractExtendSidebar,
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
    },{
      actionName: "WelcomeScreen",
      type: "route",
      route: "/manage-welcome-screen/",
      actionFunction:"",
      permission: "view_welcome_screen",
      textClass: "text-danger",
    },
  ];

  // details sidebar manages its own close via context
  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />
      {/* Header with Add button and Filter toggle */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={"page-title-header"}>Sectors</span>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {checkPermission("sector_create") && (
            <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showSectorFormFunc}>
              <Iconify icon={"eva:plus-fill"} />
            </button>
          )}
          <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
            <ArrowDropDownIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible filter */}
      <Collapse in={showFilter} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, mb: 2 }}>{filters()}</Box>
      </Collapse>

      {/* Card-wrapped modern table */}
      <Card
        sx={{
          p: 5,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          '& .MuiTableContainer-root': { backgroundColor: theme.palette.background.paper },
          '& .MuiPaper-root': { backgroundColor: theme.palette.background.paper },
          '& .MuiTableCell-root': { color: theme.palette.text.primary },
        }}
        style={{ padding: "0px" }}
      >
        <CommonTable
          data={modifiedSectors}
          tableColumns={TABLE_HEAD}
          actionButtons={actionParams}
          pagination={{
            totalPages: totalPages ?? 0,
            totalCount: totalCount,
            currentPage: currentPage,
            handlePageChange: handlePageChange,
            pageSize: pageSize,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          cardSubTitle={`Page-${currentPage} (showing ${modifiedSectors.length} results from ${totalCount})`}
          isFetching={sectorDataFetching}
          hasError={sectorDataError}
        />
      </Card>

      {/* Sector creation/editing now handled in GlobalSidebar via SectorFormSidebar */}

      {showContractExtend && (
        <ContractExtendForm
          handleCloseModal={closeContractExtendModal}
          element={sector}
        />
      )}
      {/* Details are displayed via GlobalSidebar using SectorDetails */}

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
