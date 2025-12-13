import React, { useMemo, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { SettingsContext } from "../contexts/SettingsContext.jsx";
import { useGetCurrentCompanyDataQuery } from "../api/slices/dashBoardSlice.js";

export default function GlobalInvoice({ data = {} }) {
  const theme = useTheme();
  const { applicationSettings } = useContext(SettingsContext);
  const currency = applicationSettings?.default_currency || "$";

  const invoice = data?.invoice || {};
  const billTo = data?.billTo || {};
  const items = Array.isArray(data?.items) ? data.items : [];
  const credit = Number(data?.credit || 0);
  const taxPercent = Number(data?.taxPercent || 0);

  const currentCompanyID =
    typeof window !== "undefined" ? localStorage.getItem("CURRENT_COMPANY") : null;
  const { data: currentCompanyResp } = useGetCurrentCompanyDataQuery(
    { id: currentCompanyID },
    { skip: !currentCompanyID }
  );
  const activeCompany = currentCompanyResp?.data || null;
  const companyName =
    activeCompany?.name || company?.name || "Company Name";
  let logoUrl = null;
  const logoVal = activeCompany?.logo || company?.logo || null;


  if (typeof logoVal === "string" && logoVal && logoVal !== "null") {
    const trimmed = logoVal.trim();
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

  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => sum + Number(it?.amount ?? it?.unitPrice ?? 0), 0),
    [items]
  );
  const taxAmount = useMemo(
    () => (subtotal * taxPercent) / 100,
    [subtotal, taxPercent]
  );
  const balanceDue = useMemo(
    () => subtotal - credit + taxAmount,
    [subtotal, credit, taxAmount]
  );

  const fmt = (v) => `${currency} ${Number(v || 0).toFixed(2)}`;

  const isDark = theme.palette.mode === "dark";
  const headerBg = isDark ? theme.palette.primary.dark : theme.palette.primary.main;
  const headerText = theme.palette.primary.contrastText;
  const tableHeaderBg = isDark ? theme.palette.primary.dark : theme.palette.primary.main;
  const tableHeaderText = theme.palette.primary.contrastText;
  const rowAlt = alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 860,
        mx: "auto",
        p: 3,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          backgroundColor: headerBg,
          color: headerText,
          p: 3,
          textAlign: "center",
          borderRadius: 1,
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Company Logo"
            style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", display: "inline-block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Typography
            variant="caption"
            sx={{ letterSpacing: 2, opacity: 0.9, mb: 0.5, display: "block" }}
          >
            {company.logoText || "logo"}
          </Typography>
        )}
        <Typography variant="h5" sx={{ mt: 1 }}>{companyName}</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="body2">{activeCompany.address1}</Typography>
            <Typography variant="body2">{activeCompany.address2}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Phone: {activeCompany.phone || ""}
            </Typography>
            <Typography variant="body2">{activeCompany.email || ""}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box textAlign="right">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              INVOICE
            </Typography>
            <Grid container  sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2">Date:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{invoice.date || ""}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Invoice #</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{invoice.number || ""}</Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography variant="body2">PO #</Typography>
              </Grid> */}
              {/* <Grid item xs={6}>
                <Typography variant="body2">{invoice.po || ""}</Typography>
              </Grid> */}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Bill To:
        </Typography>
        <Typography variant="body2">{billTo.contact || ""}</Typography>
        <Typography variant="body2">{billTo.company || ""}</Typography>
        <Typography variant="body2">{billTo.address1 || ""}</Typography>
        <Typography variant="body2">{billTo.address2 || ""}</Typography>
        <Typography variant="body2">{billTo.phone || ""}</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3 }} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: tableHeaderBg,
                "& .MuiTableCell-root": {
                  backgroundColor: tableHeaderBg,
                  color: tableHeaderText,
                  fontWeight: 600,
                },
              }}
            >
              <TableCell>Sl.</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => {
              const amount = Number(it?.amount ?? it?.unitPrice ?? 0);
              return (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: idx % 2 === 1 ? rowAlt : "transparent",
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{it?.description || ""}</TableCell>
                  <TableCell align="right">{fmt(amount)}</TableCell>
                </TableRow>
              );
            })}
          
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, width: "100%" }}>
        <Box sx={{ ml: "auto", width: 250, maxWidth: "100%" }}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: 1,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1">{currency}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {Number(balanceDue).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" sx={{ fontStyle: "italic" }}>
        Thank you to stay with us!
      </Typography>
    </Box>
  );
}
