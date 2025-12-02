import React from "react";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { useGetSingleInvestmentDataQuery } from "../../../api/slices/investmentSlice.js";
import { useGetBankDataQuery } from "../../../api/slices/bankSlice.js";

/**
 * Sidebar-friendly Investment Details component
 * - Accepts either `investmentId` (fetches full details) or a partial `data` object
 * - Displays key information similar to CompanyDetails presentation
 */
export default function InvestmentDetails({ investmentId = null, data = null }) {
  const {
    data: singleInvestmentResp,
    isFetching: singleFetching,
    isError: singleError,
  } = useGetSingleInvestmentDataQuery({ id: investmentId }, { skip: !investmentId });

  const {
    data: bankResp,
    isFetching: bankFetching,
    isError: bankError,
  } = useGetBankDataQuery({ currentPage: "", pageSize: 100 });

  const investment = investmentId ? singleInvestmentResp?.data : data;

  const accountLabel = React.useMemo(() => {
    if (!investment?.account_id) return "N/A";
    const accounts = bankResp?.data || [];
    const match = accounts.find((a) => a.id === investment.account_id);
    if (!match) return investment.account_id ?? "N/A";
    const bank = match.bank_name || "Bank";
    const acc = match.account_number || "Account";
    return `${bank} (${acc})`;
  }, [bankResp, investment]);

  if (investmentId && singleFetching) {
    return (
      <Box p={3} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body1">Loading investment details...</Typography>
      </Box>
    );
  }

  if (singleError) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Failed to load investment details.
        </Typography>
      </Box>
    );
  }

  if (!investment) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          No investment data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Summary Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Investor
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {investment?.investor?.label || investment?.investor_name || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {investment?.amount ?? "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {investment?.investment_date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Added By
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {investment?.added_by_name || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Account Section */}
      {/* <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Account
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Account
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {bankFetching ? "Loading..." : accountLabel}
            </Typography>
          </Grid>
        </Grid>
      </Paper> */}

      {/* Notes Section */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Notes
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Note
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {investment?.note || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}