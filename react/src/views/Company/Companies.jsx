import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Swal from "sweetalert2";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { faBuildingFlag, faPlus } from "@fortawesome/free-solid-svg-icons";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../components/table/CommonTable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useDeleteCompanyMutation,
  useGetCompanyDataQuery,
} from "../../api/slices/companySlice.js";
import CompanyFilter from "./CompanyFilter.jsx";
import CompanyFormSidebar from "./CompanyFormSidebar.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import CompanyDetails from "./CompanyDetails.jsx";
import { Card, Box, Button, Collapse, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from "@mui/material/styles";

const _initialCompanyData = {
  id: null,
  name: null,
  phone: null,
  email: null, // Set default value to an empty string
  address: null, // Set default value to an empty string
  activity: null,
  license_no: null,
  issue_date: null,
  expiry_date: null,
  registration_number: null,
  extra: null,
  logo: null,
};
const defaultQuery = {
  searchTerm: "",
  orderBy: "DESC",
  limit: 10,
};
export default function companies() {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(_initialCompanyData);
  const [loading, setLoading] = useState(true);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [hasFilter, setHasFilter] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const { num_data_per_page, default_currency } = applicationSettings;
  const { showLargeContent, showQuickDetails } = useSidebarActions();
  const TABLE_HEAD = [
    { id: "name", label: "Name", align: "left" },
    { id: "phone", label: "Phone", align: "left" },
    { id: "issue_date", label: "Issue Date", align: "left" },
    { id: "license_no", label: "License No.", align: "left" },
    { id: "activity", label: "Activity", align: "left" },
  ];

  // page size derived from query limit with fallback to app setting
  const pageSize =
    Number(query.limit) > 0
      ? Number(query.limit)
      : num_data_per_page
      ? num_data_per_page
      : 10;
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

  // api call
  const {
    data: getCompanyData,
    isFetching: companyDataFetching,
    isError: companyDataError,
    refetch,
  } = useGetCompanyDataQuery(
    { currentPage, pageSize, query: { limit: query?.limit } },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteCompany] = useDeleteCompanyMutation();

  useEffect(() => {
    document.title = "Company List";
    // Normalize response envelopes if needed
    if (getCompanyData?.data) {
      setCompanies(getCompanyData.data);
      setTotalCount(getCompanyData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getCompanyData, currentPage]);

  // sync initial limit with app settings
  useEffect(() => {
    if (num_data_per_page && num_data_per_page > 0) {
      setQuery((prev) => ({ ...prev, limit: num_data_per_page }));
    }
  }, [num_data_per_page]);

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const filter = () => {
    return (
      <CompanyFilter
        placeHolderTxt="Search by name..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
      />
    );
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
      company.license_no
        .toLowerCase()
        .includes(query.searchTerm.toLowerCase()) ||
      company.phone.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
      company.activity.toLowerCase().includes(query.searchTerm.toLowerCase())
  );

  const showCompany = (company) => {
    // Pass the component directly, not a function
    showQuickDetails("Details", <CompanyDetails data={company} />);
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
  const showCompanyFormFunc = () => {
    const createRef = React.createRef();
    const formId = "company-form-global";
    showLargeContent(
      "Create Company",
      <CompanyFormSidebar
        ref={createRef}
        companyId={null}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          // Refresh the companies list after successful creation
          refetch();
        }}
      />, {
        footerActions: (
          <div className="d-flex gap-2">
            <Button
              variant="contained"
              size="small"
              type="submit"
              form={formId}
              sx={{
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : undefined,
                color: theme.palette.mode === 'light' ? theme.palette.text.primary : undefined,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : undefined,
                },
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => createRef.current?.saveAndExit()}
              sx={{
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : undefined,
                color: theme.palette.mode === 'light' ? theme.palette.text.primary : undefined,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : undefined,
                },
              }}
            >
              Save and Exit
            </Button>
          </div>
        )
      }
    );
  };
  const showEditModalFunc = (company) => {
    const editRef = React.createRef();
    const formId = "company-form-global";
    showLargeContent(
      "Edit Company",
      <CompanyFormSidebar
        ref={editRef}
        companyId={company.id}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          // Refresh the companies list after successful update
          refetch();
        }}
      />, {
        footerActions: (
          <div className="d-flex gap-2">
            <Button
              variant="contained"
              size="small"
              onClick={() => editRef.current?.saveAndExit()}
              sx={{
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : undefined,
                color: theme.palette.mode === 'light' ? theme.palette.text.primary : undefined,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[400] : undefined,
                },
              }}
            >
              Update
            </Button>
          </div>
        )
      }
    );
  };
  const closeCreateModalFunc = () => {
    setShowCompanyForm(false);
    setCompany({});
  };

  const onDelete = async (u) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert the deletion of company ${u.name}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCompany({ id: u.uid }).unwrap(); // Using unwrap for error handling
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
  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "company_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showCompany,
      permission: "company_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "company_delete",
      textClass: "text-danger",
    },
  ];
  return (
    <div>
      <MainLoader loaderVisible={companyDataFetching} />

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={"page-title-header"}>Companies</span>
        {checkPermission("company_create") && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showCompanyFormFunc}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
              <ArrowDropDownIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Collapse in={showFilter} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, mb: 2 }}>
          <CompanyFilter
            placeHolderTxt="Search by name..."
            query={query}
            setQuery={setQuery}
            resetFilterParameter={resetFilterParameter}
          />
        </Box>
      </Collapse>

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
          data={filteredCompanies}
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
          cardSubTitle={`Page-${currentPage} (showing ${filteredCompanies.length} results from ${totalCount})`}
          isFetching={companyDataFetching}
          hasError={companyDataError}
        />
      </Card>

      {/* CompanyForm modal is no longer needed as it's handled by sidebar */}
    </div>
  );
}
