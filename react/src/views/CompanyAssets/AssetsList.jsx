import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../axios-client.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import {checkPermission, compareDates} from "../../helper/HelperFunctions.js";
import SummeryCard from "../../helper/SummeryCard.jsx";
import { notification } from "../../components/ToastNotification.jsx";

import {
    Box,

    Button,

} from "@mui/material";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";

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
export default function AssetsList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole, userPermission} = useContext(SettingsContext);
    const [assets, setAssets] = useState([]);
    const [asset, setAsset] = useState(_initialAssetData);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const { num_data_per_page,
        default_currency } = applicationSettings;

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
 

    const filteredAssets = assets.filter(
        (asset) =>
            asset.sector_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modifiedAssetData = filteredAssets.map((asset,index)=>{
        var totalAmount = 0;
        var totalUsed = 0;
        var totalDamaged = 0;
        const _assets = asset.assets;
        _assets.map((_asset)=>{
            totalAmount += Number(_asset.total_price);
            totalUsed += Number(_asset?.total_used??0);
            totalDamaged += Number(_asset?.total_damage??0);
        });
        asset.total_price = default_currency+' '+totalAmount;
        asset.total_used = default_currency+' '+totalUsed;
        asset.total_damaged = default_currency+' '+totalDamaged;
        asset.asset_status = asset.status === 1 ? "Active": "Paused";

        return asset;
    })

    const onDelete = (asset) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the asset !`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`asset/${asset.id}`)
                    .then((data) => {
                        getAssets(currentPage,pageSize);
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

    const showAsset = (asset) => {
        setAsset(asset);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getAssets = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/all-assets", { params: { page, pageSize } })
            .then(({ data }) => {
                setLoading(false);
                setAssets(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Manage CompanyAssets";
        getAssets(currentPage, pageSize);
    }, [currentPage, pageSize]);
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const [modalAsset, steAssetModel] = useState(false);
 
    const actionParams = [
        {
            actionName: 'Edit',
            type: "route",
            route: "/asset/update/",
            actionFunction: "editModal",
            permission: 'asset_edit',
            textClass:'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: showAsset,
            permission: 'asset_view',
            textClass:'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'asset_delete',
            textClass:'text-danger'
        },
    ];

    const filter = ()=>{
        // {
        //     filterByText:true,
        //         placeHolderTxt:'Search Asset...',
        //     searchBoxValue:searchTerm,
        //     handelSearch: setSearchTerm
        // }
    }

    return (
        <div>
            <MainLoader loaderVisible={loading} />
            <CommonTable
                cardTitle={"List of CompanyAssets"}
                addBTN={
                    {
                        permission: checkPermission('asset_create'),
                        txt: "Create New",
                        icon:(<Iconify icon={"eva:plus-fill"} />), //"faBuildingFlag",
                        linkTo:'route',
                        link:"/asset/new"
                    }
                }
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange
                }}
                table={{
                    size: "small",
                    ariaLabel: 'asset table',
                    showIdColumn: userRole === 'admin' ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 8,
                        rows: modifiedAssetData,//rendering data
                    },
                    actionButtons: actionParams

                }}
                filter={filter}
            />

            <Modal
                size="lg"
                show={showModal}
                centered
                onHide={handleCloseModal}
                className="custom-modal lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{"CompanyAssets Details for "+ asset?.sector_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="table table-bordered border-primary ">
                        <tbody>
                        <tr>
                            <td colSpan={4}>
                                Sector:<strong>{asset?.sector_name}</strong>
                            </td>
                            <td colSpan={2}>
                                Purchase Date:
                                <strong> {asset?.date}</strong>
                            </td>
                            <td colSpan={1}>
                                Status:
                                <strong> {asset.status === 1? "Active": "Paused"}</strong>
                            </td>
                        </tr>

                        <tr>
                            <td rowSpan={3}>Balance</td>
                            <td colSpan={6}>Total Asset Amount:<strong> {asset?.total_price}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={6}>Damaged Asset's Amount:<strong> {asset?.total_damaged}</strong></td>
                        </tr>
                        <tr><td colSpan={6}>Asset Used Amount:<strong>{asset?.total_used}</strong></td></tr>
                        <tr>
                            <td colSpan={7} className={"text-center"}>
                                <strong>Asset Information</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                            <th>Current Stock</th>
                        </tr>
                        {asset.assets.map((_asset,index)=>{
                            return (
                                <tr>
                                    <td>{index+1}</td>
                                    <td>{_asset.name}</td>
                                    <td>{_asset?.description}</td>
                                    <td>{_asset.qty}</td>
                                    <td>{_asset.unit_price}</td>
                                    <td>{_asset.total_price}</td>
                                    <td>{_asset?.current_stock??_asset.qty}</td>
                                </tr>
                            )
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
