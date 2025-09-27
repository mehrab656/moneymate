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
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        Company Details
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

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

      {/* Additional Information Section */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Others
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Note
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.extra || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyDetails;