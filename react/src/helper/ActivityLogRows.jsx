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
import TableBody from "@mui/material/TableBody";
import {memo, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {getType} from "@reduxjs/toolkit";


const ActivityLogRows = (row) => {
    const [open, setOpen] = useState(false);
    let {id, data_records, descriptions, log_type, object, created_at, view_status, view_by, uid} = row.row;

    let dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const _records = Object.entries(JSON.parse(data_records));

    let viewList = [];


    const results = _records.filter((rec) => !rec[0].includes('id') && !rec[0].includes('slug'));

    const modifiedResults = results.map(res=>{
        if(res.includes('date') || res.includes("created_at")||res.includes('deleted_at') || res.includes("updated_at") ){
            const date = new Date(res[1]);
            res[1] = date.toDateString();

        }
        return res;
    });
    const [rowColor, setRowColor] = useState('#f5dfdf');
    const [rowStatus, setRowStatus] = useState(0);
    const showDetails = (uid) => {
        setOpen(!open);
        if (!open) {
            axiosClient.post(`/update-log-status/${uid}`).then((data) => {
                setRowColor("#ffffff");
                setRowStatus(1);
            });
        }
    }

    useEffect(() => {
        if (view_status) {
            setRowColor("#ffffff");
            setRowStatus(1);
        }

    }, [open]);

    if (view_by) {
        viewList = JSON.parse(view_by);
    }
    return (
        <React.Fragment>
            <TableRow sx={{'& > *': {borderBottom: 'unset'}}} style={{background: rowColor}}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => showDetails(uid)}
                    >
                        {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>
                <TableCell>{descriptions}</TableCell>
                <TableCell>{log_type?.toUpperCase()}</TableCell>
                <TableCell>{object?.toUpperCase()}</TableCell>
                <TableCell>{(new Date(created_at)).toLocaleDateString("en-US", dateOptions)}</TableCell>
                <TableCell>{rowStatus ? 'seen by' : 'unseen'}
                    {
                        viewList.length > 0 &&
                        <>
                            (<span style={{fontSize:"10px"}}>
                                {
                                    viewList.map(person => {
                                        return person.name + ','
                                    })
                                }
                            </span>)
                        </>
                    }


                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Typography variant="h6" gutterBottom component="div">
                                Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableBody>
                                    {modifiedResults.map(res =>(
                                        <TableRow key={Math.random().toString(36).substring(2)}>

                                            <TableCell component="th" scope="row">
                                                <b>{(res[0]).replaceAll("_", " ").toUpperCase()}</b>
                                                {' : '}
                                            </TableCell>
                                            <TableCell><span>{res[1]}</span></TableCell>
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
