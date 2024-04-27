import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell,{tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ActivityLogRows from '../../helper/ActivityLogRows.jsx'
import {makeStyles} from "@mui/styles";
import {TablePagination} from "@mui/material";
import axiosClient from "../../axios-client.js";
import {useEffect, useState} from "react";
import {BeatLoader} from "react-spinners";

import { styled } from '@mui/material/styles';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});
export default function ActivityLogs() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getActivityData = (page, rowsPerPage) => {
        setLoading(true);
        axiosClient.get('/activity-logs', {params: {page, rowsPerPage}})
            .then(({data}) => {
                setLoading(false);
                setLogs(data.data);
            })
            .catch(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        document.title = "Activity Log";
        getActivityData(page, rowsPerPage);
    }, [page, rowsPerPage]);
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: "#1E1E2D",
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }} classes={"root"}>
            <TableContainer sx={{ maxHeight: 840 }} component={Paper}>
                <Table size={"small"} stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell/>
                            <StyledTableCell><b>Descriptions</b></StyledTableCell>
                            <StyledTableCell><b>Activity Type</b></StyledTableCell>
                            <StyledTableCell><b>Object</b></StyledTableCell>
                            <StyledTableCell><b>Date</b></StyledTableCell>
                            <StyledTableCell><b>View Status</b></StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            loading &&
                            <TableRow>
                                <TableCell component="th" scope="row" colSpan={"6"} align={"center"}>
                                    <span><BeatLoader loading color="#36d7b7"/></span>
                                </TableCell>
                            </TableRow>
                        }
                        {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <ActivityLogRows key={Math.random().toString(36).substring(2)} row={row}/>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[20, 50, 500]}
                component="div"
                count={logs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>

    );
}
