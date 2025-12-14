import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { checkPermission } from "../../../helper/HelperFunctions.js";
import { notification } from "../../../components/ToastNotification.jsx";

import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import InvestmentFilter from "./InvestmentFilter.jsx";
import {useGetInvestmentDataQuery,
    useCreateInvestmentMutation,
    useDeleteInvestmentMutation
} from "../../../api/slices/investmentSlice.js";
import InvestmentDetails from "./InvestmentDetails.jsx";
import InvestmentFormSidebar from "./InvestmentFormSidebar.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import { Box, Card, Collapse, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";

const defaultQuery = {
    investor_id: "",
    orderBy: "",
    order: "",
    limit: 10,
    to_date: "",
    from_date: "",
};

export default function InvestmentList() {
    const theme = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const { applicationSettings, userRole, userPermission } = useContext(SettingsContext);
    const [investments, setInvestments] = useState([]);
    const [investment, setInvestment] = useState({});
    const [loading, setLoading] = useState(true);
    // Global sidebar for create/edit
    // const [viewInvestmentModal, setViewInvestmentModal] = useState(false); // replaced by GlobalSidebar
   const [showMainLoader, setShowMainLoader] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const { num_data_per_page } = applicationSettings;
    const [isPaginate, setIsPaginate] = useState(false);

    const [hasFilter, setHasFilter] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
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
    const { showLargeContent, showQuickDetails } = useSidebarActions();

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
        const createRef = React.createRef();
        const formId = "investment-form-global";
        showLargeContent(
            "Add New Investment",
            <InvestmentFormSidebar
                ref={createRef}
                investmentId={null}
                formId={formId}
                hideInternalFooter={true}
                onSuccess={() => {
                    setIsPaginate(true);
                }}
            />,
            {
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "submit", formId },
                            { label: "Save and Exit", type: "button", onClick: () => createRef.current?.saveAndExit() },
                        ]}
                    />
                ),
            }
        );
    };
    const showEditModalFunc = (investment) => {
        setInvestment(investment);
        const editRef = React.createRef();
        const formId = "investment-form-global";
        showLargeContent(
            "Edit Investment",
            <InvestmentFormSidebar
                ref={editRef}
                investmentId={investment.id}
                formId={formId}
                hideInternalFooter={true}
                onSuccess={() => {
                    setIsPaginate(true);
                }}
            />,
            {
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Update", type: "button", onClick: () => editRef.current?.saveAndExit() },
                        ]}
                    />
                ),
            }
        );
    };


    const showInvestmentDetails = (investment) => {
        showQuickDetails(
            "Investment Details",
            <InvestmentDetails investmentId={investment.id} data={investment} />
        );
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
        if (num_data_per_page && num_data_per_page > 0) {
            setQuery((prev) => ({ ...prev, limit: num_data_per_page }));
        }
        if (getInvestmentData?.data) {
            setInvestments(getInvestmentData.data);
            setTotalCount(getInvestmentData.total);
            setShowMainLoader(false);
        } else {
            setShowMainLoader(true);
        }
        setIsPaginate(false);
    }, [getInvestmentData, currentPage, num_data_per_page]);

    const filteredInvestments = investments.filter(
        (investment) => investment.investor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setQuery((prev) => ({ ...prev, limit: newSize }));
        setCurrentPage(1);
        setIsPaginate(true);
    };

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
            actionFunction: showInvestmentDetails,
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
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={"page-title-header"}>Investments</span>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {checkPermission("investment_create") && (
                        <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={showCreateModalFunc}>
                            <Iconify icon={"eva:plus-fill"} />
                        </button>
                    )}
                    <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
                        <ArrowDropDownIcon />
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={showFilter} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, mb: 2 }}>{filters()}</Box>
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
                    data={filteredInvestments}
                    tableColumns={TABLE_HEAD}
                    actionButtons={actionParams}
                    pagination={{
                        total: totalCount,
                        currentPage: currentPage,
                        handlePageChange: handlePageChange,
                        pageSize: pageSize,
                        onRowsPerPageChange: handleRowsPerPageChange,
                    }}
                    cardSubTitle={`Page-${currentPage} (showing ${Math.min(filteredInvestments.length, pageSize)} results from ${totalCount})`}
                    isFetching={investmentDataFetching}
                    hasError={!!investmentDataError}
                />
            </Card>
            {/* Details now handled by GlobalSidebar via showInvestmentDetails */}
        </div>
    );
}
