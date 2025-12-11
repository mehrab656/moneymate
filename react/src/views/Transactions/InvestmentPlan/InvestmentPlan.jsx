import React, {useContext, useEffect, useMemo, useState} from "react";
import axiosClient from "../../../axios-client.js";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import InvestmentPlanFormSidebar from "./InvestmentPlanFormSidebar.jsx";
import InvestmentPlanDetails from "./InvestmentPlanDetails.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import Iconify from "../../../components/Iconify.jsx";
import { Box, Card, Collapse, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InvestmentPlanFilter from "./InvestmentPlanFilter.jsx";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";

export default function InvestmentPlan() {

    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const defaultQuery = {
        searchTerm: "",
        plan_created_date: "",
        plan_start_date: "",
        plan_end_date: "",
        orderBy: "plan_created_date",
        order: "DESC",
        limit: 10,
    };
    const [query, setQuery] = useState(defaultQuery);

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = Number(query.limit) > 0 ? Number(query.limit) : (num_data_per_page || 10);
    const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));
    const TABLE_HEAD = [
        { id: "plan_name", label: "Plan Name", align: "left" },
        { id: "plan_created_date", label: "Date", align: "left" },
        { id: "plan_start_date", label: "Contract Start", align: "left" },
        { id: "plan_end_date", label: "Contract End", align: "left" },
        { id: "purposes", label: "Purposes", align: "left" },
    ];


    useEffect(() => {
        document.title = "Manage Investment Plans";
        getPlans(currentPage, pageSize);
    }, [currentPage, pageSize]);

    // sync initial limit with app settings
    useEffect(() => {
        if (num_data_per_page && num_data_per_page > 0) {
            setQuery((prev) => ({ ...prev, limit: num_data_per_page }));
        }
    }, [num_data_per_page]);

    const getPlans = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/investment-plans', { params: { page, pageSize, searchTerm: query.searchTerm } })
            .then(({ data }) => {
                setPlans(data?.data || []);
                setTotalCount(data?.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Pagination handled by CommonTable

    // Edit/delete not supported for plans yet

    // Sidebar actions
    const { showLargeContent, showQuickDetails } = useSidebarActions();

    const openCreateForm = () => {
        const createRef = React.createRef();
        const formId = "investment-plan-form-global";
        showLargeContent(
            "Add New Investment Plan",
            <InvestmentPlanFormSidebar
                ref={createRef}
                planId={null}
                formId={formId}
                hideInternalFooter={true}
                onSuccess={() => {
                    getPlans(currentPage, pageSize);
                }}
            />, {
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            {
                                label: "Create & Add More",
                                type: "button",
                                onClick: () => createRef.current?.save(),
                            },
                            {
                                label: "Create & Close",
                                type: "button",
                                onClick: () => createRef.current?.saveAndExit(),
                            },
                        ]}
                    />
                )
            }
        );
    };

    // const openEditForm = (plan) => {};

    const openViewDetails = (plan) => {
        showQuickDetails(
            "Investment Plan Details",
            <InvestmentPlanDetails planId={plan?.id} data={plan} />
        );
    };

    const filteredPlans = useMemo(() => {
        const normalizeDateField = (obj, primary, fallback) => (obj?.[primary] || obj?.[fallback] || "");
        const filtered = (plans || []).filter((plan) => {
            const created = normalizeDateField(plan, 'plan_created_date', 'date');
            const start = normalizeDateField(plan, 'plan_start_date', 'start_date');
            const end = normalizeDateField(plan, 'plan_end_date', 'end_date');
            const text = `${plan.plan_name || ''} ${created || ''} ${start || ''} ${end || ''}`.toLowerCase();
            if (query.searchTerm && !text.includes(String(query.searchTerm).toLowerCase())) return false;
            if (query.plan_created_date && created !== query.plan_created_date) return false;
            if (query.plan_start_date && start !== query.plan_start_date) return false;
            if (query.plan_end_date && end !== query.plan_end_date) return false;
            return true;
        });

        const sorted = [...filtered].sort((a, b) => {
            const dir = String(query.order || 'DESC').toUpperCase() === 'ASC' ? 1 : -1;
            const field = query.orderBy || 'plan_created_date';
            const av = field === 'plan_name'
                ? (a.plan_name || '').toLowerCase()
                : normalizeDateField(a, field, field === 'plan_created_date' ? 'date' : field === 'plan_start_date' ? 'start_date' : 'end_date');
            const bv = field === 'plan_name'
                ? (b.plan_name || '').toLowerCase()
                : normalizeDateField(b, field, field === 'plan_created_date' ? 'date' : field === 'plan_start_date' ? 'start_date' : 'end_date');
            if (field === 'plan_name') return av.localeCompare(bv) * dir;
            return (av === bv ? 0 : (av > bv ? 1 : -1)) * dir;
        });

        return sorted.map((plan) => {
            const purposes = Array.isArray(plan.purposes)
                ? plan.purposes
                : (() => { try { return JSON.parse(plan.purposes || '[]'); } catch { return []; } })();
            const purposesElement = (
                <span>
                    {purposes.length === 0 ? '—' : purposes.map((p, idx) => {
                        const label = typeof p === 'string' ? p : (p?.purpose ?? '');
                        return (
                            <span key={idx} className="badge bg-secondary me-1" style={{textTransform:'capitalize'}}>
                                {String(label).replaceAll('_',' ')}
                            </span>
                        );
                    })}
                </span>
            );
            return {
                ...plan,
                purposes: purposesElement,
            };
        });
    }, [plans, query]);

    // duplicate removed

    const resetFilterParameter = () => {
        setQuery(defaultQuery);
    };

    const filters = () => (
        <InvestmentPlanFilter
            placeHolderTxt="Search by plan name..."
            query={query}
            setQuery={setQuery}
            resetFilterParameter={resetFilterParameter}
        />
    );

    const actionParams = [
        {
            actionName: "View",
            type: "modal",
            route: "",
            actionFunction: openViewDetails,
            textClass: "text-warning",
        },
        {
            actionName: "Edit",
            type: "modal",
            route: "",
            actionFunction: (plan) => {
                const editRef = React.createRef();
                const formId = "investment-plan-form-global";
                showLargeContent(
                    "Edit Investment Plan",
                    <InvestmentPlanFormSidebar
                        ref={editRef}
                        planId={plan?.id}
                        formId={formId}
                        hideInternalFooter={true}
                        onSuccess={() => getPlans(currentPage, pageSize)}
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
            },
            textClass: "text-info",
        },
        {
            actionName: "Delete",
            type: "button",
            route: "",
            actionFunction: async (plan) => {
                const ok = window.confirm("Delete this plan?");
                if (!ok) return;
                try {
                    setLoading(true);
                    await axiosClient.delete(`/investment-plan/${plan?.id}`);
                } catch (e) {
                    // ignore
                } finally {
                    getPlans(currentPage, pageSize);
                }
            },
            textClass: "text-danger",
        },
    ];

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setQuery((prev) => ({ ...prev, limit: newSize }));
        setCurrentPage(1);
    };

    return (
        <div>
            {/* Header with Add button and Filter toggle */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={"page-title-header"}>Investment Plans</span>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <button className={"btn primary-theme-btn btn-sm ml-2"} onClick={openCreateForm}>
                        <Iconify icon={"eva:plus-fill"} />
                    </button>
                    <IconButton size="small" aria-label="toggle filter" onClick={() => setShowFilter((s) => !s)}>
                        <ArrowDropDownIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Collapsible filter */}
            <Collapse in={showFilter} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, mb: 2 }}>{filters()}</Box>
            </Collapse>

            {/* Card-wrapped modern table */}
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
                    data={filteredPlans}
                    tableColumns={TABLE_HEAD}
                    actionButtons={actionParams}
                    pagination={{
                        totalPages: Math.ceil((filteredPlans.length || 0) / pageSize),
                        totalCount: filteredPlans.length,
                        currentPage: currentPage,
                        handlePageChange: handlePageChange,
                        pageSize: pageSize,
                        onRowsPerPageChange: handleRowsPerPageChange,
                    }}
                    cardSubTitle={`Page-${currentPage} (showing ${Math.min(filteredPlans.length, pageSize)} results from ${filteredPlans.length})`}
                    isFetching={loading}
                    hasError={false}
                />
            </Card>
        </div>
    );
}
