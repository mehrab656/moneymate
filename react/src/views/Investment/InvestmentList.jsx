import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/MainLoader.jsx";
import { checkPermission } from "../../helper/HelperFunctions.js";
import { notification } from "../../components/ToastNotification.jsx";

import Iconify from "../../components/Iconify.jsx";
import CommonTable from "../../helper/CommonTable.jsx";
import InvestmentFilter from "./InvestmentFilter.jsx";
import {useGetInvestmentDataQuery,
    useCreateInvestmentMutation,
    useDeleteInvestmentMutation
} from "../../api/slices/investmentSlice.js";
import ShowDetails from "./ShowDetails.jsx";
import InvestmentForm from "./InvestmentForm.jsx";

const defaultQuery = {
    investor_id: "",
    orderBy: "",
    order: "",
    limit: 10,
    to_date: "",
    from_date: "",
};

export default function InvestmentList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const { applicationSettings, userRole, userPermission } = useContext(SettingsContext);
    const [investments, setInvestments] = useState([]);
    const [investment, setInvestment] = useState({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewInvestmentModal, setViewInvestmentModal] = useState(false);
   const [showMainLoader, setShowMainLoader] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const { num_data_per_page } = applicationSettings;
    const [isPaginate, setIsPaginate] = useState(false);

    const [hasFilter, setHasFilter] = useState(false);
    const TABLE_HEAD = [
        { id: "investor_name", label: "Name", align: "left" },
        { id: "amount", label: "Amount", align: "right" },
        { id: "investment_date", label: "Date", align: "left" },
        { id: "added_by_name", label: "Added By", align: "left" },
    ];

    const pageSize =
        Number(query.limit) > 0
            ? Number(query.limit)
            : num_data_per_page
                ? num_data_per_page
                : 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    // api call
    const {
        data: getInvestmentData,
        isFetching: investmentDataFetching,
        isError: investmentDataError,
    } = useGetInvestmentDataQuery(
        { currentPage, pageSize, query: query },
        { refetchOnMountOrArgChange: isPaginate }
    );
    const [deleteInvestment] = useDeleteInvestmentMutation();

    const onDelete = (investment) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover the investment!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteInvestment({ id: investment.id }).unwrap(); // Using unwrap for error handling
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
    const showCreateModalFunc = () => {
        setShowCreateModal(true);
    };
    const closeCreateModalFunc = () => {
        setShowCreateModal(false);
        setInvestment({});
    };
    const showEditModalFunc = (investment) => {
        setShowCreateModal(true);
        setInvestment(investment);
    };


    const showViewModalFunc = (investment) => {
        setViewInvestmentModal(true);
        setInvestment(investment);
    };
    const closeViewModalFunc = () => {
        setViewInvestmentModal(false);
        setInvestment({});
    };


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        setIsPaginate(true);
    };
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
    };
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    };

    useEffect(() => {
        document.title = "Manage Investments";
        if (getInvestmentData?.data) {
            setInvestments(getInvestmentData.data);
            setTotalCount(getInvestmentData.total);
            setShowMainLoader(false);
        } else {
            setShowMainLoader(true);
        }
        setIsPaginate(false);
    }, [getInvestmentData, currentPage]);

    const filteredInvestments = investments.filter(
        (investment) => investment.investor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filters = () => {
        return (
            <InvestmentFilter
                search={{
                    filterByText: true,
                    placeHolderTxt: "Search by name...",
                    searchBoxValue: searchTerm,
                    handelSearch: setSearchTerm,
                }}
                query={query}
                setQuery={setQuery}
                resetFilterParameter={resetFilterParameter}
                handelFilter={handelFilter}
            />
        );
    };

    const actionParams = [
        {
            actionName: "Edit",
            type: "modal",
            route: "",
            actionFunction: showEditModalFunc,
            permission: "edit_investment",
            textClass: "text-info",
        },
        {
            actionName: "View",
            type: "modal",
            route: "",
            actionFunction: showViewModalFunc,
            permission: "investment_view",
            textClass: "text-warning",
        },
        {
            actionName: "Delete",
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: "investment_delete",
            textClass: "text-danger",
        },

    ];

    return (
        <div>
            <MainLoader loaderVisible={showMainLoader} />
            <CommonTable
                cardTitle={"List of Investments"}
                addBTN={{
                    permission: checkPermission("investment_create"),
                    txt: "Add New Investment",
                    icon: <Iconify icon={"eva:plus-fill"} />, //"faBuildingFlag",
                    linkTo: "modal",
                    link: showCreateModalFunc,
                }}
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange,
                }}
                table={{
                    size: "small",
                    ariaLabel: "investment table",
                    showIdColumn: userRole === "admin" ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: 4,
                        rows: filteredInvestments, //rendering data
                    },
                    actionButtons: actionParams,
                }}
                filter={filters}
                loading={investmentDataFetching}
                loaderRow={query?.limit}
                loaderCol={4}
            />

            {showCreateModal && (
                <InvestmentForm
                handelCloseModal={closeCreateModalFunc}
                title={"Create New Investment"}
                id={investment.id}
                />
            )}
            {viewInvestmentModal && (
                <ShowDetails handleCloseModal={closeViewModalFunc}
                             element={investment}
                />
            )}
        </div>
    );
}
