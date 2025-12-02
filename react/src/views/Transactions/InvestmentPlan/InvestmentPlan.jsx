import React, {useContext, useEffect, useState} from "react";
import axiosClient from "../../../axios-client.js";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import InvestmentPlanFormSidebar from "./InvestmentPlanFormSidebar.jsx";
import InvestmentPlanDetails from "./InvestmentPlanDetails.jsx";
import CommonTable from "../../../helper/CommonTable.jsx";
import Iconify from "../../../components/Iconify.jsx";

export default function InvestmentPlan() {

    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        num_data_per_page,
        default_currency
    } = applicationSettings;

    const pageSize = num_data_per_page || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
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

    useEffect(() => {
        // Reset to first page when searching and refetch
        setCurrentPage(1);
        getPlans(1, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const getPlans = (page, pageSize) => {
        setLoading(true);
        axiosClient.get('/investment-plans', { params: { page, pageSize, searchTerm } })
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
        showLargeContent(
            "Add New Investment Plan",
            <InvestmentPlanFormSidebar
                planId={null}
                onSuccess={() => {
                    getPlans(currentPage, pageSize);
                }}
            />
        );
    };

    // const openEditForm = (plan) => {};

    const openViewDetails = (plan) => {
        showQuickDetails(
            "Investment Plan Details",
            <InvestmentPlanDetails planId={plan?.id} data={plan} />
        );
    };

    const filteredPlans = (plans || []).filter((plan) => {
        const text = `${plan.plan_name || ''} ${plan.plan_created_date || ''} ${plan.plan_start_date || ''} ${plan.plan_end_date || ''}`.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
    }).map((plan) => {
        const purposes = Array.isArray(plan.purposes)
            ? plan.purposes
            : (() => {
                try { return JSON.parse(plan.purposes || '[]'); } catch { return []; }
            })();
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

    // duplicate removed

    const filters = () => (
        <div className="mb-3">
            <input
                className="custom-form-control"
                type="text"
                placeholder="Search Plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
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
                showLargeContent(
                    "Edit Investment Plan",
                    <InvestmentPlanFormSidebar
                        planId={plan?.id}
                        onSuccess={() => getPlans(currentPage, pageSize)}
                    />
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

    return (
        <div>
            <CommonTable
                cardTitle={"List of Investment Plans"}
                addBTN={{
                    txt: "Add New Plan",
                    icon: <Iconify icon={"eva:plus-fill"} />,
                    linkTo: "modal",
                    link: openCreateForm,
                }}
                paginations={{
                    totalPages: totalPages,
                    totalCount: totalCount,
                    currentPage: currentPage,
                    handlePageChange: handlePageChange,
                }}
                table={{
                    size: "small",
                    ariaLabel: "investment plan table",
                    showIdColumn: userRole === "admin" ?? false,
                    tableColumns: TABLE_HEAD,
                    tableBody: {
                        loading: loading,
                        loadingColSpan: TABLE_HEAD.length,
                        rows: filteredPlans,
                    },
                    actionButtons: actionParams,
                }}
                filter={filters}
                loading={loading}
                loaderRow={pageSize}
                loaderCol={TABLE_HEAD.length}
            />
        </div>
    );
}
