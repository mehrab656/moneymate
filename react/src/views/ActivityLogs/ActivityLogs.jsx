import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ActivityLogRows from '../../helper/ActivityLogRows.jsx'
import {makeStyles} from "@mui/styles";
import {TablePagination} from "@mui/material";
import axiosClient from "../../axios-client.js";
import {useEffect, useState} from "react";



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

    const getActivityData = (page,rowsPerPage) => {
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
        getActivityData(page,rowsPerPage);
    }, [page,rowsPerPage]);

    return (
        <Paper className={classes.root}>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell><b>Descriptions</b></TableCell>
                            <TableCell><b>Activity Type</b></TableCell>
                            <TableCell><b>Object</b></TableCell>
                            <TableCell><b>Date</b></TableCell>
                            <TableCell><b>View Status</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <ActivityLogRows key={row.description+row.id} row={row}/>
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
