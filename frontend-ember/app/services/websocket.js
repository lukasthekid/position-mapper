import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
//import { calculatePosition } from '../utils/dataHelper';

const BASE_URL = 'ws://localhost:5000/radar/ws';
const socket = new WebSocket(BASE_URL);

export default class WebsocketService extends Service {
  @service('converter') converter;
  @service('openlayer') openlayerService;
  @service('svg-inline') svgInlineService;
  @service('select') selectService;
  @service('map-scaler') mapService;

  @tracked trains = [];

  @tracked socketMsg;

  changeIntervall(intervall) {
    try {
      socket.send(intervall);
    } catch (e) {
      console.error(e.message);
    }
  }

  updateTrains() {
    this.trains = this.extractMessage(this.socketMsg);
    this.draw(this.trains);
  }

  extractMap(data) {
    const t = this.mapService.currentMap.name
    if (t === 'rekawinkel') return data.rekawinkel;
    else if (t === 'stockerau') return data.stockerau;
  }

  extractMessage(allPositions) {
    //allPositions = JSON.parse(allPositions);

    if (allPositions.length < 1) {
      // console.log('no trains at the moment');
      return [];
    }
    try {
      //console.log('ganze Antwort' + allPositions);
      const convertedPositions = [];
      for (const i in allPositions) {
        const train = allPositions[i];
        if (train === null) continue;
        //console.log(allPositions[i]);

        const pos = this.converter.calculatePosition(
          train.rel_position,
          train.track_id
        );

        if (pos) {
          convertedPositions[i] = {
            train_id: train.train_id,
            position: pos,
            active: train.active,
            track_id: train.track_id,
          };
        }
      }

      // console.log('convertedPositions', convertedPositions);
      return convertedPositions;
    } catch (e) {
      console.error(e.message);
    }
  }

  trainVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({}),
    style: this.trainStyleFunction,
  });

  trainSymbol = new ol.style.Icon({
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(this.svgInlineService.trainSvgAktivEtfz),
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

  @action trainStyleFunction(feature) {
    const style = new ol.style.Style({
      image: feature.get('inactive')
        ? this.trainInactiveSymbol
        : this.trainSymbol,
      text: new ol.style.Text({
        overflow: true,
        offsetY: 12,
        scale: 1.5,
        backgroundFill: new ol.style.Fill({
          color: '#ffffff',
        }),
      }),
    });
    return style;
  }

  //O(n)
  draw(trains) {
    try {
      const vectorSource = this.trainVectorLayer.getSource();

      for (const train of trains) {
        const trainIdFeature = vectorSource.getFeatureById(train.train_id);

        if (trainIdFeature) {
          trainIdFeature.setGeometry(
            new ol.geom.Point(ol.proj.fromLonLat(train.position))
          );
          trainIdFeature.set('inactive', !train.active);
          trainIdFeature.set('trackID', train.track_id);
        } else if (!trainIdFeature) {
          // console.log('first initialization');
          const feature = new ol.Feature({
            //load current trainlocation in point
            geometry: new ol.geom.Point(ol.proj.fromLonLat(train.position)),
            id: train.train_id,
          });

          feature.setId(train.train_id);
          feature.set('trainId', train.train_id);
          feature.set('inactive', !train.active);
          feature.set('trackID', train.track_id);

          this.trainVectorLayer.getSource().addFeature(feature);
        }
      }

      const trainsId = trains.map((t) => t.train_id);
      vectorSource.forEachFeature((f) => {
        if (!trainsId.includes(f.getId())) {
          // console.log('zug fährt aus Simulationsbereich: ' + f.getId());
          vectorSource.removeFeature(f);
        }
      });

      // const trainsId = trains.map((t) => t.train_id);
      // vectorSource.forEachFeature((feature) => {

      //   const currentInactive = feature.get('inactive');
      //   let newInactive = false;
      //   if (!trainsId.includes(feature.getId())) {
      //     newInactive = true;
      //   }
      //   if (currentInactive !== newInactive) {
      //     feature.set('inactive', newInactive);
      //   }
      // });
    } catch (e) {
      console.error('catch: ', e);
    }
  }

  @action initTrain() {
    // console.log(socket);

    
    

    //add Layer to Map or remove if mapwas changed before
    this.openlayerService.map.removeLayer(this.trainVectorLayer);
    this.openlayerService.map.addLayer(this.trainVectorLayer);

    socket.addEventListener('open', (event) => {
      console.log('connection established');
    });

    socket.addEventListener('message', (event) => {
      // console.log('received: ' + event.data);
      this.socketMsg = this.extractMap(JSON.parse(event.data));
      //console.log(JSON.parse(event.data));

      this.trains = this.extractMessage(this.socketMsg);
      // console.log('trains: ', this.trains);

      this.draw(this.trains);
      this.selectService.selectTrack();
    });

    

 



  }
}
