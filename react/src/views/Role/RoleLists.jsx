import React, {useState} from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {Box, capitalize} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import {makeStyles} from "@mui/styles";
const useStyle = makeStyles(style => ({
    fontSize: {
        "& span:last-child": {
            fontSize:2
        }
    },
    size: {
        width: 40,
        height: 40,
    },
}));
function RoleLists({permissions, setPermissions}) {

    const classes = useStyle();

    const moduleArray = Object.entries(permissions);

    // Function to handle checkbox change
    const handleChange = (event, section) => {
        const {name, checked} = event.target;
        if (name === "selectAll") {
            setPermissions((prevState) => ({
                ...prevState,
                [section]: Object.keys(prevState[section]).reduce((acc, key) => {
                    acc[key] = checked;
                    return acc;
                }, {}),
            }));
        } else {
            setPermissions((prevState) => ({
                ...prevState,
                [section]: {
                    ...prevState[section],
                    [name]: checked,
                },
            }));
        }
    };

    // Function to handle select all checkbox change
    const handleSelectAll = (event, section) => {
        const {checked} = event.target;
        setPermissions((prevState) => ({
            ...prevState,
            [section]: Object.keys(prevState[section]).reduce((acc, key) => {
                acc[key] = checked;
                return acc;
            }, {}),
        }));
    };


    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={11}>Permissions</TableCell>
                    </TableRow>
                </TableHead>
                {moduleArray &&
                    moduleArray.map((menu, i) => {
                        const options = Object.entries(menu[1]);

                        function toTitleCase(str) {
                            // Convert the string to lowercase and split it by underscore
                            let words = str.toLowerCase().split('_');

                            // Capitalize the first letter of each word
                            for (let i = 0; i < words.length; i++) {
                                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
                            }

                            // Join the words with space
                            return words.join(' ');
                        }

                        const name = toTitleCase(menu[0]);


                        const rows = [
                            {name:"Frozen yoghurt",calories: "159", fat:"6.0", carbs:"24", protein:"4.0"},
                        ];
                        return (
                            <>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                            key={row.name}
                                            sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                            <TableCell >
                                                <FormControlLabel
                                                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '15px',fontWeight:"bold" },'& .MuiFormControlLabel-control':{fontSize:'5px' }}}
                                                    control={
                                                        <Checkbox
                                                            checked={Object.values(menu[1]).every(Boolean)} // Use menu[1] instead of menu[0]
                                                            onChange={(e) => handleSelectAll(e, menu[0])}
                                                            name='selectAll'
                                                            sx={{
                                                              // color: '#778',
                                                              // '&.Mui-checked': {
                                                              //   color: '#758978',
                                                              // },
                                                              '& .MuiSvgIcon-root': { fontSize: 14 }
                                                              }}
                                                        />
                                                    }
                                                    label = {name}
                                                />
                                            </TableCell>
                                            <TableCell></TableCell>

                                            {options.map((option, key) => {
                                                const label = option[0].split("_").pop()
                                                return (
                                                    <TableCell align="right" >
                                                        <FormControlLabel
                                                            key={option[0]}
                                                            control={
                                                                <Checkbox
                                                                    checked={option[1]}
                                                                    onChange={(e) => handleChange(e, menu[0])}
                                                                    name={option[0]}
                                                                    sx={{
                                                                    // color: '#778',
                                                                    // '&.Mui-checked': {
                                                                    //   color: '#758978',
                                                                    // },
                                                                    '& .MuiSvgIcon-root': { fontSize: 18 }
                                                                    }}
                                                                />
                                                            }
                                                            label={label}
                                                            sx={{textTransform: 'capitalize'}}
                                                        />
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </>
                        );
                    })}
            </Table>
        </TableContainer>
    );
}

export default RoleLists;
