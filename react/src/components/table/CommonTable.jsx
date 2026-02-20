import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import ActionButtonHelpers from "../../helper/ActionButtonHelpers.jsx";
import {Tooltip} from "@mui/material";
import {useEffect} from "react";
export default function StickyHeadTable( {data,isFetching,hasError,tableColumns,actionButtons,pagination,cardSubTitle}) {
    const [page, setPage] = React.useState(0); // 0-based index for MUI
    const initialRowsPerPage = typeof pagination?.pageSize === 'number'
        ? pagination.pageSize
        : Number(pagination?.pageSize) || 10;
    const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
    const rowsPerPageOptions = React.useMemo(() => {
        const base = [10, 25, 100, 500, 1000];
        const current = Number(rowsPerPage) || 10;
        const set = new Set([...base, current]);
        return Array.from(set).sort((a, b) => a - b);
    }, [rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        if (pagination?.handlePageChange) {
            // Convert to 1-based for server-side handler
            pagination.handlePageChange(event, newPage + 1);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        const next = +event.target.value;
        setRowsPerPage(next);
        setPage(0);
        if (pagination?.onRowsPerPageChange) {
            pagination.onRowsPerPageChange(event);
        }
    };

    // Keep local state in sync with external pagination
    React.useEffect(() => {
        const serverPage = Number(pagination?.currentPage) || 1;
        setPage(Math.max(0, serverPage - 1));
        if (pagination?.pageSize != null) {
            setRowsPerPage(Number(pagination.pageSize) || 10);
        }
    }, [ pagination?.currentPage, pagination?.pageSize]);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', minHeight: { xs: 0, sm: 300, md: 390 }, display: 'flex', flexDirection: 'column' }}>
            <TableContainer sx={{ maxHeight: { xs: 'none', md: 440 }, overflowX: 'auto', flexGrow: 1 }}>
                <Table stickyHeader aria-label="sticky table" size="small">
                    <TableHead>
                        <TableRow>
                            {tableColumns.map((column,index) => (
                                <TableCell
                                    key={`sticky-header-table${index}`}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell
                                key={"action"}
                                align={"left"}
                                style={{ minWidth: "170" }}
                            >
                                {"Actions"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data
                            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((data) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={Math.random().toString(36).substring(2)}>
                                        {tableColumns.map((column) => {
                                            const value = data[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align} className={column.className}>
                                                    {column.id === 'description' ? (
                                                        <Tooltip title={value || ''} arrow>
                                                            <span
                                                                style={{
                                                                    display: 'block',
                                                                    maxWidth: 200,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    cursor: 'pointer'}}>
                                                                {value}
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value
                                                    )}
                                                    </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <ActionButtonHelpers
                                                actionBtn={actionButtons}
                                                element={data}/>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={pagination?.totalCount}
                rowsPerPage={Number(rowsPerPage) || 10}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton
                showLastButton
                sx={{
                    mt: 1,
                    px: 2,
                    py: 1,
                    '.MuiTablePagination-toolbar': {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'nowrap',
                    },
                    '.MuiTablePagination-selectLabel': { mt: '15px' },
                    '.MuiTablePagination-displayedRows': { mx: 1, mt: '15px' },
                    '.MuiTablePagination-actions': { ml: 1 },
                    '.MuiSelect-select': { color: 'text.primary' },
                }}
            />
        </Paper>
    );
}
