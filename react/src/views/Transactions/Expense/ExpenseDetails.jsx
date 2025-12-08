import React, { useContext } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { SettingsContext } from "../../../contexts/SettingsContext";

/**
 * Sidebar-friendly Expense Details component
 * - Accepts `expenseId` (optional) and/or a partial `data` object from list
 * - Optimized for GlobalSidebar quick details view
 */
export default function ExpenseDetails({ expenseId = null, data = null }) {
  const { applicationSettings } = useContext(SettingsContext);
  const { default_currency } = applicationSettings;

  const expense = data; // Currently rely on list-provided data for speed

  if (!expense) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          No expense data available
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
              Expense By
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.user_name || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {default_currency + " " + (expense?.amount ?? "N/A")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Refundable Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {default_currency + " " + (expense?.refundable_amount ?? 0)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Bank & Category Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Bank & Category
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Bank Account
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.account?.label || expense?.account_id || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.category?.label || expense?.category_id || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

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
              {expense?.description || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Note
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.note || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Reference
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {expense?.reference || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Attachment
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">

            </Typography>
            <Typography variant="body1" fontWeight="medium">
              <div className={"image-preview"}>
                <img
                    src={expense.attachment}
                    alt="Uploaded"
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "10px",
                      objectFit: "cover"
                    }}
                />
              </div>
            </Typography>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
}

