import * as React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp.js";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown.js";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import {memo} from "react";



const ActivityLogRows = ({row})=> {
    const [open, setOpen] = React.useState(false);
    var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const _records = Object.entries(JSON.parse(row.data_records));



    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.descriptions}</TableCell>
                <TableCell>{row.log_type?.toUpperCase()}</TableCell>
                <TableCell>{row.object?.toUpperCase()}</TableCell>
                <TableCell>{(new Date(row.created_at)).toLocaleDateString("en-US", dateOptions)}</TableCell>
                <TableCell>{row.view_status?'seen':'unseen'}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                {/*<TableHead>*/}
                                {/*    <TableRow>*/}
                                {/*        <TableCell>Date</TableCell>*/}
                                {/*        <TableCell>Customer</TableCell>*/}
                                {/*        <TableCell align="right">Amount</TableCell>*/}
                                {/*        <TableCell align="right">Total price ($)</TableCell>*/}
                                {/*    </TableRow>*/}
                                {/*</TableHead>*/}
                                <TableBody>


                                    {_records.map((record,val) => (
                                        <TableRow key={Math.random().toString(36).substring(2)}>
                                            <TableCell component="th" scope="row">
                                                <b>{(record[0]).replace("_"," ").toUpperCase()}</b>
                                                { ' : '}
                                            </TableCell>
                                            <TableCell>{record[1]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}
export default memo(ActivityLogRows)
