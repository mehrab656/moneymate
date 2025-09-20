import ReservationReferenceIcons from "../../../helper/ReservationReferenceIcons.jsx";

const MonthlyReportTable = ({ income, expense, sectorName, sl }) => {
  return (
    <tr>
      {income ? (
        <>
          <td className={"sl_class"}>{sl + 1}</td>
          <td colSpan={3}>
            {income?.description}
            <div className={"sub-text"}>
              <a href="#" style={{ textDecoration: "none", marginRight: 10 }}>
                {income.income_type}
              </a>
              <a href="#" style={{ textDecoration: "none", marginRight: 10 }}>
                <ReservationReferenceIcons reff={income.reference} />
              </a>
              {income?.income_type === "reservation" && (
                <>
                  <a
                    href="#"
                    style={{ textDecoration: "none", marginRight: 10 }}
                  >
                    {income.checkin_date}
                  </a>
                  <a
                    href="#"
                    style={{
                      textDecoration: "none",
                      marginRight: 10,
                    }}
                  >
                    {income?.checkout_date}
                  </a>
                </>
              )}
            </div>
          </td>
          <td className={"amount"}>{income.amount}</td>
        </>
      ) : (
        <>
          <td className={"sl_class"} colSpan={5}>
            <b>-</b>
          </td>
        </>
      )}
      <td style={{ borderTop: "hidden", borderBottom: "hidden" }}> </td>
      {expense ? (
        <>
          <td className={"sl_class"}>{sl + 1}</td>
          <td colSpan={3}>{expense.name}</td>
          <td className={"amount"}>{expense.amount}</td>
        </>
      ) : (
        <>
          <td className={"sl_class"} colSpan={5}>
            <b>-</b>
          </td>
        </>
      )}
    </tr>
  );
};

export default MonthlyReportTable;
