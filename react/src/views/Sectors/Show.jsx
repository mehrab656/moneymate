import { Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useGetIncomeAndExpenseQuery } from "../../api/slices/sectorSlice.js";

export default function Show({ handleCloseModal, element, currency }) {
  const [incomeExpense, setIncomeExpense] = useState({
    income: 0,
    expense: 0,
  });
  //api call
  const { data: getIncomeAndExpense, isFetching: isIncomeAndExpenseFetching } =
    useGetIncomeAndExpenseQuery({
      id: element.id,
    });
  useEffect(() => {
    if (getIncomeAndExpense?.data) {
      setIncomeExpense(getIncomeAndExpense?.data);
    }
  }, [getIncomeAndExpense?.data]);

  const remainingContract = (end) => {
    let startDate = new Date();

    let endDate = new Date(end);

    const startYear = startDate.getFullYear();
    const february =
      (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0
        ? 29
        : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
    return yearDiff + " Year " + monthDiff + " Months " + dayDiff + " Days.";
  };

  return (
    <>
      <Modal
        size="lg"
        show={true}
        centered
        onHide={handleCloseModal}
        className="custom-modal lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>{element?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered border-primary ">
            <tbody>
              <tr>
                <td>
                  <strong>Rent</strong>
                </td>
                <td>{element?.rent}</td>
                <td>
                  <strong>Contract Remaining</strong>
                </td>
                <td>{remainingContract(element.contract_end_date)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Contract Started</strong>
                </td>
                <td>{element?.contract_start_date}</td>
                <td>
                  <strong>Contract End</strong>
                </td>
                <td>{element?.contract_end_date}</td>
              </tr>

              <tr>
                <td>
                  <strong>Elec. AC/No</strong>
                </td>
                <td> {element?.el_acc_no}</td>
                <td>
                  <strong>Business Num.</strong>
                </td>
                <td>{element?.el_business_acc_no}</td>
              </tr>
              <tr>
                <td>
                  <strong>Elec. Premises</strong>
                </td>
                <td> {element?.el_premises_no}</td>
                <td>
                  <strong>Billing Date</strong>
                </td>
                <td>{element?.el_billing_date}</td>
              </tr>
              <tr>
                <td>
                  <strong> Electricity Note</strong>
                </td>
                <td colSpan={3}>{element?.note}</td>
              </tr>
              <tr>
                <td>
                  <strong>Internet account</strong>
                </td>
                <td> {element?.internet_acc_no}</td>
                <td>
                  <strong>Billing Date</strong>
                </td>
                <td>{element?.internet_billing_date}</td>
              </tr>

              <tr>
                <td>Note</td>
                <td colSpan={3}>{element?.int_note}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td> {currency + " " + incomeExpense.income}</td>
                <td>
                  <strong>Total Expense</strong>
                </td>
                <td>{currency + " " + incomeExpense.expense}</td>
              </tr>
              {element?.channels && element?.channels.length > 0 && (
                <>
                  {element?.channels.map((data, i) => {
                    return (
                      <tr key={"channel-row-" + i}>
                        <td>
                          <strong>Channel Name</strong>
                        </td>
                        <td>{data.channel_name + "-" + data.reference_id}</td>

                        <td>
                          <strong>Listing Date</strong>
                        </td>
                        <td>{data.listing_date}</td>
                      </tr>
                    );
                  })}
                </>
              )}

              <tr>
                <th colSpan={3}>Payment No.</th>
                <th>Amount</th>
              </tr>
              {element?.payments &&
                element?.payments.length > 0 &&
                element?.payments.map((data, i) => {
                  return (
                    <tr key={data.id}>
                      <td colSpan={3}>
                        {data?.payment_number}
                        <sub>{` (${data.date} - ${data.type} )`}</sub>
                      </td>
                      <td>
                        {`${currency} ${data?.amount}`}
                        <sub
                          style={{
                            textDecoration: "none",
                            float: "right",
                            color: data?.status === "paid" ? "green" : "red",
                          }}
                        >
                          {data?.status}
                        </sub>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
