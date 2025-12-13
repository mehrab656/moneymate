import React, { useContext } from "react";
import { Box, Typography, Grid, Paper, Chip } from "@mui/material";
import { SettingsContext } from "../../../contexts/SettingsContext.jsx";

export default function BudgetDetails({ budgetId = null, data = null }) {
  const { applicationSettings } = useContext(SettingsContext);
  const { default_currency } = applicationSettings;

  const budget = data || {};

  const amount = budget?.amount ?? "N/A";
  const updatedAmount = budget?.updated_amount ?? "N/A";
  const startDate = budget?.start_date ?? "N/A";
  const endDate = budget?.end_date ?? "N/A";
  const name = budget?.budget_name ?? "N/A";
  const id = budget?.id ?? "N/A";
  const categories = Array.isArray(budget?.categories) ? budget.categories : [];

  return (
    <Box p={3}>
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {id}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Proposed Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {default_currency} {amount}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Updated Amount
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {default_currency} {updatedAmount}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {startDate}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              End Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {endDate}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Categories
        </Typography>
        {categories.length === 0 ? (
          <Typography variant="body1" fontWeight="medium">
            No categories
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {categories.map((cat) => (
              <Chip
                key={(cat && cat.id) || Math.random()}
                label={cat?.name ?? cat?.label ?? String(cat)}
                size="small"
                color="default"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
