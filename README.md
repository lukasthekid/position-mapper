# Live Position tracker on dynamic Map

This Webapplication is an early **prototype** of an enterprise application that is currently in development. Vector-Files (GeoJSON) of an inquired area can be loaded (was developed for railways in station areas) and be converted to a schematic representation for better visability. The backend sends simulated train positions and converts coordinates to intrinsic positions for the frontend to map it on the railway. The user can interact with the train positions to get some attributes and with different railways tracks.


## Features

 - Clear data noise of GeoJSON from OpenRailwayMaps to get a topologic graph of the railways
 - Strech traffic system in height to get a more visual map (dynamic with a factor)
 - Simulate train/car routes with geographical positions and convert them to intrinsic positions
 - User can interact with map and corresponding tracking positions
 - User can add multiple traffic systems and switch between them

## Technology

Backend was build in  [Node.js](https://nodejs.org/en/) with help of [express](https://www.npmjs.com/package/express).  Backend provides REST API and TCT WebSocket for communication

Frontend uses [Ember Framework](https://emberjs.com/) with the Help of the [OpenLayers](https://openlayers.org/) Library. UI is designed via UI-Kit and Bootstrap

## Start the Prototype
If you start the application the first Time run

    npm install
before the commands shown down below.

Open the backend Folder in your Editor/IDE or open the Terminal in the specific Folder. Now start the backend and the simulation data with the following commands.

    cd server
    node server
  
Now open your Terminal in your frontend Folder and type the following command.

    npm start
   or
   

    ember s
  
now go and visit http://localhost:4200/ (the port should be displayed to you after you start the frontend).

Explore the Web-App and have fun :)
