import React from 'react';

const OverAllReportTable = ({ investment,income,expense, sl }) => {
    return (
        <tr>
            {
                investment?
                    <>
                        <td>{Number(sl) + 1}</td>
                        <td>{investment.name}</td>
                        <td>{investment.amount}</td>
                    </>
                    :
                    <>
                    <td className={'text-center'}><b>-</b></td>
                    <td className={'text-center'}><b>-</b></td>
                    <td className={'text-center'}><b>-</b></td>
                    </>
            }
            {
                expense?
                    <>
                        <td>{sl + 1}</td>
                        <td>{expense.name}</td>
                        <td>{expense.amount}</td>
                    </>
                    :
                    <>
                        <td className={'text-center'}><b>-</b></td>
                        <td className={'text-center'}><b>-</b></td>
                        <td className={'text-center'}><b>-</b></td>
                    </>
            }

            {
                income?
                    <>
                        <td>{sl + 1}</td>
                        <td>{income.name}</td>
                        <td>{income.amount}</td>
                    </>
                    :
                    <>
                        <td className={'text-center'}><b>-</b></td>
                        <td className={'text-center'}><b>-</b></td>
                        <td className={'text-center'}><b>-</b></td>
                    </>
            }


        </tr>
    );
};

export default OverAllReportTable;