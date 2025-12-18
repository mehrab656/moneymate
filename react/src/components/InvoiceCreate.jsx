import React, { useMemo, useContext, useState } from "react";
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
  Button,
} from "@mui/material";
import { Form, InputGroup } from "react-bootstrap";
import { useTheme, alpha } from "@mui/material/styles";
import { SettingsContext } from "../contexts/SettingsContext.jsx";
import { useGetCurrentCompanyDataQuery } from "../api/slices/dashBoardSlice.js";

export default function InvoiceCreate({ data = {} }) {
  const theme = useTheme();
  const { applicationSettings } = useContext(SettingsContext);
  const currency = applicationSettings?.default_currency || "$";

  const invoice = data?.invoice || {};
  const billTo = data?.billTo || {};
  const items = Array.isArray(data?.items) ? data.items : [];
  const credit = Number(data?.credit || 0);
  const taxPercent = Number(data?.taxPercent || 0);
  const [isEdit, setIsEdit] = useState(false);
  const [editableDate, setEditableDate] = useState(invoice.date || "");
  const [editableNumber, setEditableNumber] = useState(invoice.number || "");
  const [billToState, setBillToState] = useState({
    contact: billTo.contact || "",
    company: billTo.company || "",
    address1: billTo.address1 || "",
    address2: billTo.address2 || "",
    phone: billTo.phone || "",
  });
  const [itemsState, setItemsState] = useState(
    items.map((it) => ({
      description: it?.description || "",
      amount: Number(it?.amount ?? it?.unitPrice ?? 0),
    }))
  );

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
    () => itemsState.reduce((sum, it) => sum + Number(it?.amount ?? 0), 0),
    [itemsState]
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
  const compact = (s) => {
    const v = String(s || "");
    if (v.length <= 12) return v;
    return `${v.slice(0, 8)}…${v.slice(-4)}`;
  };

  const isDark = theme.palette.mode === "dark";
  const headerBg = isDark ? theme.palette.primary.dark : theme.palette.primary.main;
  const headerText = theme.palette.primary.contrastText;
  const tableHeaderBg = isDark ? theme.palette.primary.dark : theme.palette.primary.main;
  const tableHeaderText = theme.palette.primary.contrastText;
  const rowAlt = alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08);
  const fieldSx = {};

  return (
    <Box>
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
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsEdit((v) => !v)}
              >
                {isEdit ? "View" : "Edit"}
              </Button>
            </Box>
            <Grid container sx={{ mt: 1, alignItems: "center" }} columnSpacing={1}>
              {isEdit ? (
                <>
                  <Grid item xs={12}>
                    <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
                      <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                        Date
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={editableDate}
                        onChange={(e) => setEditableDate(e.target.value)}
                      />
                    </InputGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
                      <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                        Invoice #
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={editableNumber}
                        onChange={(e) => setEditableNumber(e.target.value)}
                      />
                    </InputGroup>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ width: "100%" }}>Date:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ textAlign: "left" }}>{editableDate || ""}</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ width: "100%" }}>Invoice #</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "left",
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={editableNumber || ""}
                    >
                      {compact(editableNumber || "")}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Bill To:
        </Typography>
        {isEdit ? (
          <Box sx={{ mt: 1, maxWidth: 420 }}>
            <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
              <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Contact</InputGroup.Text>
              <Form.Control
                size="sm"
                value={billToState.contact}
                onChange={(e) => setBillToState((s) => ({ ...s, contact: e.target.value }))}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
              <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Company</InputGroup.Text>
              <Form.Control
                size="sm"
                value={billToState.company}
                onChange={(e) => setBillToState((s) => ({ ...s, company: e.target.value }))}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
              <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Address 1</InputGroup.Text>
              <Form.Control
                size="sm"
                value={billToState.address1}
                onChange={(e) => setBillToState((s) => ({ ...s, address1: e.target.value }))}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-2 w-100" style={{ flexWrap: "nowrap" }}>
              <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Address 2</InputGroup.Text>
              <Form.Control
                size="sm"
                value={billToState.address2}
                onChange={(e) => setBillToState((s) => ({ ...s, address2: e.target.value }))}
              />
            </InputGroup>
            <InputGroup size="sm" className="w-100" style={{ flexWrap: "nowrap" }}>
              <InputGroup.Text style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Phone</InputGroup.Text>
              <Form.Control
                size="sm"
                value={billToState.phone}
                onChange={(e) => setBillToState((s) => ({ ...s, phone: e.target.value }))}
              />
            </InputGroup>
          </Box>
        ) : (
          <>
            <Typography variant="body2">{billToState.contact || ""}</Typography>
            <Typography variant="body2">{billToState.company || ""}</Typography>
            <Typography variant="body2">{billToState.address1 || ""}</Typography>
            <Typography variant="body2">{billToState.address2 || ""}</Typography>
            <Typography variant="body2">{billToState.phone || ""}</Typography>
          </>
        )}
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
            {itemsState.map((it, idx) => {
              const amount = Number(it?.amount ?? 0);
              return (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: idx % 2 === 1 ? rowAlt : "transparent",
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    {isEdit ? (
                      <Form.Control
                        size="sm"
                        value={it.description}
                        onChange={(e) =>
                          setItemsState((arr) =>
                            arr.map((row, i) =>
                              i === idx ? { ...row, description: e.target.value } : row
                            )
                          )
                        }
                      />
                    ) : (
                      it?.description || ""
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isEdit ? (
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={amount}
                          onChange={(e) =>
                            setItemsState((arr) =>
                              arr.map((row, i) =>
                                i === idx
                                  ? { ...row, amount: Number(e.target.value || 0) }
                                  : row
                              )
                            )
                          }
                          style={{ width: 100 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            setItemsState((arr) => arr.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      fmt(amount)
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          
          </TableBody>
        </Table>
      </TableContainer>
      {isEdit && (
        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              setItemsState((arr) => [...arr, { description: "", amount: 0 }])
            }
          >
            Add Row
          </Button>
        </Box>
      )}

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
