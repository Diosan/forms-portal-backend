import React from 'react';
import { Box, H1, Text, Button } from '@admin-bro/design-system';

const MyDashboard = (props) => {
  return (
    <Box className='dashboard-welcome'>
      <H1>Welcome to the TTPS Admin Panel</H1>
      {/* <Text>Use the link below to manage users:</Text> */}
      {/* <Button href="/admin/resources/users">Manage Users</Button> */}
      <a className="dashboard-btn" href="/admin/resources/users">Manage Users</a>
    </Box>
  );
};

export default MyDashboard;
