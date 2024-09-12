import { Box, Button, Stack, TextField } from '@mui/material';
import FilterBy from './FilterBy';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PrintIcon from '@mui/icons-material/Print';
// components
// ----------------------------------------------------------------------
export default function TableToolbar({
   filterByText,
   searchText, 
   filterName,
   onFilterName,
   
   filterBySectowShow,
   filterSecterValue,
   onChangeSectorFilter,
   filterSectorOption,

   filterBytypeShow,
   filterTypeValue,
   onChangeTypeFilter,
   filterTypeOption,

   filterDisabled,
   handleResetFilter,

   printShow,
   printComponent
    
  }) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5}}>

      {/* Filter by sector */}
      {filterBySectowShow &&
      <FilterBy
        title={'Filter By Sector'}
        filterValue={filterSecterValue}
        onChangeFilter={onChangeSectorFilter}
        filterOption={filterSectorOption}
       />
      }

      {/* Filter by type */}
      {filterBytypeShow && 
      <FilterBy
        title={'Filter By Type'}
        filterValue={filterTypeValue}
        onChangeFilter={onChangeTypeFilter}
        filterOption={filterTypeOption}
       />
      }

      {/* Filter by text */}
      {filterByText && 
      <TextField
        sx={{
            maxWidth: { sm: 340 },
            textTransform: 'capitalize',
          }}
        size="small"
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder={searchText?searchText:'Search ...'}
      />
      }

      <Box display={'flex'} alignItems={'center'}>
       {/* <Button disabled={filterDisabled} onClick={handleSubmitFilter} variant="contained" size="small"  startIcon={<FilterAltIcon />}>
          Filter
        </Button> */}
        <Button disabled={filterDisabled} onClick={handleResetFilter} sx={{ml:2}} variant="outlined" size="small" startIcon={<RotateLeftIcon />}>
          Reset
        </Button>
        {printShow &&
          printComponent
        }
      </Box>
     
    </Stack>
  );
}
