import React from "react";
import { Box, Typography, Grid, Paper, Divider } from "@mui/material";

const CompanyDetails = ({ data }) => {

  console.log('data', data)
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="text.secondary">
          No company data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Logo Preview */}
      {(() => {
        const logo = data?.logo;
        if (!logo || logo === "null") return null;
        let logoUrl = null;
        if (typeof logo === "string") {
          const trimmed = logo.trim();
          if (
            trimmed.startsWith("http://") ||
            trimmed.startsWith("https://") ||
            trimmed.startsWith("/")
          ) {
            logoUrl = trimmed;
          } else {
            const base = window.__APP_CONFIG__?.VITE_APP_BASE_URL || "";
            logoUrl = `${base}/storage/files/company/${trimmed}`;
          }
        }
        if (!logoUrl) return null;
        return (
        <Box sx={{ mb: 3 }} display="flex" justifyContent="center">
          <img
            src={logoUrl}
            alt="Company Logo"
            style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, border: "1px solid #eee" }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </Box>
        );
      })()}

      {/* Company Details Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Info
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.name || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.email || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.phone || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.address || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Activity
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.activity || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* License Details Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          License Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              License Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.license_no || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Registration Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.registration_number || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Date Information Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Important Dates
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Issue Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.issue_date || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Expiry Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.expiry_date || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    
    </Box>
  );
};

export default CompanyDetails;
