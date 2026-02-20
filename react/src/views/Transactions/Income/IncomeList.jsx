import React, { useEffect, useState, useContext, useRef } from "react";
import { useThemedSwal } from "../../../components/SwalConfirm.js";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import IncomeFilter from "./Components/IncomeFilter.jsx";
import {
  useGetIncomeDataQuery,
  useDeleteIncomeMutation,
} from "../../../api/slices/incomeSlice.js";
import IncomeFormSidebar from "./IncomeFormSidebar.jsx";
import IncomeDetails from "./IncomeDetails.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faEdit,
  faThList,
  faTrash,
  faEye, faFileImport,
} from "@fortawesome/free-solid-svg-icons";
import { Form, Row, Col } from "react-bootstrap";
import { Box, Card, useTheme } from "@mui/material";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import FilteredParameters from "../Expense/Components/FilteredParameters.jsx";
import CsvFileUpload from "./Components/CsvFileUpload.jsx";
import Iconify from "../../../components/Iconify.jsx";
import IncomeExportButton from "./Components/IncomeExportButton.jsx";
import Invoice from "./Components/Invoice.jsx"

const defaultQuery = {
  type: "",
  income_type: [],
  orderBy: "id",
  order: "DESC",
  limit: "",
  to_date: "",
  from_date: "",
  account_id: "",
  start_date: "",
  end_date: "",
  sectorIDS: [],
  sectorNames: [],
  check_for: "checkinout",
  check_from: "",
  check_to: "",
  reference: [],
  currentPage:1,
};
const TABLE_HEAD = [
  { id: "date", label: "Date", align: "left", className:'normal' },
  { id: "description", label: "Description", align: "left", className: "compact-desc" },
  { id: "amount", label: "Amount", align: "right", className: "normal" },
  { id: "category_name", label: "Sector", align: "left", className: "normal" },
  { id: "type", label: "Income Type", align: "left", className: "normal" },
];
export default function IncomeList() {
  const theme = useTheme();
  const { fire, confirmDelete } = useThemedSwal();
  const [totalCount, setTotalCount] = useState(0);
  const { applicationSettings } =
    useContext(SettingsContext);
  const [incomes, setIncomes] = useState([]);
  const [showCsvForm, setShowCsvForm] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const { num_data_per_page } = applicationSettings;
  const [isPaginate, setIsPaginate] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false); //important
  const [hasFilter, setHasFilter] = useState(true);
  const [searchTerms, setSearchTerms] = useState("");
  const { showLargeContent, showQuickDetails } = useSidebarActions();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceIncome, setInvoiceIncome] = useState(null);

  useEffect(() => {
    if (num_data_per_page > 0) {
      setQuery({ ...query, limit: num_data_per_page });
    }
  }, []);
  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
    setHasFilter(true);
  };
  const pageSize =
    Number(query.limit) > 0
      ? Number(query.limit)
      : num_data_per_page
      ? num_data_per_page
      : 10;

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, limit: newSize, currentPage: 1 }));
    setIsPaginate(true);
  };


  // api call
  const {
    data: getIncomeData,
    isFetching: incomeDataFetching,
    isError: incomeDataError,
    refetch,
  } = useGetIncomeDataQuery(
    {  query: query },
    { skip: !hasFilter, refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteIncome] = useDeleteIncomeMutation();

  const onDelete = (income) => {
    confirmDelete('income', { confirmButtonText: 'Yes, delete it!' }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteIncome({ id: income.id }).unwrap(); // Using unwrap for error handling
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
  const showIncomeFormFunc = () => {
    // Open Income form in GlobalSidebar large content
    const createRef = React.createRef();
    const formId = "income-form-global";
    showLargeContent(
      "Add New Income",
      <IncomeFormSidebar
        ref={createRef}
        incomeId={null}
        formId={formId}
        onSuccess={() => {
          setIsPaginate(true);
          refetch();
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[
              { label: "Add More", type: "button", onClick: () => createRef.current?.addIncomes() },
              { label: "Submit", type: "submit", formId },
            ]}
          />
        )
      }
    );
  };
  const showCsvIncomeFormFunc = () => {
    setShowCsvForm(true);
  };

  const closeCsvFileUploadModalFunc = () => {
    setShowCsvForm(false);
  };
  const showEditModalFunc = (income) => {
    const formId = "income-form-global";
    showLargeContent(
      "Edit Income",
      <IncomeFormSidebar
        incomeId={income.id}
        formId={formId}
        onSuccess={() => {
          setIsPaginate(true);
          refetch();
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[{ label: "Update Income", type: "submit", formId }]}
          />
        )
      }
    );
  };

  const showViewModalFunc = (income) => {
    // Open details in GlobalSidebar quick details (consistent with Expense)
    showQuickDetails("Income Details", <IncomeDetails data={income} />);
  };

  const openInvoiceModal = (income) => {
    setInvoiceIncome(income);
    setShowInvoiceModal(true);
  };
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceIncome(null);
  };
  const openInvoiceModalFromHeader = () => {
    const candidate = (incomes && incomes.length > 0) ? incomes[0] : {};
    setInvoiceIncome(makeInvoiceData(candidate));
    setShowInvoiceModal(true);
  };

  const handlePageChange = (event, value) => {
    setQuery({...query,currentPage: value})
    setIsPaginate(true);
  };

  useEffect(() => {
    document.title = "Manage Incomes";
    const normalizedList = Array.isArray(getIncomeData?.data)
      ? getIncomeData.data
      : Array.isArray(getIncomeData?.incomes?.data)
      ? getIncomeData.incomes.data
      : Array.isArray(getIncomeData?.items)
      ? getIncomeData.items
      : Array.isArray(getIncomeData?.results)
      ? getIncomeData.results
      : [];

    const normalizedTotal =
      typeof getIncomeData?.total === "number"
        ? getIncomeData.total
        : typeof getIncomeData?.incomes?.total === "number"
        ? getIncomeData.incomes.total
        : typeof getIncomeData?.count === "number"
        ? getIncomeData.count
        : normalizedList.length;

    // compute readable income type for the Sector column
    const withSectorType = normalizedList.map((income) => {
      const incomeTypeText =
        income?.income_type?.label ??
        income?.income_type?.value ??
        income?.income_type ??
        income?.type ??
        "";
      return { ...income, type: incomeTypeText };
    });

    if (withSectorType.length > 0 || incomeDataFetching) {
      setIncomes(withSectorType);
      setTotalCount(normalizedTotal);
      setShowMainLoader(false);
    } else if (incomeDataError) {
      setShowMainLoader(false);
      setIncomes([]);
    } else {
      setShowMainLoader(incomeDataFetching);
    }
    setIsPaginate(false);
  }, [getIncomeData, incomeDataFetching, incomeDataError, query.currentPage]);

  const filteredIncomes = incomes.filter((income) => {
    return income.description.toLowerCase().includes(searchTerms.toLowerCase());
  });

  const makeInvoiceData = (income) => {
    if (!income) return {};
    const amountNum = Number(income?.amount || 0);
    const periodStart =
      income?.checkin_date || query?.start_date || income?.date || "";
    const periodEnd =
      income?.checkout_date || query?.end_date || income?.date || "";
    return {
      invoice: {
        date: income?.date || "",
        number: String(income?.id || ""),
      },
      billTo: {
        contact: "sdfsdasds",
        company: income?.income_type.label || income?.category_name || "",
        address1: "df fsfsfdsdf",
        address2: "dfsfsfsd",
        phone: "434224232",
      },
      items: [
        {
          qty: 1,
          description: `${amountNum.toFixed(2)}(${periodStart} - ${periodEnd}) /month`,
          amount: amountNum || 0,
        },
      ],
      credit: 0,
      taxPercent: 0,
    };
  };

  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "edit_income",
      textClass: "text-info",
      icon: faEdit,
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showViewModalFunc,
      permission: "income_view",
      textClass: "text-warning",
      icon: faThList,
    },
    {
      actionName: "Preview Invoice",
      type: "modal",
      route: "",
      actionFunction: (income) => openInvoiceModal(makeInvoiceData(income)),
      permission: "income_view",
      textClass: "text-primary",
      icon: faEye,
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "income_delete",
      textClass: "text-danger",
      icon: faTrash,
    },
  ];

  // Pagination props aligned with Expense page usage
  const paginations = {
    totalPages: totalPages ?? 0,
    totalCount: totalCount,
    currentPage: query.currentPage,
    handlePageChange: handlePageChange,
    pageSize: pageSize,
    onRowsPerPageChange: handleRowsPerPageChange,
  };

  const submitFilter = () => {
    setHasFilter(true);
    setShowFilterModal(false);
  };
  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const closeFilterModal = () => {
    setHasFilter(!hasFilter);
    setShowFilterModal(false);
  };
  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <span className={"page-title-header"}>Income Histories</span>
         
        </Box>
        <Box>
          <button className={"btn primary-theme-btn btn-sm ml-2"} title={'Import CSV File'}>
            <FontAwesomeIcon icon={faFileImport} onClick={()=>showCsvIncomeFormFunc()}/>
          </button>
          <IncomeExportButton />
          <button
            className={"btn primary-theme-btn btn-sm ml-2"}
            onClick={showIncomeFormFunc}
            title={'Add new Income data'}
          >
            <Iconify icon={"eva:plus-fill"} />
          </button>
        </Box>
      </Box>

      <Row>
        <Col xs={12} sm={12} md={9}>
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center">
              <button
                className={"btn primary-theme-btn btn-xs mr-2"}
                onClick={toggleFilterModal}
              >
                <FontAwesomeIcon icon={faFilter} />
                {" Filter"}
              </button>
              <FilteredParameters queries={query} setQuery={setQuery} />
            </Box>
            <Form>
              <Form.Control
                type="text"
                size="sm"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                placeholder={"search by key wards..."}
                style={{ textTransform: "capitalize" }}
              />
            </Form>
          </div>
          <Card
            sx={{
              p: 5,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              "& .MuiTableContainer-root": {
                backgroundColor: theme.palette.background.paper,
              },
              "& .MuiPaper-root": {
                backgroundColor: theme.palette.background.paper,
              },
              "& .MuiTableCell-root": { color: theme.palette.text.primary },
            }}
            style={{ padding: "0px" }}
          >
            <CommonTable
              data={filteredIncomes}
              tableColumns={TABLE_HEAD}
              actionButtons={actionParams}
              loading={incomeDataFetching}
              pagination={paginations}
              cardSubTitle={`Page-${query.currentPage} (showing ${filteredIncomes.length} results from ${totalCount})`}
              isFetching={incomeDataFetching}
              hasError={incomeDataError}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={3} >
          <Row>
            <div
              className={"sidebar-form quick-income-card"} style={{ padding: "8px" }}
            >
              <div className={"sidebar-form-content"}>
                <IncomeFormSidebar
                  incomeId={null}
                  onSuccess={() => {
                    setIsPaginate(true);
                    refetch();
                  }}
                  sidebarTitle="Quick Income"
                  showLabel={false}
                  colXS={12}
                  colMD={12}
                  formId="quick-income-form"
                  footerActions={(
                    <SidebarFooterButtons
                      actions={[{ label: "Submit", type: "submit", formId: "quick-income-form" }]}
                    />
                  )}
                />
              </div>
            </div>
          </Row>
        </Col>
      </Row>

      {/* Income create/edit handled via GlobalSidebar */}
      {showCsvForm && (
        <CsvFileUpload
          handelCloseModal={closeCsvFileUploadModalFunc}
          title={"Upload Csv Income File"}
        />
      )}
      {/* Income details now handled via GlobalSidebar quick details */}

      {showFilterModal && (
        <IncomeFilter
          showModal={showFilterModal}
          closeModal={closeFilterModal}
          resetFilter={resetFilterParameter}
          submitFilter={submitFilter}
          queryParams={query}
          setQueryParams={setQuery}
          setHasFilter={setHasFilter}
        />
      )}
      {showInvoiceModal && (
          // <Invoice
          //     income={invoiceIncome}
          //     showModal={showInvoiceModal}
          //     closeModal={closeInvoiceModal}
          // />
          <Invoice
              showModal={showInvoiceModal}
              closeModal={closeInvoiceModal}
              invoice={{
                number: "INV-1001",
                date: "2025-01-10",
                client: {
                  name: "John Doe",
                  email: "john@example.com",
                },
                items: [
                  { description: "Web Development", qty: 1, price: 800 },
                  { description: "Maintenance", qty: 2, price: 150 },
                ],
              }}
          />
      )}
    </div>
  );
}
