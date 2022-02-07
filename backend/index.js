//Express setup code
const express = require('express');
const cors = require("cors"); 

const app = express();
app.use(express.json());

app.use(cors({
    methods: ["GET", "POST", "DELETE"],
    credentials: true
    
}));


app.post('/GetPoints', (req,res) => {

    
    //Grab transactions data from the body
    const transactions = req.body;
    console.log(transactions)
    //Variables for final result
    let final_max = 0;
    let final_rule = 0;
    let rule7_used = false;

    //Running total for each store
    let total_tm = 0;
    let total_sb = 0;
    let total_sc = 0;
    let total_other = 0;

    //Array with descriptions
    const description = [
        ['sportcheck','tim_hortons','subway'],
        ['sportcheck','tim_hortons'],
        ['sportcheck'],
        ['sportcheck','tim_hortons','subway'],
        ['sportcheck','tim_hortons'],
        ['sportcheck']
    ]

    ////////////// METHODS SECTION ////////////////
    // Keywords used : sc--sportcheck,tm--tim hortons,sb--subway,


    //Calculate total spent based on each store
    for (const [key,value] of Object.entries(transactions)) {
        
        let money_spent = parseInt(value.amount_cents)*0.01;
        let leftover = 0;
        
        if(value.merchant_code == 'sportcheck') {
            total_sc+=money_spent
        }
        else if (value.merchant_code == 'tim_hortons') {
            total_tm+=money_spent
        }
        else if (value.merchant_code == 'subway') {
            total_sb+=money_spent
        }
        else {
            total_other+=money_spent
        }
        
    }
    
    
    //Method to make sure every number in array is less than two 
    const isBelowThreshold = arr => arr.every( v => v >= 2 )

    //Other points includes all the points that are not part of 3 main stores (sc,tm,sb)
    const other_points = Math.floor(total_other);

    //Multiply method takes an array similar to this [sctotal,threshold,tmtotal,threshold,sbtotal,threshold] 
    //Threshold is based on rule (# of points assigned for that store)
    //Returns the minimum multiplier for promo and any leftover ammount to be used for rule #7
    function multiply(arr) {
        scmultiplier = Math.floor((arr[0]/arr[1]))
        tmmultiplier = Math.floor((arr[2]/arr[3]))
        sbmultiplier = Math.floor((arr[4]/arr[5]))

        min_multiplier = 0;

        //Ensure all multipliers are atleast 2x, else its just a 1x multipler
        if(isBelowThreshold([scmultiplier,tmmultiplier,sbmultiplier])) {
            min_multiplier = Math.min(scmultiplier,tmmultiplier,sbmultiplier)
        }
        else {
            min_multiplier = 1
        }

        //Calculate remainder based on min multiplier [total - (min_multiplier*threshold)]
        scremainder = Math.floor(arr[0]-(min_multiplier*arr[1]))
        tmremainder = Math.floor(arr[2]-(min_multiplier*arr[3]))
        sbremainder = Math.floor(arr[4]-(min_multiplier*arr[5]))

        return [min_multiplier,scremainder,tmremainder,sbremainder]
    }

    //Method assigns points to each individual transaction based on the rule currently applied
    //Adds 3 to 4 extra variables to JSON file (points for transaction, current rule,if rule 7 used, and leftover points for rule 7)
    function assignPoints(currentrule,cpoints,leftoverarr,rule7_used) {
        for (const [key,value] of Object.entries(transactions)) {
            
            

            //For all rules that arent rule 7, ensure it matches the specific rules merchant codes in array
            if(currentrule <=6 && description[currentrule-1].includes(value.merchant_code)) {
                //Update points, rule, and if rule 7 was also applied due to left over
                transactions[key].points = cpoints
                transactions[key].rule7used = rule7_used
                transactions[key].rule = currentrule
                //Add points for each specific merchant
                if(value.merchant_code == 'sportcheck') {
                    transactions[key].leftoverpoints = leftoverarr[0]
                }
                else if(value.merchant_code == 'tim_hortons') {
                    transactions[key].leftoverpoints = leftoverarr[1]
                }
                else if(value.merchant_code == 'subway') {
                    transactions[key].leftoverpoints = leftoverarr[2]
                }
                
            }
            else {
                transactions[key].rule = 7
            }
            
            //If its not sc,tm,sb then add the rule seven points 
            if(description[0].includes(value.merchant_code) == false) {
                
                transactions[key].points = Math.floor(parseInt(value.amount_cents)*0.01)
                transactions[key].rule = 7
                transactions[key].rule7used = true
                transactions[key].leftoverpoints = 0
            }

        }
    }

    ////////////// RULES SECTION ////////////////
    //The process is described in rule #1 and is the same for all other rules with minor variations depending on its conditions
    //Depending on the totals spent, each rule may or may not be run, only whent the conditions are met will it be checked.

    //Rule #1 - 500 points for $75 at sc and $25 at tm
    if(total_sc>=75 && total_tm >= 25 && total_sb >= 25) {
        
        //Get the lowest promotion multiplier (1x,2x..ect) and remainders using multiply method
        arr = multiply([total_sc,75,total_tm,25,total_sb,25])
        
        //Leftover ammounts (not applied for promo) are stored as a total and each ammount seperate in an array
        leftover_bal = arr[1]+arr[2]+arr[3]
        leftover_balarr = [arr[1],arr[2],arr[3]]
        
        //Current maximum points for this rule is calculated with (points*lowest_multiplier) + leftover_balance_total + other_points
        current_max = (500*arr[0])+leftover_bal+other_points

        //Only if the current maximum is greater than prev stored max it will replace it
        if(current_max > final_max) {
            //Change the max and update the rules, also if leftover balance, rule 7 used will be updated to true
            final_max = current_max;
            final_rule = 1;
            if (leftover_bal > 0) rule7_used=true; 
            
            //Assign the correct points to the correspending transactions using the assign points method
            assignPoints(final_rule,500*arr[0],leftover_balarr,rule7_used)
            
        }
        //Log on server side if the rule ran
        console.log('rule 1','current:',current_max,'final:',final_max)
        
    }
    
    //Rule #2 - 300 points for every $75 at sc and $25 at tm
    if(total_sc>=75 && total_tm >= 25) {
        
        arr = multiply([total_sc,75,total_tm,25,total_tm,25])
        leftover_bal = arr[1]+arr[2]+Math.floor(total_sb)
        leftover_balarr = [arr[1],arr[2],Math.floor(total_sb)]

        current_max = (300*arr[0])+leftover_bal+other_points

        if(current_max > final_max) {
            final_max = current_max;
            final_rule = 2;
            if (leftover_bal > 0) rule7_used=true; 

            assignPoints(final_rule,300*arr[0],leftover_balarr,rule7_used)
        }
        console.log('rule 2','current:',current_max,'final:',final_max)
    }
    
    //Rule #3 - 200 points for every $75 at sc 
    if(total_sc>=75) {

        arr = multiply([total_sc,75,total_sc,75,total_sc,75])
        leftover_bal = arr[1]+Math.floor(total_tm)+Math.floor(total_sb)
        leftover_balarr = [arr[1],Math.floor(total_tm),Math.floor(total_sb)]

        current_max = (200*arr[0])+leftover_bal+other_points

        if(current_max > final_max) {
            final_max = current_max;
            final_rule = 3;
            if (leftover_bal > 0) rule7_used=true; 

            assignPoints(final_rule,200*arr[0],leftover_balarr,rule7_used)
        }

        console.log('rule 3','current:',current_max,'final:',final_max)
    }
    
    //Rule #4 - 150 points for every $25 at sc, $10 spend at tm, $10 spend at sb
    if(total_sc>=25 && total_tm >= 10 && total_sb >= 10) {

       arr = multiply([total_sc,25,total_tm,10,total_sb,10])
       leftover_bal = arr[1]+arr[2]+arr[3]
       leftover_balarr = [arr[1],arr[2],arr[3]]

       current_max = (150*arr[0])+leftover_bal+other_points

       if(current_max > final_max) {
           final_max = current_max;
           final_rule = 4;
           if (leftover_bal > 0) rule7_used=true; 

           assignPoints(final_rule,150*arr[0],leftover_balarr,rule7_used)
       }
       console.log('rule 4','current:',current_max,'final:',final_max)
    }
    
    //Rule #5 - 75 points for every $25 at sc, $10 at tm
    if(total_sc>=25 && total_tm >= 10) {
        
        arr = multiply([total_sc,25,total_tm,10,total_tm,10])
        leftover_bal = arr[1]+arr[2]+Math.floor(total_sb)
        leftover_balarr = [arr[1],arr[2],Math.floor(total_sb)]

        current_max = (75*arr[0])+leftover_bal+other_points

        if(current_max > final_max) {
            final_max = current_max;
            final_rule = 5;
            if (leftover_bal > 0) rule7_used=true; 

            assignPoints(final_rule,75*arr[0],leftover_balarr,rule7_used)
        }
        console.log('rule 5','current:',current_max,'final:',final_max)      
    }
    
    //Rule #6 - 75 points for every $20 at sc 
    if(total_sc>=20) {

        arr = multiply([total_sc,20,total_sc,20,total_sc,20])
        leftover_bal = arr[1]+Math.floor(total_tm)+Math.floor(total_sb)
        leftover_balarr = [arr[1],Math.floor(total_tm),Math.floor(total_sb)]

        current_max = (75*arr[0])+leftover_bal+other_points

        if(current_max > final_max) {
            final_max = current_max;
            final_rule = 6;
            if (leftover_bal > 0) rule7_used=true; 

            assignPoints(final_rule,75*arr[0],leftover_balarr,rule7_used)
        }      
        console.log('rule 6','current:',current_max,'final:',final_max)
    }
    
    //Rule #7 -- This case applies for just other items
    if(total_other > 0) {
        
        current_max = Math.max(other_points+Math.floor(total_sb)+Math.floor(total_sc)+Math.floor(total_tm),final_max)
        
        if(current_max > final_max) {
            final_max = current_max
            final_rule = 7;
            rule7_used=true; 

            assignPoints(final_rule,0,[0],rule7_used)
        }
        console.log('rule 7','current:',current_max,'final:',final_max)
    }


    //Final results log serverside
    console.log('final points:',final_max,' final rule:',final_rule,' rule 7 used:',rule7_used)
    
    //Add the final points to the transactions object
    transactions.finalpoints = final_max
    
    //Log the final transactions list and their points server side
    console.log('---Printing Transaction---')
    console.log(transactions)
    
    //Send the transaction data back
    res.send(transactions)
    
    
})



app.listen(5000);
