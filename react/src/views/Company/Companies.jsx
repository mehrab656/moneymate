import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Swal from "sweetalert2";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { faBuildingFlag } from "@fortawesome/free-solid-svg-icons";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useDeleteCompanyMutation,
  useGetCompanyDataQuery,
} from "../../api/slices/companySlice.js";
import CompanyFilter from "./CompanyFilter.jsx";
import CompanyFormSidebar from "./CompanyFormSidebar.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import CompanyDetails from "./CompanyDetails.jsx";

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
  const { num_data_per_page, default_currency } = applicationSettings;
  const { showQuickDetails, showQuickForm } = useSidebarActions();
  const TABLE_HEAD = [
    { id: "name", label: "Name", align: "left" },
    { id: "phone", label: "Phone", align: "left" },
    { id: "issue_date", label: "Issue Date", align: "left" },
    { id: "license_no", label: "License No.", align: "left" },
    { id: "activity", label: "Activity", align: "left" },
  ];

  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);

  // api call
  const {
    data: getCompanyData,
    isFetching: companyDataFetching,
    isError: companyDataError,
    refetch,
  } = useGetCompanyDataQuery(
    { currentPage, pageSize, query },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteCompany] = useDeleteCompanyMutation();

  useEffect(() => {
    document.title = "Company List";
    if (getCompanyData?.data) {
      setCompanies(getCompanyData.data);
      setTotalCount(getCompanyData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getCompanyData, currentPage]);

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
    console.log('showCompany called with company:', company);
    
    // Pass the component directly, not a function
    showQuickDetails("Details", <CompanyDetails data={company} />);
  };
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setIsPaginate(true);
  };
  const showIncomeFormFunc = () => {
    showQuickDetails("Create Company", <CompanyFormSidebar 
      companyId={null} 
      onSuccess={() => {
        // Refresh the companies list after successful creation
        refetch();
      }} 
    />);
  };
  const showEditModalFunc = (company) => {
    showQuickDetails("Edit Company", <CompanyFormSidebar 
      companyId={company.id} 
      onSuccess={() => {
        // Refresh the companies list after successful update
        refetch();
      }} 
    />);
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
      <MainLoader loaderVisible={showMainLoader} />
      <CommonTable
        cardTitle={"List of Companies"}
        addBTN={{
          permission: checkPermission("company_create"),
          txt: "Create New",
          icon: <FontAwesomeIcon icon={faBuildingFlag} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showIncomeFormFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "company table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: loading,
            loadingColSpan: 6, //Table head length + 1
            rows: filteredCompanies, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filter}
        loading={companyDataFetching}
        loaderRow={query?.limit}
        loaderCol={5}
      />

      {/* CompanyForm modal is no longer needed as it's handled by sidebar */}
    </div>
  );
}
