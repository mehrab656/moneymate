import React from 'react';

const OverAllReportTable = ({ investment,income,expense, sl }) => {
    return (
        <tr>
            {
                investment?
                    <>
                        <td className={'sl_class'} style={{background:'#d8f1f3'}}>{Number(sl) + 1}</td>
                        <td style={{background:'#d8f1f3'}}>{investment.name}</td>
                        <td className={'amount'} style={{background:'#d8f1f3'}}>{investment.amount}</td>
                    </>
                    :
                    <>
                    <td className={'sl_class'} colSpan={3} style={{background:'#d8f1f3'}}><b>-</b></td>
                    </>
            }
            {
                expense?
                    <>
                        <td className={'sl_class'} style={{background:'#ffdd78'}}>{sl + 1}</td>
                        <td style={{background:'#ffdd78'}}>{expense.name}</td>
                        <td className={'amount'} style={{background:'#ffdd78'}}>{expense.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={3} style={{background:'#ffdd78'}}><b>-</b></td>
                    </>
            }

            {
                income?
                    <>
                        <td className={'sl_class'} style={{background:'#d8f1f3'}}>{sl + 1}</td>
                        <td style={{background:'#d8f1f3'}}>{income.name}</td>
                        <td className={'amount'} style={{background:'#d8f1f3'}}>{income.amount}</td>
                    </>
                    :
                    <>
                        <td className={'sl_class'} colSpan={3} style={{background:'#d8f1f3'}}><b>-</b></td>
                    </>
            }


        </tr>
    );
};

export default OverAllReportTable;