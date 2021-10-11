'use strickt';
const fs = require('fs');
const path = require('path');





let tracks;
let correctedCorrdinateIndex;

const getScaledJson = (factor, data, t, switches)=> {
    let scaledJson = data;
    tracks = t;
    

    //scale the railways O(n^2)
    for (const i in data.features) {
        const delta = calculateDistanceDelta(factor,data.features[i])

        for (const j in  data.features[i].geometry.coordinates) {
            let newCoordinate = data.features[i].geometry.coordinates[j];
            newCoordinate[1]+=delta;
            scaledJson.features[i].geometry.coordinates[j] = newCoordinate;

        }
    }

    //correct the errors O(n^3)

    //correctErrors(scaledJson, switches);




    // const dataJ = JSON.stringify(scaledJson);
    // fs.writeFile('user.json', dataJ, (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log("JSON data is saved.");
    // });

    // return scaledJson;



}

function calculateDistanceDelta (factor, feature){
    let delta = factor / 10000;

   for (const i in tracks) {
       if (tracks[i].includes(feature.properties.fid)) {
        delta = delta * i;
        break;      
       }
   }
   return delta;

}

const correctErrors = (data, switches) =>{

    let connectionSegments = new Map();

    for (const i in data.features) {
        let feature = data.features[i];
        const id = feature.properties.fid;
        const nodes = [parseInt(feature.properties.Seg_G_ID1), parseInt(feature.properties.Seg_G_ID2)];

        const higehrFeat = data.features.filter(f =>{

            const fNodes = [parseInt(f.properties.Seg_G_ID1), parseInt(f.properties.Seg_G_ID2)];

            //check if two segments from different hierachies share the same connection node
            if(nodes.some(n => fNodes.includes(n)) && JSON.stringify(nodes) != JSON.stringify(fNodes)){
                if(featureFromHigherHierachy(id, f.properties.fid)){
                    //console.log(nodes + " and " + fNodes + ' have same ids (' + id + " , " + f.properties.fid + ")");
                    connectionSegments.set(id,f.properties.fid)
                }

            }
        });
        
    }

    for (let [key, value] of connectionSegments) {
        //console.log(key + " connected mit " + value);

        let f = data.features.filter(d => d.properties.fid === key)[0];
        const hF = data.features.filter(hD => hD.properties.fid === value)[0];

        data.features = data.features.filter(d => d.properties.fid != key);
        
        connectSegmentToHigherHierachy(f, hF);
        smoothSlope(f);
        data.features.push(f);

        smoothingSwitches(f, data, switches);
        
    }


}
const connectSegmentToHigherHierachy = (feature, higherFeature) =>{
    const fConnectionPoints = feature.geometry.coordinates;
    const hFConnectionPoints = higherFeature.geometry.coordinates;
    for (const i in fConnectionPoints) {
        

            const c = fConnectionPoints[i];
            for (const j in hFConnectionPoints) {
                

                    const hC = hFConnectionPoints[j];

                    if(c[0].toFixed(10) === hC[0].toFixed(10)){
                        //console.log(feature.properties.fid + " hit mit " + higherFeature.properties.fid);

                        correctedCorrdinateIndex = i;
                        
                        c[1] = hC[1];
                        feature.geometry.coordinates[i] = c;
                        return;
                    }

                
                
            }
        
    }
    

}

const smoothSlope = (feature) =>{
    let coordinates = feature.geometry.coordinates;
    const s = coordinates[0];
    const e = coordinates[coordinates.length-1];
    const xSlope = (e[0] - s[0]) / (coordinates.length-1);
    const ySlope = (e[1] - s[1]) / (coordinates.length-1);

    
    for (const i in coordinates) {
        const x = s[0] + xSlope*i;
        const y = s[1] + ySlope*i;
        coordinates[i] = [x,y];
    }
    feature.geometry.coordinates = coordinates;
}

const smoothingSwitches = (feature, data, switches) =>{
    //console.log(switches);
    

    try{
        
        //find the correlated fids of sections that need to be scaled too
        //console.log(feature.properties.fid);
        const idOfSwitches = switches.filter(s => s.includes(feature.properties.fid))[0];
        //console.log(idOfSwitches);

        //get the features of the fid-array
        let smoothingFeatures = [];
        for (const s of idOfSwitches) {
            const sf = data.features.filter(f => f.properties.fid === s)[0];
            smoothingFeatures.push(sf);
        }
        
        //delete the unsmoothed features from data
        const removedFeatures = data.features.filter(f => !idOfSwitches.includes(f.properties.fid));
        data.features = removedFeatures;
        
        //calculate the total length of all coordinate-arrays and the metric length of the track included in the features that need to be scaled
        let l = 0;
        let metricL = 0;
        for (const i in smoothingFeatures) {
            l = (l + smoothingFeatures[i].geometry.coordinates.length);
            metricL = (metricL + smoothingFeatures[i].properties.Seg_Length);
        }
        
        //get the two connection-points and calculate the slope (static no weighting in regard to the metric length)
        let startC  = findStartCoordinate(smoothingFeatures);
        const endC = smoothingFeatures[smoothingFeatures.length-1].geometry.coordinates[correctedCorrdinateIndex];
        const xSlope = (endC[0] - startC[0]) / (l-smoothingFeatures.length);
        const ySlope = (endC[1] - startC[1]) / (l-smoothingFeatures.length);


        //let k = 0;
        //console.log(smoothingFeatures);
        
        for (const i in smoothingFeatures) {

            let f = smoothingFeatures[i];
            let sectionEnd = startC;
            let k = 0;
            
            
            
            //calculating the weight for the current feature (metric length in regard to the metric length of all features)
            const w = getFeatureWeight(l, metricL, f,smoothingFeatures);
            
            //console.log(f.properties.fid + " with a ratio of: " + v + " globaly: " + r);

            //check in which direction the slope stands
            if(xSlope > 0 ){
                for (var j = f.geometry.coordinates.length - 1; j >= 0; j--) {
                    const x = startC[0] + xSlope*k*w;
                    const y = startC[1] + ySlope*k*w;
                    f.geometry.coordinates[j] = [x,y];
                    
                    
                    k++;
                }
                sectionEnd = f.geometry.coordinates[0];
                
    
            }else{
                
                for (const j in f.geometry.coordinates) {
                    const x = startC[0] + xSlope*k*w;
                    const y = startC[1] + ySlope*k*w;
                    f.geometry.coordinates[j] = [x,y];

                    k++;

                    
                }
                sectionEnd = f.geometry.coordinates[f.geometry.coordinates.length-1];
    
            }
            startC = sectionEnd;
            
            

            //k--;

            //add the smoothed switched to the data
            data.features.push(f);
            
        }


        



    }catch(e){
        //console.log(e.message);
    }



}

const getFeatureWeight = (totalSwitchLength, totalSwitchLengthMetric, feature, smoothingFeatures) =>{
    const r = parseFloat(totalSwitchLengthMetric)/parseFloat(totalSwitchLength-smoothingFeatures.length);
    const v = feature.properties.Seg_Length/(feature.geometry.coordinates.length-1);
    return (v/r);
}


const featureFromHigherHierachy = (id1, id2) =>{
    let first = 0
    let second = 0;

    for (const i in tracks) {
        if (tracks[i].includes(id1)) first = i;
        if (tracks[i].includes(id2)) second = i;

    }
    //console.log(id1  + " from hierachy: " + first + ", " + id2 + " from hierachy: " + second);
    second = parseInt(second);
    first = parseInt(first);

    return second > first;
}

const findStartCoordinate = (smoothingFeatures) =>{
    try{
        
        if(JSON.stringify((smoothingFeatures[0].geometry.coordinates[0]) != 
        JSON.stringify(smoothingFeatures[1].geometry.coordinates[0])) &&
        (JSON.stringify(smoothingFeatures[0].geometry.coordinates[0]) != 
        JSON.stringify(smoothingFeatures[1].geometry.coordinates[smoothingFeatures[1].geometry.coordinates.length-1]))){
            return smoothingFeatures[0].geometry.coordinates[0];

        }else{
            return smoothingFeatures[0].geometry.coordinates[smoothingFeatures[0].geometry.coordinates.length-1];
        }
        

    }catch(e){

    }
    
}





module.exports = {getScaledJson, calculateDistanceDelta}