import React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import ReservationReferenceIcons from "../../../helper/ReservationReferenceIcons.jsx";

const MonthlyReportTable = ({ income, expense, sectorName, sl }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const baseText = isDark ? theme.palette.common.white : theme.palette.text.primary;
  const baseBg = isDark ? theme.palette.primary.main : theme.palette.background.paper;
  const linkStyle = {
    textDecoration: "none",
    marginRight: 10,
    color: isDark ? theme.palette.common.white : theme.palette.text.secondary,
  };
  const separatorStyle = {
    borderTop: "hidden",
    borderBottom: "hidden",
    backgroundColor: baseBg,
  };
  const cellStyle = {
    color: baseText,
    backgroundColor: baseBg,
  };
  const incomeBg = isDark ? theme.palette.primary.main : alpha(theme.palette.info.main, 0.10);
  const expenseBg = isDark ? theme.palette.primary.main : alpha(theme.palette.warning.main, 0.12);
  const incomeCellStyle = { ...cellStyle, backgroundColor: incomeBg, color: baseText };
  const expenseCellStyle = { ...cellStyle, backgroundColor: expenseBg, color: baseText };
  return (
    <tr>
      {income ? (
        <>
          <td className={"sl_class"} style={incomeCellStyle}>{sl + 1}</td>
          <td colSpan={3} style={incomeCellStyle}>
            {income?.description}
            <div className={"sub-text"}>
              <a href="#" style={linkStyle}>
                {income.income_type}
              </a>
              <a href="#" style={linkStyle}>
                <ReservationReferenceIcons reff={income.reference} />
              </a>
              {income?.income_type === "reservation" && (
                <>
                  <a href="#" style={linkStyle}>
                    {income.checkin_date}
                  </a>
                  <a href="#" style={linkStyle}>
                    {income?.checkout_date}
                  </a>
                </>
              )}
            </div>
          </td>
          <td className={"amount"} style={incomeCellStyle}>{income.amount}</td>
        </>
      ) : (
        <>
          <td className={"sl_class"} colSpan={5} style={incomeCellStyle}>
            <b>-</b>
          </td>
        </>
      )}
      <td style={separatorStyle}> </td>
      {expense ? (
        <>
          <td className={"sl_class"} style={expenseCellStyle}>{sl + 1}</td>
          <td colSpan={3} style={expenseCellStyle}>{expense.name}</td>
          <td className={"amount"} style={expenseCellStyle}>{expense.amount}</td>
        </>
      ) : (
        <>
          <td className={"sl_class"} colSpan={5} style={expenseCellStyle}>
            <b>-</b>
          </td>
        </>
      )}
    </tr>
  );
};

export default MonthlyReportTable;
