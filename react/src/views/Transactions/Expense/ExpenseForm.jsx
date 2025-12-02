import React from "react";
import { useParams } from "react-router-dom";
import ExpenseFormSidebar from "./ExpenseFormSidebar.jsx";

/**
 * Route-friendly wrapper for the Expense form.
 * - Uses `useParams` to pick up `id` when navigating to `/expense/:id`.
 * - Reuses the existing sidebar-capable form for consistency.
 */
export default function ExpenseForm() {
  const { id } = useParams();
  const expenseId = id ? Number(id) : undefined;

  return (
    <div className="container-fluid p-2">
      <ExpenseFormSidebar expenseId={expenseId} onSuccess={() => { /* noop for route */ }} />
    </div>
  );
}

