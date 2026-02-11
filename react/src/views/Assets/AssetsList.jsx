import React, { useEffect, useState, useContext } from "react";
import { useThemedSwal } from "../../components/SwalConfirm.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import { checkPermission } from "../../helper/HelperFunctions.js";
import { notification } from "../../components/ToastNotification.jsx";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../components/table/CommonTable.jsx";
import { Box, Card, Collapse, IconButton, useTheme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  useDeleteAssetMutation,
  useGetAssetDataQuery,
} from "../../api/slices/assetSlice.js";
import AssetFilter from "./AssetFilter.jsx";
import {
  GlobalSidebar,
  useSidebarActions,
} from "../../components/GlobalSidebar";
import AssetFormSidebar from "./AssetFormSidebar.jsx";
import AssetDetails from "./AssetDetails.jsx";
import SidebarFooterButtons from "../../components/SidebarFooterButtons.jsx";

const _initialAssetData = {
  id: null,
  date: "",
  sector_name: "",
  status: "",
  total_damaged: "",
  total_price: "",
  total_used: "",
  assets: [],
};
const defaultQuery = {
  searchTerm: "",
  orderBy: "DESC",
  limit: 10,
};
export default function AssetsList() {
  const theme = useTheme();
  const { confirmDelete } = useThemedSwal();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { applicationSettings, userRole, userPermission } =
    useContext(SettingsContext);

  const [query, setQuery] = useState(defaultQuery);
  const [assets, setAssets] = useState([]);
  const [isPaginate, setIsPaginate] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [asset, setAsset] = useState(_initialAssetData);
  const [hasFilter, setHasFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const { num_data_per_page, default_currency } = applicationSettings;
  const { showQuickDetails, showLargeContent, showQuickForm } =
    useSidebarActions();

  const TABLE_HEAD = [
    { id: "sector_name", label: "Sector Name", align: "left" },
    { id: "total_price", label: "Asset Amount", align: "right" },
    { id: "total_used", label: "Used Amount", align: "right" },
    { id: "total_damaged", label: "Damaged Amount", align: "right" },
    { id: "date", label: "Date", align: "right" },
    { id: "asset_status", label: "Status", align: "left" },
  ];
  const pageSize = Number(query.limit) > 0 ? Number(query.limit) : (num_data_per_page || 10);
  const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

  // api call
  const {
    data: getAssetData,
    isFetching: assrtDataFetching,
    isError: assetDataError,
  } = useGetAssetDataQuery(
    { currentPage, pageSize, query },
    { skip: !pageSize, refetchOnMountOrArgChange: isPaginate }
  );
  const [deleteAsset] = useDeleteAssetMutation();

  useEffect(() => {
    document.title = "Manage Company Assets";
    if (getAssetData?.data) {
      const modifiedAssetData = getAssetData?.data.map((asset, index) => {
        var totalAmount = 0;
        var totalUsed = 0;
        var totalDamaged = 0;
        const _assets = asset.assets;

        _assets.forEach((_asset) => {
          totalAmount += Number(_asset.total_price);
          totalUsed += Number(_asset?.total_used ?? 0);
          totalDamaged += Number(_asset?.total_damage ?? 0);
        });

        return {
          ...asset, // Clone the original object
          total_price: default_currency + " " + totalAmount,
          total_used: default_currency + " " + totalUsed,
          total_damaged: default_currency + " " + totalDamaged,
          asset_status: asset.status === 1 ? "Active" : "Paused",
        };
      });
      setAssets(modifiedAssetData);
      setTotalCount(getAssetData.total);
      setShowMainLoader(false);
    } else {
      setShowMainLoader(true);
    }
    setIsPaginate(false);
  }, [getAssetData, currentPage]);

  const filteredAssets = assets.filter((asset) =>
    asset.sector_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDelete = async (asset) => {
    confirmDelete('asset', { confirmButtonText: 'Yes, remove it!' }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteAsset({ id: asset?.id }).unwrap(); // Using unwrap for error handling
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

  const showAssetFormFunc = () => {
    const createRef = React.createRef();
    const formId = "asset-form-global";
    showLargeContent(
      "Create Asset",
      <AssetFormSidebar
        ref={createRef}
        assetId={null}
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
  const showEditModalFunc = (asset) => {
    const editRef = React.createRef();
    const formId = "asset-form-global";
    showLargeContent(
      "Edit Asset",
      <AssetFormSidebar
        ref={editRef}
        assetId={asset.id}
        formId={formId}
        hideInternalFooter={true}
        onSuccess={() => {
          // Refresh the assets list after successful update
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
  const showAsset = (asset) => {
    showLargeContent("Asset Details", <AssetDetails data={asset} />);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  const actionParams = [
    {
      actionName: "Edit",
      type: "modal",
      route: "",
      actionFunction: showEditModalFunc,
      permission: "asset_edit",
      textClass: "text-info",
    },
    {
      actionName: "View",
      type: "modal",
      route: "",
      actionFunction: showAsset,
      permission: "asset_view",
      textClass: "text-warning",
    },
    {
      actionName: "Delete",
      type: "modal",
      route: "",
      actionFunction: onDelete,
      permission: "asset_delete",
      textClass: "text-danger",
    },
  ];

  const closeCreateModalFunc = () => {
    setAsset({});
  };

  const resetFilterParameter = () => {
    setQuery(defaultQuery);
    setHasFilter(!hasFilter);
  };
  const filter = () => {
    return (
      <AssetFilter
        placeHolderTxt="Search by name..."
        query={query}
        setQuery={setQuery}
        resetFilterParameter={resetFilterParameter}
      />
    );
  };

  return (
    <div>
      <MainLoader loaderVisible={showMainLoader} />

      {/* Header with Add button and Filter toggle */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={"page-title-header"}>Assets</span>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
          {/*{checkPermission("asset_create") && (*/}
          {/*  <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showAssetFormFunc}>*/}
          {/*    <Iconify icon={"eva:plus-fill"} />*/}
          {/*  </button>*/}
          {/*)}*/}
          <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showAssetFormFunc}>
            <Iconify icon={"eva:plus-fill"}/>
          </button>
          <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
            <ArrowDropDownIcon/>
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible filter */}
      <Collapse in={showFilter} timeout="auto" unmountOnExit>
        <Box sx={{px: 2, mb: 2}}>{filter()}</Box>
      </Collapse>

      {/* Card-wrapped modern table to match Sectors */}
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
          data={filteredAssets}
          tableColumns={TABLE_HEAD}
          actionButtons={actionParams}
          pagination={{
            totalPages: totalPages ?? 0,
            total: totalCount ?? filteredAssets.length,
            totalCount: totalCount,
            currentPage: currentPage,
            handlePageChange: handlePageChange,
            pageSize: pageSize,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          isFetching={assrtDataFetching}
          hasError={assetDataError}
        />
      </Card>
    </div>
  );
}
