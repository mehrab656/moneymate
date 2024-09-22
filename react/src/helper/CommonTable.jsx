import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardActionArea,
    CardActions,
    CardContent, TextField
} from "@mui/material";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import ActionButtonHelpers from "./ActionButtonHelpers.jsx";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import * as React from "react";
import {createElement, isValidElement, memo} from "react";
import {makeStyles} from "@mui/styles";

const useStyles = makeStyles(() => ({
    root: {
        width: '100%',
        boxShadow: 'none',
    },
    column: {
        flexBasis: '50%',
    },
}));

function CommonTable(props) {
    const {cardTitle, addBTN, paginations, table, filter} = props;
    const classes = useStyles();
    const genRand = (len) => {
        return Math.random().toString(36).substring(2, len + 2);
    }

    return (
        <Card sx={{p: 5}} style={{padding: "0px"}}>
            <CardActionArea>
                <div className={classes.root}>
                    <Accordion className={classes.boxShadow}>
                        <AccordionSummary
                            expandIcon={<FontAwesomeIcon icon={faFilter}/>}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <div className={classes.column}>
                                <h1 className="title-text mb-0">{cardTitle}</h1>
                            </div>

                            {addBTN.permission &&
                                <div className={classes.column}>
                                    <Link className="btn-add mr-3" to={addBTN.link} style={{float: "right"}}>
                                        {addBTN.icon} {addBTN.txt}
                                    </Link>
                                </div>
                            }
                        </AccordionSummary>
                        <AccordionDetails>
                            {filter.filterByText &&
                                <TextField
                                    sx={{
                                        maxWidth: {sm: 340},
                                        textTransform: 'capitalize',
                                    }}
                                    size="small"
                                    fullWidth
                                    value={filter.searchBoxValue}
                                    onChange={(event) => filter.handelSearch(event.target.value)}
                                    placeholder={filter.placeHolderTxt}
                                />
                            }
                        </AccordionDetails>
                    </Accordion>
                </div>

            </CardActionArea>
            <CardContent>
                <TableContainer component={Paper} style={{padding: "0px"}}>
                    <Table size={table.size} aria-label={table.ariaLabel}>
                        <TableHead>
                            <TableRow>
                                {
                                    table.showIdColumn &&
                                    <TableCell><b>ID</b></TableCell>
                                }
                                {
                                    table.tableColumns.map(column => {
                                        return (
                                            <TableCell align={column.align} key={column.id}>
                                                <b>{column.label}</b>
                                            </TableCell>
                                        )
                                    })
                                }
                                {
                                    JSON.stringify(table.actionBtn) !== '{}' &&
                                    <TableCell align="center">
                                        <b>{"Action"}</b>
                                    </TableCell>
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                table.tableBody.loading ?
                                    <>
                                        <TableRow>
                                            <TableCell scope="row" style={{textAlign: "center"}}
                                                       colSpan={table.tableBody.loadingColSpan}>{"Loading..."}</TableCell>
                                        </TableRow>
                                    </> : (
                                        table.tableBody.rows?.map((row) => (
                                            <TableRow key={genRand(12)}>
                                                {
                                                    table.showIdColumn &&
                                                    <TableCell component="th" scope="row">{row.id}</TableCell>
                                                }
                                                {
                                                    table.tableColumns.map(column => (
                                                        isValidElement(row?.[column.id]) ?
                                                            <TableCell align={column.align}
                                                                       key={genRand(8)}>{
                                                                createElement(row?.[column.id].type,row?.[column.id].props,row?.[column.id].props.children)
                                                            }</TableCell>
                                                            :
                                                            <TableCell align={column.align}
                                                                       key={genRand(8)}>
                                                                {`${row?.[column.id]}`}
                                                            </TableCell>
                                                    ))
                                                }
                                                {
                                                    JSON.stringify(table.actionBtn) !== '{}' &&
                                                    <TableCell align="right">
                                                        <ActionButtonHelpers
                                                            module={row}
                                                            showModule={table.actionBtn.showModule}
                                                            deleteFunc={table.actionBtn.deleteFunc}
                                                            params={table.actionBtn.params}
                                                            editDropdown={table.actionBtn.editDropdown}
                                                            showPermission={table.actionBtn.showPermission}
                                                            deletePermission={table.actionBtn.deletePermission}/>
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        )))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>

            <CardActions>
                {paginations.totalPages > 1 && (
                    <Stack spacing={2}>
                        <Pagination component="div"
                                    count={paginations.totalPages}
                                    variant="outlined"
                                    shape="rounded"
                                    page={paginations.currentPage}
                                    onChange={paginations.handlePageChange}
                        />
                    </Stack>
                )}
            </CardActions>
        </Card>
    )
}

export default memo(CommonTable)
