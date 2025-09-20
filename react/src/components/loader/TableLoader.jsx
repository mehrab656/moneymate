import { Skeleton, Table, TableBody, TableCell, TableRow } from "@mui/material";
import React from "react";

export const TableLoader = ({ row, col }) => {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: row }).map((_, rowIndex) => (
          <TableRow key={rowIndex} >
            {Array.from({ length: col }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton animation="wave" height={22} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
