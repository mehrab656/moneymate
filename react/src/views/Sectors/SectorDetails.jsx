import React, { useMemo } from "react";
import { Box, Typography, Grid, Paper, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useGetIncomeAndExpenseQuery } from "../../api/slices/sectorSlice.js";

const SectorDetails = ({ data, currency }) => {
  const sector = data || {};
  const sectorId = sector?.id;

  const { data: totalsData } = useGetIncomeAndExpenseQuery(
    { id: sectorId },
    { skip: !sectorId }
  );

  const totals = useMemo(() => ({
    income: totalsData?.data?.income ?? 0,
    expense: totalsData?.data?.expense ?? 0,
  }), [totalsData]);

  const remainingContract = (end) => {
    if (!end) return "N/A";
    let startDate = new Date();
    let endDate = new Date(end);

    const startYear = startDate.getFullYear();
    const february =
      (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0
        ? 29
        : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
    return `${yearDiff} Year ${monthDiff} Months ${dayDiff} Days.`;
  };

  if (!sectorId) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          No sector data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ overflowX: 'hidden' }}>
      {/* Sector Summary */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          {sector?.name || "Sector"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Rent</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.rent ?? "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Contract Remaining</Typography>
            <Typography variant="body1" fontWeight="medium">
              {remainingContract(sector?.contract_end_date)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Contract Info */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Contract
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Contract Started</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.contract_start_date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Contract End</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.contract_end_date || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Electricity Info */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Electricity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Elec. AC/No</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.el_acc_no || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Business Num.</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.el_business_acc_no || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Elec. Premises</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.el_premises_no || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Billing Date</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.el_billing_date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Electricity Note</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.el_note || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Internet Info */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Internet
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Internet account</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.internet_acc_no || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Billing Date</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.internet_billing_date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Note</Typography>
            <Typography variant="body1" fontWeight="medium">
              {sector?.int_note || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Totals */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Totals
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Total Income</Typography>
            <Typography variant="body1" fontWeight="medium">
              {currency} {Number(totals.income).toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Total Expense</Typography>
            <Typography variant="body1" fontWeight="medium">
              {currency} {Number(totals.expense).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Channels */}
      {Array.isArray(sector?.channels) && sector.channels.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Channels
          </Typography>
          <Grid container spacing={2}>
            {sector.channels.map((ch, i) => (
              <React.Fragment key={`channel-${i}`}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Channel Name</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {`${ch?.channel_name || "N/A"}${ch?.reference_id ? ` - ${ch.reference_id}` : ""}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Listing Date</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {ch?.listing_date || "N/A"}
                  </Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Payments */}
      {Array.isArray(sector?.payments) && sector.payments.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Payments
          </Typography>
          <TableContainer sx={{ overflowX: 'hidden' }}>
            <Table size="small" aria-label="payments table" sx={{
              '& th, & td': {
                borderBottom: 1,
                borderColor: 'divider',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment No.</TableCell>
                  <TableCell align="right" sx={{ width: 140 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sector.payments.map((p) => (
                  <TableRow key={`payment-${p.id}`}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {p?.payment_number}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {` (${p?.date || "N/A"} - ${p?.type || "N/A"})`}
                      </Typography>
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: p?.status === 'paid' ? 'success.main' : 'error.main' }}>
                        {p?.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="medium">
                        {currency} {p?.amount ?? 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default SectorDetails;

