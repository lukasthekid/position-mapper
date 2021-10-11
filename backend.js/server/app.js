
/**
 * This module registers all the application logic
 * Use this file to register the routes you implemented.
 */

 'use strict';

 const express = require('express');
 require('express-async-errors')
 const cors = require("cors")
 const radarRoutes = require('./routes/radar');
 const wsPosition = require('./utils/wsPosition');


const app = express();
var expressWs = require('express-ws')(app);
const aWss = expressWs.getWss();

const clients = 0;


radarRoutes.ws("/ws", function(ws, req){

  //console.log(aWss.clients);
  wsPosition.finder(ws,req);
});

app.use(cors())
app.use(express.json());

app.use("/radar", radarRoutes);









 // Register the modules containing the routes
 app.use('/radar', radarRoutes);

 app.use((req,res,next) => {
   res.sendStatus(404);
 });
 
 module.exports = app;