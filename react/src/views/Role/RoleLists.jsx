import React, { useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Box, capitalize } from "@mui/material";

function RoleLists({permissions,setPermissions}) {

  const moduleArray = Object.entries(permissions);

  // Function to handle checkbox change
  const handleChange = (event, section) => {
    const { name, checked } = event.target;
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
    const { checked } = event.target;
    setPermissions((prevState) => ({
      ...prevState,
      [section]: Object.keys(prevState[section]).reduce((acc, key) => {
        acc[key] = checked;
        return acc;
      }, {}),
    }));
  };

//   console.log('permission', permissions)

  return (
    <div className='role_selection'>
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
          return (
            <>
              <Box display={"flex"} key={menu[0]}>
                <h3>{name}</h3>
                <FormControlLabel
                  sx={{ ml: 2 }}
                  control={
                    <Checkbox
                        checked={Object.values(menu[1]).every(Boolean)} // Use menu[1] instead of menu[0]
                        onChange={(e) => handleSelectAll(e, menu[0])}
                        name='selectAll'
                        />
                  }
                  label='Select All'
                />
              </Box>
              <Box sx={{m:2}}>
                {options.map((option, key)=>{
                    const label = option[0].split("_").pop()
                    return(
                        <FormControlLabel
                            key={option[0]}
                            control={
                            <Checkbox
                                checked={option[1]}
                                onChange={(e) => handleChange(e, menu[0])}
                                name={option[0]}
                            />
                            }
                            label={label}
                            sx={{textTransform:'capitalize'}}
                        />
                    )
                })}
              </Box>
             <hr/>
            </>
          );
        })}
      
    </div>
  );
}

export default RoleLists;
