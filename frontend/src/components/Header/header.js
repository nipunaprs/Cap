import React from 'react';
import Box from '@mui/material/Box';
import { Stack, AppBar, Toolbar, Typography, MenuItem,Select } from '@mui/material';
import './header.css'

function Header() {
  return (
    <AppBar position='static'>
        <Toolbar className='toolbar'>

            <Box display="block">
                    <Typography variant="h6">
                        CapitalOneRewards
                    </Typography>
                    
                </Box>
                <Box display="flex">
                    <Typography variant="h6">
                        Made By Nipuna Peiris
                    </Typography>
                    
                </Box>

        </Toolbar>
    </AppBar>


  );
}

export default Header;
