import React, { useEffect, useState } from "react";
import axiosClient from "../../../axios-client";

// Simple sidebar details view for a Bank
// Props:
// - data: optional preloaded bank object
// - bankId: optional id to fetch full record
export default function BankDetails({ data, bankId }) {
  const [bank, setBank] = useState(data || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!bank && bankId) {
      setLoading(true);
      axiosClient
        .get(`/bank-names/${bankId}`)
        .then(({ data }) => {
          if (!isMounted) return;
          setBank(data);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(
            err?.response?.data?.message || "Failed to fetch bank details."
          );
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bankId]);

  if (loading) {
    return <div style={{ padding: 16 }}>Loading bank details…</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 16, color: "#b00020" }}>
        {String(error)}
      </div>
    );
  }

  const name = bank?.bank_name ?? "—";
  const id = bank?.id ?? "—";
  const createdAt = bank?.created_at
    ? new Date(bank.created_at).toLocaleString()
    : "—";

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Bank</div>
        <div style={{ color: "#666" }}>Basic information</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 12 }}>
        <div style={{ color: "#777" }}>Bank Name</div>
        <div style={{ fontWeight: 500 }}>{name}</div>

        <div style={{ color: "#777" }}>ID</div>
        <div>{id}</div>

        <div style={{ color: "#777" }}>Created At</div>
        <div>{createdAt}</div>
      </div>
    </div>
  );
}