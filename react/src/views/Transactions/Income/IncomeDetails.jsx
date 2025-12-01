import React, { useContext } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

/**
 * Sidebar-friendly Income Details component
 * - Accepts `incomeId` (optional) and/or a partial `data` object from list
 * - Optimized for GlobalSidebar quick details view like Expense
 */
export default function IncomeDetails({ incomeId = null, data = null }) {
  const { applicationSettings } = useContext(SettingsContext);
  const { default_currency } = applicationSettings;

  const income = data; // Rely on list-provided data for speed

  if (!income) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          No income data available
        </Typography>
      </Box>
    );
  }

  const amount = income?.amount ?? "N/A";
  const date = income?.date ?? "N/A";
  const bankAccount =
    (income?.account && typeof income.account === "object" ? income?.account?.label : income?.account) ||
    (income?.bankAccount && typeof income.bankAccount === "object" ? income?.bankAccount?.label : income?.bankAccount) ||
    income?.account_id ||
    "N/A";
  const category =
    (income?.category && typeof income.category === "object" ? income?.category?.label || income?.category?.name : income?.category) ||
    income?.category_name ||
    income?.category_id ||
    "N/A";
  const description = income?.description || "N/A";
  const note = income?.note || "N/A";
  const reference =
    (income?.reference && typeof income.reference === "object" ? income?.reference?.label : income?.reference) ||
    income?.reference_id ||
    "N/A";
  const incomeType = income?.income_type?.label || income?.income_type?.value || income?.type || "N/A";
  const checkinDate = income?.checkin_date || null;
  const checkoutDate = income?.checkout_date || null;
  const attachmentUrl = income?.attachment || null;

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
              Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {date}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {default_currency + " " + amount}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Income Type
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {incomeType}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Bank & Source Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Bank & Source
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Bank Account
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {bankAccount}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Source (Category)
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {category}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Reservation Section (if applicable) */}
      {(checkinDate || checkoutDate) && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Reservation
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Check-in Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {checkinDate || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Check-out Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {checkoutDate || "—"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Description Section */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Description
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Details
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Note
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {note}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Reference
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {reference}
            </Typography>
          </Grid>
          {attachmentUrl && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Attachment
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                <a href={attachmentUrl} target="_blank" rel="noreferrer">
                  View Attachment
                </a>
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}
