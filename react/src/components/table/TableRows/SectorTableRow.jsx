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

export default function SectorTableRow({ 
  row,
  showHelperModels,
  checkPayments,
  index,
  activeElectricityModal,
  handlePay,
  nextPayment,
  default_currency,
  monthNames,
  selected,
  onSelectRow,
  onEditRow,
  onViewRow,
  onDeleteRow }) {
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

      <TableCell align="left">
        <Box display={'flex'}>
          <Box sx={{ml:2}}>{checkPayments(row.payments, 'electricity')}</Box>
          <Box sx={{ml:2}} onClick={() => showHelperModels(row, index)}>
            <Tooltip title="IncomeShow this electricity details"  placement="top" arrow>
              {index === activeElectricityModal 
                ?<VisibilityIcon />
                :<VisibilityOffIcon />
              }
            </Tooltip>
          </Box>
        </Box>
      </TableCell>
      <TableCell align="left">
        <Box display={'flex'}>
          <Box sx={{ml:2}}>{checkPayments(row.payments, 'internet')}</Box>
          <Box sx={{ml:2}} onClick={() => showHelperModels(row, index, 'internet')}>
            <Tooltip title="IncomeShow this internet details"  placement="top" arrow>
              {index === activeElectricityModal 
                ?<VisibilityIcon />
                :<VisibilityOffIcon />
              }
            </Tooltip>
          </Box>
        </Box>
      </TableCell>

      <TableCell align="left">
      {nextPayment 
        ?<Box display={'flex'}>
          <Box sx={{ml:2}}>
            <Tooltip title={`Payment Due: ${default_currency} ${nextPayment.amount}`}  placement="top" arrow>
                <Button color={"text-" + compareDates(nextPayment.date)}></Button>
              </Tooltip>
          </Box>
          <Box sx={{ml:2}}>
            {compareDates(nextPayment.date) === 'danger' &&
                <Button
                  onClick={() => handlePay(nextPayment)}
                  sx={{cursor: "pointer"}}>
                    Pay
                </Button>
            }
          </Box>
        </Box>
        :
          <Box sx={{ml:2}}><Button variant='outlined'>All Paid</Button></Box>
        }
      </TableCell>

   

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
                  onViewRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:eye-fill'} />
                View
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
    </TableRow>
  );
}
