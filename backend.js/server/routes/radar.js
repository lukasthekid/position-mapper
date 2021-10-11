'use strict';

const express = require('express');
const NodeCache = require('node-cache');
const simulator = require('../utils/simulation')
const jsonScaler = require('../utils/jsonScaler')
const helper = require('../utils/jsonHelper');

const cache = new NodeCache();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const pool = require('../db')
const router = express.Router();
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/rekawinkel.json')));
const trains = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/trackroute-rekawinkel.json')));
const tracks = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/tracks.json')));

const switches = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/smoothing.json')));
const data2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/stockerau.json')));

//helper.sortCoordinates(data2);

//jsonScaler.getScaledJson(2,data2, tracks.stockerau, switches.stockerau);

const simulation = simulator.generateSimulation(data.features, trains);

let timestamp = 0;
let intervall = 1;



router.get("/", (req, res) => {
    
    res.send(simulation)

    if(timestamp%intervall == 0){
        try{
        
            let allPositions = [];
            for (const i in simulation) {
                let currentPosition = simulation[i].filter(item => item.time == timestamp);
                if(currentPosition.length > 0)
                allPositions[i] = currentPosition[0]
    
            }
            
            //const currentPosition = simulation[0].filter(item => item.time == timestamp);
            //res.json(allPositions);
    
        }catch(e){
    
        }
    


    }

    
});

router.post('/scale/:factor', (req,res) =>{

    //res.set('Access-Control-Allow-Origin', '*');

    const reqData = JSON.stringify({
        headers: req.headers,
        method: req.method,
        url: req.url,
        httpVersion: req.httpVersion,
        body: req.body,
        cookies: req.cookies,
        path: req.path,
        protocol: req.protocol,
        query: req.query,
        hostname: req.hostname,
        ip: req.ip,
        originalUrl: req.originalUrl,
        params: req.params,
  });

  //console.log(reqData);
    //const req_string = req.toString();

    if(cache.has(reqData)){
        console.log("map was cached");
        const output = JSON.parse(cache.get(reqData));
        return res.status(200).send(output);
    }
        

    
    try{
        const data = (req.body)
        const factor = req.params.factor;
        //console.log(data.name);
        const switches = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/smoothing.json')));
        
        let new_data = null;
        if(data.name === "rekawinkel"){
            new_data = jsonScaler.getScaledJson(factor,data, tracks.rekawinkel, switches.rekawinkel);
        }else  if(data.name === "stockerau"){
            new_data = jsonScaler.getScaledJson(factor,data, tracks.stockerau, switches.stockerau);
        }

        cache.set(reqData,JSON.stringify(new_data),10000);
        res.json(new_data);


    }catch(e){
        console.log(e.message);
        res.sendStatus(404)
    }

})



router.get("/:id",  async(req, res) =>{

    res.set('Access-Control-Allow-Origin', '*');
    //res.json({train_id: req.params.id})
    try{
        let train_info = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/train_info.json')));
        train_info = train_info.filter(t => t.train_id == req.params.id)
        if(train_info.length != 0){
            res.json(train_info[0])

        }else{
            res.sendStatus(404)
        }



    }catch(e){

    }
})

router.get("/track/:name/:id",  async(req, res) =>{
    

    res.set('Access-Control-Allow-Origin', '*');
    //res.json({train_id: req.params.id})
    try{
        let track_info = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/track-info.json')));
        
        if(req.params.name === "rekawinkel"){
            track_info = track_info.rekawinkel.infos;
            track_info =  track_info.filter(t => t.fids.includes(parseInt(req.params.id)));
            

        }
        if( track_info.length != 0){
            res.json(track_info[0])

        }else{
            res.sendStatus(404)
        }



    }catch(e){
        console.log(e.message);

    }
})



setInterval(function(){ 
    timestamp +=1;
   // const currentPosition = simulation.filter(i => i.time == timestamp)[0];
    //console.log(currentPosition);
    //code goes here that will be run every 5 seconds.    

    /*
    try{
        const newPos = pool.query("UPDATE zug_position SET lat = $1, long = $2, timestamp = $3 WHERE zug_id = 1",
        [currentPosition.lat, currentPosition.long, timestamp])

    }catch(e){

    }
    */
}, 1000);




module.exports = router;