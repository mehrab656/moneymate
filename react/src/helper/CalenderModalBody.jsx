import React, { memo } from "react";
import { TableRow, TableCell } from "@mui/material";

const CalenderModalBody = ({ additionalData, eventType }) => {
  const isIncomeOrExpense = eventType === "expense-event" || eventType === "income-event";
  const isPayment = eventType === "payment-event";

  return (
    <>
      {isIncomeOrExpense && (
        <>
          <TableRow>
            <TableCell width="30%">
              <strong>User Name :</strong>
            </TableCell>
            <TableCell>{additionalData.user_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Account :</strong>
            </TableCell>
            <TableCell>
              {additionalData.account?.label ||
                `${additionalData.bank_name || ""} ${
                  additionalData.account_number
                    ? `(${additionalData.account_number})`
                    : ""
                }`}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Amount :</strong>
            </TableCell>
            <TableCell> {additionalData.amount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Description :</strong>
            </TableCell>
            <TableCell> {additionalData.description}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Note :</strong>
            </TableCell>
            <TableCell> {additionalData.note}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Reference :</strong>
            </TableCell>
            <TableCell>
              {typeof additionalData.reference === "object" &&
              additionalData.reference !== null
                ? additionalData.reference.label
                : additionalData.reference}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Date :</strong>
            </TableCell>
            <TableCell>
              {additionalData?.date || additionalData?.date}
            </TableCell>
          </TableRow>
        </>
      )}
      {isPayment && (
        <>
          <TableRow>
            <TableCell width="15%">
              <strong>Details :</strong>
            </TableCell>
            <TableCell> {additionalData.payment_number}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Amount :</strong>
            </TableCell>
            <TableCell> {additionalData.amount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Bill Type :</strong>
            </TableCell>
            <TableCell> {additionalData.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Additional Notes :</strong>
            </TableCell>
            <TableCell> {additionalData.note}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="15%">
              <strong>Payment Date :</strong>
            </TableCell>
            <TableCell>
              {additionalData?.date || additionalData?.date}
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  );
};

export default memo(CalenderModalBody);
