'use strickt';
const fs = require('fs');
const path = require('path');

const randomSpeed = (under, upper) => {

    return parseInt(((upper-under) * Math.random() + under))

}

const updatePosition = () =>{

}

const correctNoGPS = (trainToCorrect, leadingTrain) =>{
    const tid = trainToCorrect[0].train_id;
    const trackid = trainToCorrect[trainToCorrect.length-1].track_id;
    const old_position = trainToCorrect[trainToCorrect.length-1].rel_position;

    for (let i = trainToCorrect.length; i < leadingTrain.length; i++) {
        trainToCorrect[i] = {train_id:tid, track_id:trackid, time:i+1, rel_position:old_position, active:false}
        
    }
}

const measure = (start, end) =>{
    const lat1 = start[1];
    const lon1 = start[0];
    const lat2 = end[1];
    const lon2 = end[0];
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

const generatePosition = (meterStrecke,start,ende, speed) =>{
    const deltaLat = ende[1]-start[1];
    const deltaLong = ende[0]-start[0];
    const factor = speed / meterStrecke;
    const position = [start[0] + deltaLong * factor, start[1] + deltaLat * factor]
    return position;
}

const getPositionFactor = (meterStrecke, speed) =>{
    return speed / meterStrecke
}

const trimmTrack = (i, features, trimmedSections,sec_start) =>{
    
    
    try{
        
        const sec = features[i].geometry.coordinates;
        let sec_end = sec.length;
        
        let next_sec_start = 0;
        
        try{

            const next_sec = features[i+1].geometry.coordinates;
    
                
    
                
                
                for (const i in sec) {
                    
                    if(JSON.stringify(sec[i]) == JSON.stringify(next_sec[0])){
                        console.log('connect bei: ' + sec[i]);
                        sec_end = parseInt(i) + 1;
                        console.log('trimmed array is now: ' + sec.slice(sec_start, sec_end));
                        break;
                    }
                    
                }
                
                for (const i in next_sec) {
                    if (JSON.stringify(next_sec[i])==JSON.stringify(sec[sec_end-1])) {
                        console.log('connect bei: ' + next_sec[i]);
                        next_sec_start = parseInt(i);
                        
                    }
                }
                const section = {start:sec_start, end:sec_end-1, coordinates:sec.slice(sec_start,sec_end)}
                trimmedSections.push(section);
                trimmTrack(i+1, features, trimmedSections, next_sec_start);
        }catch(e){
            const section = {start:sec_start, end:sec_end-1, coordinates:sec.slice(sec_start,sec_end)}
            trimmedSections.push(section);
            trimmTrack(i+1, features, trimmedSections, next_sec_start);
        }
    
            
    }catch(e){
        //console.log(trimmedSections);
        console.log('finished: ' + e.message);
        return trimmedSections

    }
}

const generateTrackSection = (track_id, sections, time, train_id, reversed, total_section_length) =>{
    simulationTrack = [];
    let meterSimuliert = 0;
    let meterStrecke = 0;
    let meterRelStrecke = 0;
    let i = 0;
    let j = 0;

    let k = 0;


    try{
        let start = sections[i]
        let prevFactor = 0;
        

        while(true){




            //calculating gps position
            let pos;
            let end = sections[i+1]
            meterStrecke = measure(start, end);
            let speed = (randomSpeed(50,80) / 3.6).toFixed(4);

            if(speed < meterStrecke){
                pos = generatePosition(meterStrecke,start,end, speed)               
            }else{
                pos = end;
                i +=1;
            }


            //calculating relative position between two points
            let relStart = sections[k]
            let relEnd = sections[k+1]
            meterRelStrecke = measure(relStart, relEnd);
            const factor = getPositionFactor(meterRelStrecke, speed);
 
            if(factor + prevFactor < 1){
                prevFactor += factor;

            }else{
                prevFactor = 0;
                k +=1;
            }

            if(!reversed){             
                simulationTrack[j] = {track_id:track_id, train_id:train_id, time:time, rel_position:{node_index:k, next_node_index:k+1,factor:prevFactor}, active:true}
            }else{
                const last_index = total_section_length -1;
                const s = last_index - k;
                const e = s-1;
                simulationTrack[j] = {track_id:track_id, train_id:train_id, time:time, rel_position:{node_index:s, next_node_index:e ,factor:prevFactor}, active:true}
            }
                j +=1
                time +=1;
                start = pos;
            
            
        }

    }catch (e){
        console.log("section generiert");
        return simulationTrack;
        

    }

    
}

const simulateTrack = (sectionsOfCurrentTracks, train_id, reversed) =>{
    const simulatedTrack = []
    let startTime = 1;


    // trimming tracks not needed anymore, due to map fixes
    
    // let trimmedSections = []
    // et trimmedcoordinates = trimmTrack(0, sectionsOfCurrentTracks, trimmedSections, 0)
   //console.log(trimmedTracks);
    
    

    for (const i in sectionsOfCurrentTracks) {
        const section = sectionsOfCurrentTracks[i]
        const total_section_length = section.geometry.coordinates.length
        //const coordinates = trimmedSections[i]
        const coordinates = section.geometry.coordinates



        const sectionSimulation = generateTrackSection(section.properties.fid, coordinates, startTime, train_id, reversed, total_section_length )
        Array.prototype.push.apply(simulatedTrack, sectionSimulation)
        startTime += sectionSimulation.length
        
        
    }
    console.log("strecke simuliert");
    return simulatedTrack;

}

const generateSimulation = (railways, trains) =>{
    //console.log(railways);
    const simulation = []

    for (const i in trains) {
        const tracks = trains[i].routeSections
        const train_id = trains[i].train_id;
        let reversed = false;
        
        let currentTrack = railways.filter(way =>  tracks.includes(way.properties.fid))

        currentTrack = currentTrack.sort(function(a,b){
            return tracks.indexOf(a.properties.fid) - tracks.indexOf(b.properties.fid);
        })

        const rightPoint = currentTrack[0].geometry.coordinates[0][0];
        const leftPoint = currentTrack[currentTrack.length-1].geometry.coordinates[0][0];

        if ( leftPoint > rightPoint){
            console.log('reversed track detected');
            
                reversed = true;
                for (const i in currentTrack) {
                    currentTrack[i].geometry.coordinates.reverse();
                }
        }

        //console.log(currentTrack);
        
        // if(tracks[0] != currentTrack[0].properties.fid){
        //     console.log('normal track detected: ' + tracks);
        //     currentTrack.reverse();
            
        // }
        // else{
            
        //     
        //     reversed = true;
        //     for (const i in currentTrack) {
        //         currentTrack[i].geometry.coordinates.reverse();
        //     }
            
        // }
        
        // else if (trains.length > 1){
        //     var precision = 0.00001;

        //     console.log('compare ' + currentTrack[0].geometry.coordinates[0][0] + ' with ' + currentTrack[1].geometry.coordinates[0][0]);
        //     if(Math.abs(currentTrack[0].geometry.coordinates[0][0] - currentTrack[1].geometry.coordinates[0][0]) <= precision){
        //         console.log('reversed track detected: ' + tracks);

        //         currentTrack.reverse();
                
        //         reversed = true;
        //         for (const i in currentTrack) {
        //             currentTrack[i].geometry.coordinates.reverse();
        //         }
        //     }
            
        // }
        
        //console.log(currentTrack);
        
        simulation[i] = simulateTrack(currentTrack, train_id, reversed);
        

        // for (const j in currentTrack) {
        //     simulation[i] = generateTrackSection(currentTrack[j].properties.fid, currentTrack[j].geometry.coordinates)  
        // }
    }

    //correct no-gps errors
    //get most tracked train
    const leadingTrain = simulation.sort((a,b) => b.length - a.length)[0]
    correctNoGPS(simulation[simulation.length-1], leadingTrain);
    //console.log(simulation[2]);

    return simulation;
}

module.exports = {randomSpeed, updatePosition, generateTrackSection, generateSimulation, measure, generatePosition, getPositionFactor, trimmTrack}