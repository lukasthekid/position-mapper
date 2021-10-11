'use strickt';
const fs = require('fs');
const path = require('path');
const simulator = require('../utils/simulation');


const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/rekawinkel.json')));
const trains = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/trackroute-rekawinkel.json')));

const data2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/stockerau.json')));
const trains2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/trackroute-stockerau.json')));

const simulation1 = simulator.generateSimulation(data.features, trains);
const simulation2 = simulator.generateSimulation(data2.features, trains2);

//simulation of both maps
const simulation = new Map([["rekawinkel", simulation1], ["stockerau", simulation2]]);



let timestamp = 0;
let intervall = new Map();

setInterval(function(){
    //console.log(intervall);
    timestamp +=1


},1000)

const finder = (ws, req) =>{
    intervall.set(req.socket, 1);


        ws.on('message', function(msg){
        //console.log(req.socket.remoteAddress);

          intervall.set(req.socket, parseInt(msg))

          console.log(`intervall von ${parseInt(msg)} sekunden`);
        })

        setInterval(function(){

        const clientIntervall = intervall.get(req.socket)

        if(timestamp%clientIntervall == 0){
            
            try{
            
                let wholePositions = {};
                for (let [key, value] of simulation) {

                    let allPositions = [];
                    let j = 0;
                    for (const i in value) {
    
                        let currentPosition = value[i].filter(item => item.time == timestamp);
                        if(currentPosition.length > 0){
                            allPositions[j] = currentPosition[0]
                            j+=1;
    
                        }
            
                    }
                    
                    if(allPositions.length < 1) timestamp = 0;

                    wholePositions[key] = allPositions;
                    //ws.send(JSON.stringify( allPositions)); 
                }
                

                //console.log(allPositions);
               

                ws.send(JSON.stringify( wholePositions))
                
                //const currentPosition = simulation[0].filter(item => item.time == timestamp);
                //res.json(allPositions);
        
            }catch(e){
                console.log(e.message);
        
            }
        
    
    
        }
        },1000 * intervall.get(req.socket))
        
      

}

module.exports = {finder}