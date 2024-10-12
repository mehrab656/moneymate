import { useState } from 'react';
// @mui
import { Avatar, Checkbox, TableRow, TableCell, Typography, MenuItem } from '@mui/material';
// components
import Iconify from '../../Iconify';
import  TableMoreMenu  from '../TableMoreMenu';

// ----------------------------------------------------------------------

export default function TableAllRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {

  const { name, type, position, order, status,featured_image } = row;
  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <TableRow hover >
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <Avatar alt={name} src={photoUrl} sx={{ mr: 2 }} /> */}
        <Typography variant="subtitle2" noWrap>
          {'name'}
        </Typography>
      </TableCell>

      <TableCell align="left">{type}</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {'position'}
      </TableCell>
      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {'order'}
      </TableCell>

      {/* <TableCell align="left">
        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={(status === false && 'error') || 'success'}
          sx={{ textTransform: 'capitalize' }}
        >
          {(status ===true)?'Active':'Deactive'}
        </Label>
      </TableCell> */}

      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onDeleteRow();
                  handleCloseMenu();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon={'eva:trash-2-outline'} />
                Delete
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:edit-fill'} />
                Edit
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}