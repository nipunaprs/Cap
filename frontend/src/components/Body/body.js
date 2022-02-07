import React, {useEffect, useState} from 'react';
import './body.css'
import {TextField, Box, Typography, Button } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {getPoints} from '../../api/index';


function Body() {

  const [gotData,setgotData] = useState(false);
  const [points,setPoints] = useState(0);
  const [transaction,setTransaction] = useState([]);
  let result = []
  let arr = [{date: '2021-05-09', merchant_code: 'sportcheck', amount_cents: 15000, points: 525, rule: 6}]

  return (

    
    <div className='body'>
      <Box 
        sx={{
          width: 1000,
          maxWidth: '100%',
          
        }}>
        <TextField id='data' fullWidth  multiline maxRows={20} label="Enter Transactions Data Here"></TextField>
        
      </Box>
      
      <Box mt={5}>
        <Button onClick={() => {
          //console.log(document.getElementById('data').value)
          getPoints(document.getElementById('data').value)
            .then((data) => {
              //console.log(data.length)
              setTransaction([]);
              for (const [key,value] of Object.entries(data)) {
                if(key != 'finalpoints') {
                  setTransaction(transaction => [...transaction,value] );
                  result.push(value)
                }
                else {
                  setPoints(value)
                }
              }

              

              console.log(result)
              console.log(points)
            })
            setgotData(true)

        }} className='send-btn'  variant='contained'>Get Points</Button>
      </Box>
            
      <Box mt={3} mb={3}>
      {gotData ? (<Typography variant='h6'>Congrats you accumulated {points} points from your transactions!</Typography>) : (<Typography variant='h6'> Please enter some transactions above!</Typography> ) }
        
      </Box>


      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell>Ammount Spent</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Rule Used</TableCell>
            <TableCell>Rule 7 Used</TableCell>
            <TableCell>Leftover Points</TableCell>
            
          </TableRow>
          
        </TableHead>

        <TableBody>
         
          
          {gotData ? (transaction?.map((data) => (
            
            <TableRow>
              <TableCell>{data.date}</TableCell>
              <TableCell>{data.merchant_code}</TableCell>
              <TableCell>{data.amount_cents}</TableCell>
              <TableCell>{data.points}</TableCell>
              <TableCell>{data.rule}</TableCell>
              <TableCell>{data.rule7used.toString()}</TableCell>
              <TableCell>{data.leftoverpoints}</TableCell>
              
            </TableRow>)
            )
          ) : (<TableRow><TableCell>No Data Available</TableCell></TableRow>)}
        </TableBody>
      </Table>
      </TableContainer>
    
    
    </div>


  );
}

export default Body;
