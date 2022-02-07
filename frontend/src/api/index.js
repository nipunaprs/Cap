
export const getPoints = async (transactions_data) => {

    try {
      
        const response = await fetch('http://localhost:5000/GetPoints', {method : 'POST', headers: { 'Content-Type': 'application/json' 
          }, body: transactions_data })
           
        const data = await response.json();

        console.log(data);
        return data;
    }
    catch(error) {
        console.log(error)
    }



}