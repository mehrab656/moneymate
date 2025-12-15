import React, {useContext, useEffect, useState} from "react";
import Swal from "sweetalert2";
import {SettingsContext} from "../../../contexts/SettingsContext.jsx";
import MainLoader from "../../../components/loader/MainLoader.jsx";
import { notification } from "../../../components/ToastNotification.jsx";
import {useGetDebtDataQuery,useDeleteDebtMutation} from "../../../api/slices/debtSlice.js";
import {checkPermission} from "../../../helper/HelperFunctions.js";
import Iconify from "../../../components/Iconify.jsx";
import CommonTable from "../../../components/table/CommonTable.jsx";
import Filter from "./Filter.jsx";
import { Form, InputGroup } from "react-bootstrap";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../styles/formThemeStyles.js";
import SidebarFooterButtons from "../../../components/SidebarFooterButtons.jsx";
import { useSidebarActions } from "../../../components/GlobalSidebar";
import DebtFormSidebar from "./DebtFormSidebar.jsx";
import DebtDetails from "./DebtDetails.jsx";
const defaultQuery = {
    type: "",
    account_id: "",
    orderBy: "",
    order: "",
    limit: 10,
    end_date: "",
    start_date: "",
};
const defaultDebtData = {
    id: null,
    amount: 0,
    account_id: null,
    type: '',
    person: '',
    date: null,
    note: ''
};
export default function Debts() {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debts, setDebts] = useState([]);
    const [debt, setDebt] = useState(defaultDebtData);
    const [loading, setLoading] = useState(false);
    const sidebar = useSidebarActions();
    const [query, setQuery] = useState(defaultQuery);
    const [showMainLoader, setShowMainLoader] = useState(false);
    const [subTitle,setSubTitle] = useState('');

    const {applicationSettings, userRole, themeMode} = useContext(SettingsContext);
    const theme = useTheme();
    const inputGroupTextStyle = createInputGroupTextStyle(theme);
    const isDark = themeMode === "dark";
    const inputStyle = {
        backgroundColor: isDark ? "#1c1f24" : "#fff",
        color: isDark ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)",
        borderColor: isDark ? "#3a4048" : "#c5ccd6",
        fontSize: "0.875rem",
        minHeight: 36,
    };
    const {
        num_data_per_page,
    } = applicationSettings;

    const [hasFilter, setHasFilter] = useState(false);
    const TABLE_HEAD = [
        { id: "person", label: "Person", align: "left" },
        { id: "account", label: "Account", align: "left" },
        { id: "account_number", label: "Account Number", align: "left" },
        { id: "type", label: "Type", align: "left" },
        { id: "date", label: "date", align: "left" },
        { id: "amount", label: "Amount", align: "right" },
    ];

    const pageSize =
        Number(query.limit) > 0
            ? Number(query.limit)
            : num_data_per_page
                ? num_data_per_page
                : 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    const {
        data: getDebtData,
        isFetching: isDebtDataFetching,
    } = useGetDebtDataQuery(
        { currentPage, pageSize },
    );

    const [deleteDebt] = useDeleteDebtMutation();

    const onDelete = (debt) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover the debt amount of ${debt.amount}!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then( async (result) => {
            if (result.isConfirmed) {
                try{
                    const response = await deleteDebt({id: debt.id}).unwrap();
                    notification("success", response.message, response.description); // Display success message
                }catch ( e ){
                    notification("error",e.message,e.description || "An error occurred.")
                }
            }
        });
    };

    const openCreateSidebar = () => {
        const formId = "debt-form-global";
        sidebar.showLargeContent(
            "Add New Debt",
            <DebtFormSidebar debtId={null} formId={formId} hideInternalFooter={true} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Save", type: "submit", formId, 'data-action': 'save' },
                            { label: "Save and Exit", type: "submit", formId, 'data-action': 'save_exit' },
                        ]}
                    />
                )
            }
        );
    };
    const openEditSidebar = (row) => {
        const formId = "debt-form-global";
        sidebar.showLargeContent(
            `Edit ${row.type} (ID: ${row.id})`,
            <DebtFormSidebar debtId={row.id} formId={formId} hideInternalFooter={true} />,
            {
                width: "xl",
                footerActions: (
                    <SidebarFooterButtons
                        actions={[
                            { label: "Update", type: "submit", formId, 'data-action': 'save_exit' },
                        ]}
                    />
                )
            }
        );
    };
    const openDetailsSidebar = (row) => {
        sidebar.showQuickDetails(`Debt Details (ID: ${row.id})`, <DebtDetails debtId={row.id} />, { width: 'lg' });
    };
    useEffect(() => {
        document.title = "Debts / Loan";
        if (getDebtData?.data){
            setDebts(getDebtData?.data);
            setTotalCount(getDebtData?.total);
            setShowMainLoader(false);
            setSubTitle(`Showing ${getDebtData?.data.length} results of ${getDebtData.total}`);
        }else {
            setShowMainLoader(true);
        }

    }, [currentPage, getDebtData]);
    const normalizedDebts = React.useMemo(() => {
        return (debts || []).map((d) => ({ ...d }));
    }, [debts]);
    const filteredDebts = React.useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return normalizedDebts;
        return normalizedDebts.filter((d) => {
            return (
                String(d.amount || "").toLowerCase().includes(q) ||
                String(d.type || "").toLowerCase().includes(q) ||
                String(d.person || "").toLowerCase().includes(q) ||
                String(d.account || "").toLowerCase().includes(q) ||
                String(d.account_number || "").toLowerCase().includes(q) ||
                String(d.date || "").toLowerCase().includes(q)
            );
        });
    }, [normalizedDebts, searchTerm]);
    const resetFilterParameter = () => {
        setQuery(defaultQuery);
        setHasFilter(!hasFilter);
        setSearchTerm("");
    };
    const handelFilter = () => {
        setHasFilter(!hasFilter);
    };
    const filters = () => {
        return (
            <div className="mb-3">
                <InputGroup className="mb-3" size="sm" style={{ maxWidth: "520px", flex: "1 1 320px" }}>
                    <InputGroup.Text id="debts_search" style={inputGroupTextStyle}>Search</InputGroup.Text>
                    <Form.Control
                        aria-describedby="debts_search"
                        type="text"
                        size="sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Debts..."
                        style={{ ...inputStyle, textTransform: "capitalize" }}
                    />
                </InputGroup>
            </div>
        );
    };

    const actionParams = [
        {
            actionName: 'Edit',
            type: "modal",
            route: "",
            actionFunction: openEditSidebar,
            permission: 'debt_edit',
            textClass:'text-info',
        },
        {
            actionName: 'View',
            type: "modal",
            route: "",
            actionFunction: openDetailsSidebar,
            permission: 'debt_view',
            textClass:'text-warning'
        },
        {
            actionName: 'Delete',
            type: "modal",
            route: "",
            actionFunction: onDelete,
            permission: 'debt_delete',
            textClass:'text-danger'
        },
    ];

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    return (
        <div>
            <MainLoader loaderVisible={loading} />
            <div className="d-flex justify-content-between align-content-center gap-2 mb-3">
                <h1 className="title-text mb-0">Debts</h1>
                <div>
                    {checkPermission('debt_create') && (
                        <a className="custom-btn btn-add" onClick={openCreateSidebar} role="button">
                            Add New
                        </a>
                    )}
                </div>
            </div>

            {filters()}
            <CommonTable
                data={filteredDebts}
                tableColumns={[
                    ...(userRole === 'admin' ? [{ id: 'id', label: 'ID', align: 'left' }] : []),
                    { id: 'person', label: 'Person', align: 'left' },
                    { id: 'account', label: 'Account', align: 'left' },
                    { id: 'account_number', label: 'Account Number', align: 'left' },
                    { id: 'type', label: 'Type', align: 'left' },
                    { id: 'date', label: 'Date', align: 'left' },
                    { id: 'amount', label: 'Amount', align: 'right' },
                ]}
                actionButtons={actionParams}
                pagination={{
                    totalPages: totalPages || 0,
                    totalCount: totalCount,
                    total: totalCount,
                    currentPage: currentPage,
                    handlePageChange: (e, value) => setCurrentPage(value),
                    pageSize: pageSize,
                    onRowsPerPageChange: (event) => {
                        const newSize = parseInt(event.target.value, 10);
                        if (newSize > 0) {
                            setCurrentPage(1);
                        }
                    },
                }}
                cardSubTitle={`Page-${currentPage} • ${filteredDebts.length} of ${totalCount}`}
                isFetching={isDebtDataFetching}
                hasError={false}
            />

            {/* Sidebar-based forms and details are handled globally; no local modals needed */}
        </div>
    )
}
