import React, { useEffect, useState, useContext, useRef } from "react";
import { useThemedSwal } from "../../components/SwalConfirm.js";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { notification } from "../../components/ToastNotification.jsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useDeleteCategoryMutation,
  useGetCategoryDataQuery,
  useGetCategorySectorListDataQuery,
} from "../../api/slices/categorySlice.js";
import { checkPermission } from "../../helper/HelperFunctions.js";
import CommonTable from "../../components/table/CommonTable.jsx";
import CategoryFilter from "./CategoryFilter.jsx";
import CategoryFormSidebar from "./CategoryFormSidebar.jsx";
import { useSidebarActions } from "../../components/GlobalSidebar";
import { Box, Card, Collapse, IconButton, Button } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from "@mui/material/styles";
import SidebarFooterButtons from "../../components/SidebarFooterButtons.jsx";

const TABLE_HEAD = [
  { id: "name", label: " Category Name", align: "left" },
  { id: "type", label: "Category Type", align: "left" },
  { id: "sector_name", label: "Sector", align: "left" },
];

const defaultQuery = {
  searchTerm: "",
  orderBy: "DESC",
  limit: 10,
  selectedSectorId: "",
  type: "",
};

export default function Categories() {
  const theme = useTheme();
  const { confirmDelete } = useThemedSwal();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState(defaultQuery);
  const [isPaginate, setIsPaginate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);
  const { num_data_per_page } = applicationSettings;
  const { showQuickDetails, showQuickForm } = useSidebarActions();

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
    { currentPage, pageSize, query, companyId: localStorage.getItem("CURRENT_COMPANY") || "" },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );

  // Load sector list (company-scoped)
  const {
    data: sectorListData,
    isFetching: sectorListFetching,
  } = useGetCategorySectorListDataQuery();

  const { user, token } = useStateContext();
  const [deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    document.title = "Categories";
    if (getCategoryData?.data) {
      const normalized = getCategoryData.data.map((cat) => ({
        ...cat,
        code: cat.id,
      }));
      setCategories(normalized);
      setTotalCount(getCategoryData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getCategoryData, currentPage]);

  // Populate sectors from sector list API
  useEffect(() => {
    if (sectorListData?.data) {
      setSectors(sectorListData.data);
    }
  }, [sectorListData]);

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
    category.name.toLowerCase().includes((query.searchTerm || "").toLowerCase())
  );

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

  // Functions for sidebar operations
  const showFormFunc = () => {
    const createRef = React.createRef();
    const formId = "category-form-global";
    showQuickForm(
      "Add Category",
      <CategoryFormSidebar
        ref={createRef}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          refetch();
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[
              { label: "Save", type: "submit", formId: formId },
              { label: "Save and Exit", type: "button", onClick: () => createRef.current?.saveAndExit() },
            ]}
          />
        )
      }
    );
  };

  const showEditModalFunc = (categoryData) => {
    const editRef = React.createRef();
    const formId = "category-form-global";
    // Use the same reliable quick form sidebar used for Add
    showQuickForm(
      "Edit Category",
      <CategoryFormSidebar
        ref={editRef}
        categoryId={categoryData.id}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          refetch();
        }}
      />, {
        footerActions: (
          <SidebarFooterButtons
            actions={[
              { label: "Update", type: "button", onClick: () => editRef.current?.saveAndExit() },
            ]}
          />
        )
      }
    );
  };

  const onDelete = (categoryData) => {
    confirmDelete('category', { confirmButtonText: 'Yes, delete it!' }).then(async (result) => {
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

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={"page-title-header"}>Categories</span>
        {checkPermission("company_create") && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showFormFunc}>
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
          <CategoryFilter
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
          data={filteredcategories}
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
        />
      </Card>
    </div>
  );
}
