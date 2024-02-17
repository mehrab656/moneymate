import React from 'react';
import {FaAirbnb, FaMoneyBillAlt} from "react-icons/fa";

const MonthlyReportTable = ({income, expense, sectorName, sl}) => {
    console.log(sectorName)
    return (
        <tr>
            {
                income ?
                    <>
                        <td className={'sl_class'} style={{background: '#d8f1f3'}}>{sl + 1}</td>
                        <td colSpan={4} style={{background: '#d8f1f3'}}>{income.description}
                            <div className={'sub-text'}>
                                <a href="#" style={{textDecoration: "none", marginRight: 10}}>{income.income_type}</a>
                                <a href="#" style={{textDecoration: "none", marginRight: 10}}>{
                                    income?.reference.includes('air') ?
                                        <FaAirbnb className={'logo-reservations'} color="red"/> :
                                        (income?.reference.includes('book') ?
                                            <i className="logo-bookingcom"></i> :
                                            <FaMoneyBillAlt fontSize={20} color="gray"/>)
                                }</a>
                                {
                                    income.income_type === 'reservation' &&
                                    <>
                                        <a href="#"
                                           style={{textDecoration: "none", marginRight: 10}}>{income.checkin_date}</a>
                                        <a href="#" style={{
                                            textDecoration: "none",
                                            marginRight: 10
                                        }}>{income.checkout_date}</a>
                                    </>
                                }
                            </div>
                        </td>
                        <td className={'amount'} style={{background: '#d8f1f3'}}>{income.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={6} style={{background: '#d8f1f3'}}><b>-</b></td>
                    </>
            }
            {
                expense ?
                    <>
                        <td className={'sl_class'} style={{background: '#ffdd78'}}>{sl + 1}</td>
                        <td style={{background: '#ffdd78'}}>{expense.name}</td>
                        <td className={'amount'} style={{background: '#ffdd78'}}>{expense.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={3} style={{background: '#ffdd78'}}><b>-</b></td>
                    </>
            }
        </tr>
    );
};

export default MonthlyReportTable;