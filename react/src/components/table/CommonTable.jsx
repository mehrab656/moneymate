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


function createData(name, code, population, size) {
    const density = population / size;
    return { name, code, population, size, density };
}

const rows = [
    createData('India', 'IN', 1324171354, 3287263),
    createData('China', 'CN', 1403500365, 9596961),
    createData('Italy', 'IT', 60483973, 301340),
    createData('United States', 'US', 327167434, 9833520),
    createData('Canada', 'CA', 37602103, 9984670),
    createData('Australia', 'AU', 25475400, 7692024),
    createData('Germany', 'DE', 83019200, 357578),
    createData('Ireland', 'IE', 4857000, 70273),
    createData('Mexico', 'MX', 126577691, 1972550),
    createData('Japan', 'JP', 126317000, 377973),
    createData('France', 'FR', 67022000, 640679),
    createData('United Kingdom', 'GB', 67545757, 242495),
    createData('Russia', 'RU', 146793744, 17098246),
    createData('Nigeria', 'NG', 200962417, 923768),
    createData('Brazil', 'BR', 210147125, 8515767),
];

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
    }, [pagination?.currentPage, pagination?.pageSize]);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', minHeight: { xs: 0, sm: 300, md: 390 }, display: 'flex', flexDirection: 'column' }}>
            <TableContainer sx={{ maxHeight: { xs: 'none', md: 440 }, overflowX: 'auto', flexGrow: 1 }}>
                <Table stickyHeader aria-label="sticky table" size="small">
                    <TableHead>
                        <TableRow>
                            {tableColumns.map((column) => (
                                <TableCell
                                    key={column.id}
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
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((data) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={data.code}>
                                        {tableColumns.map((column) => {
                                            const value = data[column.id];
                                            return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value}
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
                count={pagination?.total ?? data.length}
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
