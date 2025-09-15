import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';

const LeftSideBarSkeleton = () => {
  return (
    <Grid container spacing={2}>
      {[...Array(14)].map((_, index) => (
        <Grid item xs={12} sm={12} md={12} key={index}>
          <Box 
            sx={{
              width: '100%', 
              padding: 0.5, 
              borderRadius: 2, 
              boxShadow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              mb:2,
              zIndex:9999,
              backgroundColor:'#fff',
              opacity:0.1
            }}
          >
          {index ===0 ? (
            <Box>
                <Skeleton variant="rounded" width={100} height={10} />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
            </Box>
          ):(
            <Skeleton variant="rounded" width={100} height={10} />
          )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default LeftSideBarSkeleton;
