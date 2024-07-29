import React from 'react';
import {FaAirbnb, FaMoneyBillAlt} from "react-icons/fa";
import ReservationReferenceIcons from "../helper/ReservationReferenceIcons.jsx";

const MonthlyReportTable = ({income, expense, sectorName, sl}) => {

    const formatDate = (date) =>{
        const _date = new Date(date);
        return _date.toISOString().split('T')[0];
    }
    return (
        <tr>
            {
                income ?
                    <>
                        <td className={'sl_class'}>{sl + 1}</td>
                        <td colSpan={3}>{income?.description}
                            <div className={'sub-text'}>
                                <a href="#" style={{textDecoration: "none"}}>{income.income_type.toUpperCase()}</a>|
                                <a href="#" style={{textDecoration: "none"}}>
                                    <ReservationReferenceIcons reff={income.reference}/>
                                    </a>|
                                {
                                    income?.income_type === 'reservation' &&
                                    <>
                                        <a href="#" style={{textDecoration: "none"}}>{formatDate(income?.checkin_date)}</a>
                                        {" to "}
                                        <a href="#" style={{
                                            textDecoration: "none",
                                            marginRight: 10
                                        }}>{formatDate(income?.checkout_date)}</a>
                                    </>
                                }
                            </div>
                        </td>
                        <td className={'amount'}>{income.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={5}><b>-</b></td>
                    </>
            }
            <td style={{borderTop:"hidden",borderBottom:"hidden"}}> </td>
            {
                expense ?
                    <>
                        <td className={'sl_class'}>{sl + 1}</td>
                        <td colSpan={3}>{expense.name}</td>
                        <td className={'amount'}>{expense.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={5}><b>-</b></td>
                    </>
            }
        </tr>
    );
};

export default MonthlyReportTable;