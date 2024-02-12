import React from 'react';

const OverAllReportTable = ({ investment,income,expense, sl }) => {
    return (
        <tr>
            {
                investment?
                    <>
                        <td className={'sl_class'}>{Number(sl) + 1}</td>
                        <td>{investment.name}</td>
                        <td className={'amount'}>{investment.amount}</td>
                    </>
                    :
                    <>
                    <td className={'sl_class'}><b>-</b></td>
                    <td className={'sl_class'}><b>-</b></td>
                    <td className={'sl_class'}><b>-</b></td>
                    </>
            }
            {
                expense?
                    <>
                        <td className={'sl_class'}>{sl + 1}</td>
                        <td>{expense.name}</td>
                        <td className={'amount'}>{expense.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'}><b>-</b></td>
                        <td className={'sl_class'}><b>-</b></td>
                        <td className={'sl_class'}><b>-</b></td>
                    </>
            }

            {
                income?
                    <>
                        <td className={'sl_class'}>{sl + 1}</td>
                        <td>{income.name}</td>
                        <td className={'amount'}>{income.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'}><b>-</b></td>
                        <td className={'sl_class'}><b>-</b></td>
                        <td className={'sl_class'}><b>-</b></td>
                    </>
            }


        </tr>
    );
};

export default OverAllReportTable;