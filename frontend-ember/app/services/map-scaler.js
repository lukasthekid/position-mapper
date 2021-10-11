import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MapScalerService extends Service {
  @service('track') trackService;
  @service('websocket') trainService;
  @service('openlayer') mapService;
  @service('select') selectService;

  @tracked currentMap = this.trackService.station;
  @tracked currentMapName = "Rekawinkel";
  lastFactor = 0;

  updateCenter(factor) {
    const times = factor - this.lastFactor;

    let lonLat = ol.proj.transform(
      this.mapService.map.j.view.j.center,
      'EPSG:3857',
      'EPSG:4326'
    );
    let delta = 2 / 10000;

    lonLat[1] = lonLat[1] + delta * times;
    // console.log(lonLat[1]);

    this.mapService.setCenter(lonLat);
    this.lastFactor = factor;
    // this.lastFactor = factor;

    //console.log(this.mapService.map.getView().getCenter());
  }

  scaleMap(factor, data) {
    fetch(`http://localhost:5000/radar/scale/${factor}`, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        this.updateCenter(factor);
        this.trackService.setMap(res);
        this.setMap(res);
        this.trainService.updateTrains();
        // this.selectService.resetTrackStyle();
      });
  }
  setMap(map) {
    this.currentMap = map;
    this.currentMapName = map.name.charAt(0).toUpperCase() + map.name.slice(1);
  }
  getMap() {
    return this.currentMap;
  }
}
