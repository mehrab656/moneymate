import React, { useEffect, useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { faBuildingFlag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useDeleteCategoryMutation,
  useGetCategoryDataQuery,
} from "../../api/slices/categorySlice.js";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../helper/CommonTable.jsx";
import CategoryFilter from "./CategoryFilter.jsx";
import CategoryFormSidebar from "./CategoryFormSidebar.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";

const TABLE_HEAD = [
  { id: "name", label: " Category Name", align: "left" },
  { id: "type", label: "Category Type", align: "left" },
];

const defaultQuery = {
  searchTerm: "",
  orderBy: "DESC",
  limit: 10,
  selectedSectorId: "",
  type: "",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState(defaultQuery);
  const [isPaginate, setIsPaginate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);

  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const { num_data_per_page } = applicationSettings;
  const { showQuickDetails } = useSidebarActions();

  const pageSize =
    Number(query.limit) > 0
      ? Number(query.limit)
      : num_data_per_page
      ? num_data_per_page
      : 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  // api call
  const {
    data: getCategoryData,
    isFetching: categoryDataFetching,
    isError: categoryDataError,
    refetch,
  } = useGetCategoryDataQuery(
    { currentPage, pageSize, query },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );

  const { user, token } = useStateContext();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    document.title = "Categories";
    if (getCategoryData?.data) {
      setCategories(getCategoryData.data);
      setTotalCount(getCategoryData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getCategoryData, currentPage]);

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const filter = () => {
    return (
      <CategoryFilter
        placeHolderTxt="Search by name..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
      />
    );
  };

  const filteredcategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setIsPaginate(true);
  };

  // Functions for sidebar operations
  const showFormFunc = () => {
    showQuickDetails(
      "Add Category",
      <CategoryFormSidebar 
        onSuccess={() => {
          refetch();
        }}
      />
    );
  };

  const showEditModalFunc = (categoryData) => {
    showQuickDetails(
      "Edit Category",
      <CategoryFormSidebar 
        categoryId={categoryData.id}
        onSuccess={() => {
          refetch();
        }}
      />
    );
  };

  const onDelete = (categoryData) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCategory({
            id: categoryData.id,
            token,
          }).unwrap();
          if (response.status === "success") {
            notification("success", response.message);
            refetch();
          } else {
            notification("error", response.message);
          }
        } catch (error) {
          notification("error", "An error occurred while deleting the category.");
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
    // {
    //   actionName: "View",
    //   type: "modal",
    //   route: "",
    //   actionFunction: showCategory,
    //   permission: "company_view",
    //   textClass: "text-warning",
    // },
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
      <MainLoader loaderVisible={categoryDataFetching} />
      <CommonTable
        cardTitle={"List of Categories"}
        addBTN={{
          permission: checkPermission("company_create"),
          txt: "Create New",
          icon: <FontAwesomeIcon icon={faBuildingFlag} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showFormFunc,
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
            rows: filteredcategories, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filter}
        loading={categoryDataFetching}
        loaderRow={query?.limit}
        loaderCol={5}
      />
    </div>
  );
}
