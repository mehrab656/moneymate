import { useState } from 'react';
// @mui
import { Avatar, Checkbox, TableRow, TableCell, Typography, MenuItem, Box, Tooltip, Button } from '@mui/material';
// components
import Iconify from '../../Iconify';
import  TableMoreMenu  from '../TableMoreMenu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PreviewIcon from '@mui/icons-material/Preview';
import { compareDates } from '../../../helper/HelperFunctions';
// ----------------------------------------------------------------------

export default function CategoryTableRow({ 
  row,
  selected,
  onSelectRow,
  onEditRow,
  onViewRow,
  onDeleteRow,
  userPermission
 }) {
  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };


  return (
    <TableRow hover >

      <TableCell align="left" >{row?.id}</TableCell>
      <TableCell align="left">{row?.name}</TableCell>
      <TableCell align="left">{row?.type}</TableCell>
      {(userPermission?.category_edit ===true ||userPermission?.category_delete || userPermission?.category_view) &&
      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:edit-fill'} />
                Edit
              </MenuItem>
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
            
            </>
          }
        />
      </TableCell>
      }
    </TableRow>
  );
}
