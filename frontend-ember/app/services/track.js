import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class TrackService extends Service {
  @service('select') selectService;
  @service('map-scaler') scalingService;

  @tracked popupTrackContent = A([]);
  @tracked station;
  @tracked vectorSource = new ol.source.Vector({
    });
  @tracked sideBarIsVisible = false;

  vectorLayer = new ol.layer.Vector({
    source: this.vectorSource,
    style: this.trackStyleFunction,
  });

  trackSelectStyleFunction(feature) {
    const style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#1e87f0',
        width: 3,
      }),
    });
    return style;
  }

  trackStyleFunction(feature) {
    const style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#000000',
        width: 3,
      }),
    });
    return style;
  }

  initMapDetails(map, dataString) {
    this.initLayer(map);
    this.getMapData(dataString);
    this.setLabel(map);
  }

  getMapData(dataString) {
    const request = new XMLHttpRequest();
    request.open('GET', `/${dataString}.json`, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    request.onload = () => {
      if (request.status >= 200 && request.status < 400 && request.response) {
        // Success!
        const data = JSON.parse(request.response);

        // console.log('REST_JSONDATA', data);
        this.station = data;
        this.scalingService.setMap(data)
        // console.log(data);

        const features = new ol.format.GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });

        this.vectorSource.addFeatures(features);
      } else {
        // We reached our target server, but it returned an error
        console.log('REST_JSONDATA success error', request);
      }
    };

    request.onerror = () => {
      // There was a connection error of some sort
      console.log('REST_JSONDATA connection error', request);
    };

    request.send();
  }

  initLayer(map) {
    this.vectorSource.clear();
    map.removeLayer(this.vectorLayer);
    map.addLayer(this.vectorLayer);
  }

  setLabel(map) {}

  setMap(data) {
    this.vectorSource.clear();

    const features = new ol.format.GeoJSON().readFeatures(data, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    this.vectorSource.addFeatures(features);
    const f = this.vectorSource.getFeatures();
    // console.log(f);

    //keep selected track if available
    try {
      const selectedStyle = this.trackSelectStyleFunction(null);
      this.vectorSource
        .getFeatures()
        .filter((f) => f.j.fid === this.selectService.selectedTrack.j.fid)[0]
        .setStyle(selectedStyle);
    } catch (e) {}
  }
}
