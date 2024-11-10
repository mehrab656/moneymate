import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';

const DashboardCardLoader = () => {
  return (
    <Grid container spacing={2}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box 
            sx={{
              width: '100%', 
              padding: 2, 
              borderRadius: 2, 
              boxShadow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              mb:2
            }}
          >
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCardLoader;
