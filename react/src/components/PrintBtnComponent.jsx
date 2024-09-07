import { Button } from '@mui/material'
import React from 'react'
import ReactToPrint from 'react-to-print'

export const PrintBtn = (content) => {
    return(
        <ReactToPrint
          trigger={() => <Button variant="contained" sx={{ml:2}} color="success" size="small">Print</Button>}
          content={()=> content}
       />
    )
}

