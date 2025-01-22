import Table from 'react-bootstrap/Table';
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";

function ListTable({expenses,isFetching,hasError,tableColumns,actionBtns,paginations,cardSubTitle}) {
    return (
        <div>
            <Table responsive="md">
                <thead>
                <tr>
                    {
                        tableColumns.map(column=> (
                            <th align={column.align} key={column.id}>{column.label}</th>
                        ))
                    }
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                    expenses.length===0?
                        (<tr><td colSpan={4}>{" Nothing Found"}</td></tr>):
                        (
                                expenses.map((expense,index)=>(
                                    <tr key={`expense-row-${index}`}>
                                        <td>{expense?.date}</td>
                                        {/*<td className={"custom-table-cell"}>{expense?.descriptions}</td>*/}
                                        <td >{expense?.descriptions}</td>
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