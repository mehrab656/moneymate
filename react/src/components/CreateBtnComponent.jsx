import { Button } from '@mui/material'
import React from 'react'
import Iconify from './Iconify'
import { Link } from 'react-router-dom'

const CreateBtnComponent = ({path,action,status,title}) => {
    if(status===true){
        return(
          <Button
              sx={{textTransform:'capitalize'}}
              variant="contained"
              component={Link}
              to={path}
              onClick={action}
              startIcon={<Iconify icon={"eva:plus-fill"} />}
            >
            {title}
            </Button>
        )
      }else{
        return('')
      }
}

export default CreateBtnComponent