import React, { useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../../axios-client";
import Badge from "react-bootstrap/Badge";
import { SettingsContext } from "../../contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import MainLoader from "../../components/loader/MainLoader";
import CommonTable from "../../components/table/CommonTable.jsx";
import { Card, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function SubscriptionHistory() {

    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate();

    const { applicationSettings, userRole } = useContext(SettingsContext);
    const {
        default_currency,
        num_data_per_page
    } = applicationSettings;
    const theme = useTheme();

    const [pageSize, setPageSize] = useState(
        typeof num_data_per_page === "number" && num_data_per_page > 0 ? num_data_per_page : 10
    );
    const totalPages = Math.ceil((totalCount || 0) / (pageSize || 10));

    useEffect(() => {
        document.title = "Subscription History";
        getSubscriptions(currentPage, pageSize);
    }, [currentPage, pageSize]);


    if (userRole === "user") {
        navigate("/dashboard");
    }


    const getSubscriptions = (page, pageSize) => {
        setLoading(true);
        axiosClient
            .get("/subscriptions", { params: { page, pageSize } })
            .then(({ data }) => {
                setLoading(false);
                setSubscriptions(data.data);
                setTotalCount(data.total);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handlePageChange = (event, nextPage) => {
        setCurrentPage(nextPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const TABLE_HEAD = useMemo(() => ([
        { id: "user_name", label: "User Name", align: "left" },
        { id: "current_period_start", label: "Start Date", align: "left" },
        { id: "current_period_end", label: "End Date", align: "left" },
        { id: "status", label: "Status", align: "left" },
        { id: "amount", label: "Amount", align: "left", format: (v) => `${default_currency} ${v}` },
    ]), [default_currency]);

    const rows = useMemo(() => {
        return subscriptions.map((s) => ({
            ...s,
            status: (
                <Badge className={s.status === "Active" ? "badge-active" : "badge-inactive"}>
                    {s.status}
                </Badge>
            ),
        }));
    }, [subscriptions]);

    return (
        <>
            <MainLoader loaderVisible={loading} />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={"page-title-header"}>Subscription Histories</span>
            </Box>
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
                    data={rows}
                    tableColumns={TABLE_HEAD}
                    actionButtons={[]}
                    pagination={{
                        totalPages: totalPages ?? 0,
                        totalCount: totalCount,
                        currentPage: currentPage,
                        handlePageChange: handlePageChange,
                        pageSize: pageSize,
                        onRowsPerPageChange: handleRowsPerPageChange,
                    }}
                    cardSubTitle={`Page-${currentPage} (showing ${rows.length} results from ${totalCount})`}
                    isFetching={loading}
                    hasError={false}
                />
            </Card>
        </>
    );
}
