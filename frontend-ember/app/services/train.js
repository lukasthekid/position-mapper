import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

const BASE_URL = 'http://localhost:5000/radar/';

export default class TrainInfoService extends Service {
  @service('svg-inline') svgInlineService;

  @tracked train = {};
  @tracked popupTrainContent = A([]);
  @tracked sideBarIsVisible = false;

  trainSelectSymbol = new ol.style.Icon({
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(this.svgInlineService.trainSvgSelectedEtfz),
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    anchor: [0.25, 0.25],
    imgSize: [60, 60],
    scale: 2,
  });

  trainInactiveSymbol = new ol.style.Icon({
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(this.svgInlineService.trainSvgInaktiveEtfz),
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    anchor: [0.25, 0.25],
    imgSize: [60, 60],
    scale: 2,
  });

  trainSelectStyleFunction(feature) {
    const selectStyle = new ol.style.Style({
      image: this.trainSelectSymbol,
      text: new ol.style.Text({
        overflow: true,
        font: 'center',
        text: String(feature.get('trainId')),
        textAlign: 'center',
        textBaseline: 'top',
        fill: new ol.style.Fill({
          color: '#ffffff',
        }),
        padding: [-4, 4, -4, 4],
        offsetX: -1,
        offsetY: 15,
        scale: 1.5,
        backgroundFill: new ol.style.Fill({
          color: '#00a99d',
        }),
      }),
    });
    return selectStyle;
  }

  @action setTrain(train) {
    this.train = train;

    const namingTrain = {
      train_id: 'Client ID',
      client_model: 'Client Model',
      ziel: 'Ziel',
    };
    for (var prop in train) {
      if (train[prop] !== null) {
        const propname = namingTrain[prop];
        if (propname) {
          this.popupTrainContent.pushObject({
            key: propname + ': ',
            value: train[prop],
          });
        }
      }
      // console.log(prop + ': ' + train[prop]);
    }
  }
}
