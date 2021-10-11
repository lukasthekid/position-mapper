'use strickt';
const fs = require('fs');
const path = require('path');

const sortCoordinates = (data) =>{
    let output = data;

    for (const feature of output.features) {
        const l = feature.geometry.coordinates.length;
        const firstC = feature.geometry.coordinates[0][0];
        const lastC = feature.geometry.coordinates[l-1][0];

        //check if false order
        if(lastC > firstC){
            console.log("reversed track");
            feature.geometry.coordinates.reverse()

        }
    }

    const dataJ = JSON.stringify(output);
    fs.writeFile('sorted.json', dataJ, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });



}

const jsonSplitter = (data) =>{

    let counter = 0;
    while (splitter(data).tracksSplitted != 0){
        data.features.sort(() => Math.random() - 0.5);
        counter += 1;

    }
    console.log(counter + " mal gesplitted");

}

const splitter = (data) =>{
    console.log("JSON wird gesplittet");
    let splittedData = data;
    const coordinateMap = new Map();
    let features = splittedData.features;
    let fL = features.length;
    let i = 0;
    let trackSplitted = 0;
    while (i < fL){
        const f = splittedData.features[i];
        const id = f.properties.fid;
        let coordinates = splittedData.features[i].geometry.coordinates;
        for (const j in coordinates) {
            const c = JSON.stringify(coordinates[j]);
            const cLen = coordinates.length;
            if(coordinateMap.get(c) == null){
                //console.log("hinzufügen");
                coordinateMap.set(c,id);
            }else if ( j!= 0 && j != (cLen-1)){
                trackSplitted+=1;
                console.log("weiche detected bei stecke " + id + " an c stelle " + j + " länge " + cLen);
                
                let fS = JSON.stringify(f);
                let subFeature = generateSubFeature(fS,j);
                const u = parseInt(j)+1;
                //console.log(u);
                splittedData.features[i].geometry.coordinates = coordinates.slice(0,u);
                splittedData.features.push(subFeature);
                fL = splittedData.features.length;
                break;
            }
        }
        i = (i+1);

    }

    // splittedData.features.forEach(feature => {
    //     const id = feature.properties.fid;
    //     let coordinates = feature.geometry.coordinates;
    //     for (const i in coordinates) {
    //         const c = JSON.stringify(coordinates[i]);
    //         if (coordinateMap.get(c) == null) {
    //             //console.log("fügen hinzu " + coordinates[i]);
    //             coordinateMap.set(c,id); 
    //         }else if (i != 0 && i != coordinates.length-1){
    //             console.log("weiche detected bei stecke " + id + " an c stelle " + i);
    //             // const subFeature = generateSubFeature(feature, i);
    //             // feature.geometry.coordinates = feature.geometry.coordinates.slice(0,(i+1));
    //             // splittedData.features.push(subFeature);
    //             // break;
    //         }
    //     }

    // });

    // const dataJ = JSON.stringify(splittedData);
    // fs.writeFile('splitted.json', dataJ, (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log("JSON data is saved.");
    // });

    return {data:splittedData, tracksSplitted:trackSplitted};


}

const generateSubFeature = (pFeature, i)=>{
    pFeature = JSON.parse(pFeature);
    let newF = pFeature;
    newF.properties.fid = (pFeature.properties.fid * 10);
    newF.geometry.coordinates = pFeature.geometry.coordinates.slice(i);

    return newF;
}

module.exports = {sortCoordinates, jsonSplitter}