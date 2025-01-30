import Table from 'react-bootstrap/Table';
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import * as React from "react";
import Pagination from "@mui/material/Pagination";

function ListTable({expenses,isFetching,hasError,tableColumns,actionBtns,paginations,cardSubTitle}) {
    const tableRows=()=>{
        if (isFetching){
            return <><tr><td colSpan={4} className={'text-center'}>Loading...</td></tr></>
        }
        if(hasError){
            return <tr><td colSpan={4} className={'text-center'}>Expense Loading Error...</td></tr>
        }
        if (expenses.length===0){
            return <tr><td colSpan={4} className={'text-center'}>No data found...</td></tr>
        }
        if (expenses.length>0){
            return (
                expenses.map((expense,index)=> (
                    <tr key={`expense-row-${index}`}>
                        <td>{expense?.date}</td>
                        {/*<td className={"custom-table-cell"}>{expense?.descriptions}</td>*/}
                        <td>{expense?.descriptions}</td>
                        <td>{expense?.amount}</td>
                        {/*<td>{expense?.refundable_amount}</td>*/}
                        {/*<td>{expense?.refunded_amount}</td>*/}
                        <td>
                            <ActionButtonHelpers
                                actionBtn={actionBtns}
                                element={expense}/>
                        </td>
                    </tr>
                ))

            )
        }
    }


    return (
        <div>
            <Table responsive="md">
                <thead>
                <tr>
                    {
                        tableColumns.map(column => (
                            <th align={column.align} key={column.id}>{column.label}</th>
                        ))
                    }
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                    tableRows()
                }
                </tbody>
            </Table>
            {paginations.totalPages > 1 && (
                <>
                    <Pagination
                        component="div"
                        count={paginations.totalPages}
                        variant="outlined"
                        shape="rounded"
                        page={paginations.currentPage}
                        onChange={paginations.handlePageChange}
                    />
                    <span><small className={'text-muted'}><i>{cardSubTitle}</i></small></span>
                </>
            )}
        </div>

    );
}

export default ListTable;