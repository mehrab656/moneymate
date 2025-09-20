import { MenuItem, TextField } from "@mui/material";
import React from "react";

const FilterBy = ({title,filterValue,onChangeFilter,filterOption}) => {
  return (
    <TextField
      fullWidth
      select
      size="small"
      label={title}
      value={filterValue}
      onChange={onChangeFilter}
      SelectProps={{
        MenuProps: {
          sx: { "& .MuiPaper-root": { maxHeight: 260 } },
        },
      }}
      sx={{
        maxWidth: { sm: 240 },
        textTransform: "capitalize",
      }}
    >
      {filterOption && filterOption.map((option, key) => (
        <MenuItem
          key={key}
          value={option.name}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: "body2",
            textTransform: "capitalize",
          }}
        >
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FilterBy;
