import Table from 'react-bootstrap/Table';
import ActionButtonHelpers from "../../../helper/ActionButtonHelpers.jsx";
import * as React from "react";
import Pagination from "@mui/material/Pagination";
import { Tooltip } from "react-tooltip";

function ListTable({incomes,isFetching,hasError,tableColumns,actionBtns,paginations,cardSubTitle}) {
    const tableRows=()=>{
        if (isFetching){
            return <><tr><td colSpan={6} className={'text-center'}>Loading...</td></tr></>
        }
        if(hasError){
            return <tr><td colSpan={6} className={'text-center'}>Expense Loading Error...</td></tr>
        }
        if (incomes.length===0){
            return <tr><td colSpan={6} className={'text-center'}>No data found...</td></tr>
        }
        if (incomes.length>0){
            return (
                incomes.map((expense,index)=> (
                    <tr key={`expense-row-${index}`}>
                        <td>{expense?.date}</td>
                        {/*<td className={"custom-table-cell"}>{expense?.descriptions}</td>*/}
                        <td><div className={"custom-table-cell"}
                                 data-tooltip-id="income-description"
                                 data-tooltip-content={expense?.description}>
                            <Tooltip id={'income-description'} className={"income-description-tooltip"}/>{expense?.description}</div></td>
                        <td>{expense?.category_name}</td>
                        <td>{expense?.reference.value}</td>
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
                            <th align={column.align} key={column.id} >{column.label}</th>
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