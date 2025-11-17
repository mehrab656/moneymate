import React, { useEffect, useState } from "react";
import axiosClient from "../../../axios-client";

// Sidebar details view for an Account (Bank Account / Wallet)
export default function AccountDetails({ data, accountId }) {
  const [account, setAccount] = useState(data || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!account && accountId) {
      setLoading(true);
      axiosClient
        .get(`/bank-account/${accountId}`)
        .then(({ data }) => {
          if (!isMounted) return;
          setAccount(data);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(
            err?.response?.data?.message || "Failed to fetch account details."
          );
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [accountId]);

  if (loading) {
    return <div style={{ padding: 16 }}>Loading account details…</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 16, color: "#b00020" }}>
        {String(error)}
      </div>
    );
  }

  const holder = account?.account_name ?? "—";
  const customer = account?.customer_name ?? "—";
  const bankName = account?.bank_name ?? "—";
  const accountNumber = account?.account_number ?? "—";
  const balance = account?.balance ?? "—";
  const createdAt = account?.created_at
    ? new Date(account.created_at).toLocaleString()
    : "—";

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Account</div>
        <div style={{ color: "#666" }}>Details</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", rowGap: 8 }}>
        <div style={{ fontWeight: 600 }}>Customer</div>
        <div>{customer}</div>
        <div style={{ fontWeight: 600 }}>Account Holder</div>
        <div>{holder}</div>
        <div style={{ fontWeight: 600 }}>Bank</div>
        <div>{bankName}</div>
        <div style={{ fontWeight: 600 }}>Account Number</div>
        <div>{accountNumber}</div>
        <div style={{ fontWeight: 600 }}>Balance</div>
        <div>{balance}</div>
        <div style={{ fontWeight: 600 }}>Created</div>
        <div>{createdAt}</div>
      </div>
    </div>
  );
}