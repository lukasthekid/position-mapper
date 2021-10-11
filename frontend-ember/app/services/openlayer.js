import Service from '@ember/service';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OpenlayerService extends Service {
  @service('track') trackService;
  @service('select') selectService;
  @service('map-scaler') scaleService;

  center = [16.03553295135498, 48.180566815673096];

  map = new ol.Map({
    layers: [
      // *** to show real map ***
      // new ol.layer.Tile({ source: new ol.source.OSM() }, this.vectorLayer),
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat(this.center),
      minZoom: 16,
      zoom: 16.5,
      maxZoom: 18.5,
      //       Left     Bottom   Right    Up
      //extent: [1783030, 6136046, 1786973, 6137818],
    }),
  });

  init() {
    super.init(...arguments);
    const h = window.innerWidth;
    // console.log(h);
    this.selectService.initSelect(this.map);
  }

  @action initMap(config) {
    this.trackService.initMapDetails(this.map, config.dataString);

    this.map.setTarget('map');
    this.map.updateSize();
    this.setCenter(config.focusCenter);
    this.setRotation(config.rotation);
  }

  setCenter(lonLat) {
    this.center = lonLat;
    this.map.getView().setCenter(ol.proj.fromLonLat(this.center));
  }

  setRotation(r) {
    this.map.getView().setRotation(r);
  }
}
