import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { checkPermission } from "../../helper/HelperFunctions.js";
import { notification } from "../../components/ToastNotification.jsx";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";
import {
  useDeleteAssetMutation,
  useGetAssetDataQuery,
} from "../../api/slices/assetSlice.js";
import AssetForm from "./AssetForm.jsx";
import AssetViewModal from "./AssetViewModal.jsx";
import AssetFilter from "./AssetFilter.jsx";

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
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { num_data_per_page, default_currency } = applicationSettings;

  const TABLE_HEAD = [
    { id: "sector_name", label: "Sector Name", align: "left" },
    { id: "total_price", label: "Asset Amount", align: "right" },
    { id: "total_used", label: "Used Amount", align: "right" },
    { id: "total_damaged", label: "Damaged Amount", align: "right" },
    { id: "date", label: "Date", align: "right" },
    { id: "asset_status", label: "Status", align: "left" },
  ];
  const pageSize = num_data_per_page;
  const totalPages = Math.ceil(totalCount / pageSize);

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
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover the asset !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
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

  const showEditModalFunc = (asset) => {
    setShowAssetForm(true);
    setAsset(asset);
  };
  const showAsset = (asset) => {
    setAsset(asset);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

  const showAssetFormFunc = () => {
    setShowAssetForm(true);
  };
  const closeCreateModalFunc = () => {
    setShowAssetForm(false);
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
      <CommonTable
        cardTitle={"List of Company Assets"}
        addBTN={{
          permission: checkPermission("asset_create"),
          txt: "Create New",
          icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
          linkTo: "modal",
          link: showAssetFormFunc,
        }}
        paginations={{
          totalPages: totalPages,
          totalCount: totalCount,
          currentPage: currentPage,
          handlePageChange: handlePageChange,
        }}
        table={{
          size: "small",
          ariaLabel: "asset table",
          showIdColumn: userRole === "admin" ?? false,
          tableColumns: TABLE_HEAD,
          tableBody: {
            loading: loading,
            loadingColSpan: 8,
            rows: filteredAssets, //rendering data
          },
          actionButtons: actionParams,
        }}
        filter={filter}
        loading={assrtDataFetching}
        loaderRow={query?.limit}
        loaderCol={8}
      />

      {showModal && (
        <AssetViewModal
          handelCloseModal={handleCloseModal}
          title={"Asset Details"}
          data={asset}
        />
      )}

      {showAssetForm && (
        <AssetForm
          handelCloseModal={closeCreateModalFunc}
          title={"Create New Asset"}
          id={asset.id}
        />
      )}
    </div>
  );
}
