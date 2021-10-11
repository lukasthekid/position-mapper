import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {header} from '@ember/component';

export default class MapComponent extends Component {
  @service('openlayer') openlayerService;
  @service('websocket') trainService;
  @service('map-scaler') mapService;

  @tracked trains = this.trainService.trains;
  //trains = [1, 2];

  @action initMap() {
    const config = {
      dataString: 'scaled-rekawinkel',
      focusCenter: [16.03553295135498, 48.180566815673096],
      rotation: 0,
    };
    // console.log(config);

    this.openlayerService.initMap(config);
    this.trainService.initTrain();
    // console.log('in maps: ' + this.trainService.trains);
  }

  @action loadTrains() {
    // console.log('in maps ' + this.trains);

    if (this.trains) {
      for (const i in this.trains) {
        const feature = new ol.Feature({
          //load current trainlocation in point
          geometry: new ol.geom.Circle(ol.proj.fromLonLat(this.trains[i]), 50),
        });
        // console.log(feature);

        this.openlayerService.vectorSource.addFeature(feature);
      }
    }
  }

  @action changeMap(){
    let config = {};
    
    if(this.mapService.currentMap.name==="rekawinkel"){
      config = {
        dataString: 'scaled-stockerau',
        focusCenter: [16.216249465942383, 48.38310507394401],
        rotation: -0.21,
      };
    }else{
      config = {
        dataString: 'scaled-rekawinkel',
        focusCenter: [16.03553295135498, 48.180566815673096],
        rotation: 0,
      };
    }
    
    // const config = this.getData(e);
    // // console.log(config);

    document.getElementById('distortion-range').value = 0;
    // //console.log(r.value);
    this.openlayerService.initMap(config);
    this.trainService.initTrain();

  }
}
