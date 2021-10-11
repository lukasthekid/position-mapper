import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SelectService extends Service {
  @service('train') trainInfoService;
  @service('track') trackService;
  @service('websocket') trainService;

  @tracked event;
  @tracked selectedTrack;

  @action selectStyleFunction(feature) {
    if (feature.getProperties('trainId').id) {
      // console.log(feature);
      return this.trainInfoService.trainSelectStyleFunction(feature, true);
    } else {
      //   console.log('trackSelectStyle');
      return this.trackService.trackSelectStyleFunction(feature, true);
    }
  }

  @action initSelect(map) {
    const select = new ol.interaction.Select({
      hitTolerance: 5,
      style: this.selectStyleFunction,
    });

    const selectedFeatures = select.getFeatures();

    map.addInteraction(select);

    selectedFeatures.on(['add'], (event) => {
      let railInfo;
      if (selectedFeatures.getLength() > 1) {
        selectedFeatures.removeAt(0);
      }
      this.trackService.popupTrackContent.clear();
      this.trainInfoService.popupTrainContent.clear();
      // console.log('EVENT_PROPERTIES', railInfo);
      if (event.element.getProperties().trainId) {
        this.event = event.element;
        const id = event.element.getProperties().trainId;
        fetch(`http://localhost:5000/radar/${id}`)
          .then((res) => res.json())
          .then((data) => {
            //console.log(data);
            this.trainInfoService.setTrain(data);
          })
          .catch((error) => {
            console.error('Error:' + error);
          });
        //this.trainInfoService.callTrainEndpoint(id);
        const trainPicture = 'Trains/' + id.substring(0, 4) + '-scaled.jpg';
        this.setImageOrPlaceholder(trainPicture);
        this.trainInfoService.sideBarIsVisible = true;
      } else {
        this.selectedTrack = event.element;

        railInfo = this.selectedTrack.getProperties();
        //this.displayTrackInfo(railInfo);

        const id = this.selectedTrack.j.fid;
        fetch(`http://localhost:5000/radar/track/rekawinkel/${id}`)
          .then((res) => res.json())
          .then((data) => {
            // console.log(data);
            this.selectedTrack.setProperties(data);
            railInfo = this.selectedTrack.getProperties();
            this.displayTrackInfo(railInfo);
          })
          .catch((error) => {
            console.error('Error:' + error);
          });
      }
    });

    selectedFeatures.on(['remove'], (event) => {
      this.event = null;
      this.resetTrackStyle();
      this.trackService.sideBarIsVisible = false;
      this.trainInfoService.sideBarIsVisible = false;
      this.selectedTrack = null;
    });
  }

  setImageOrPlaceholder(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send();
    request.onload = function () {
      if (request.status == 200) {
        //if(statusText == OK)
        document.getElementById(
          'train-side-card-picture'
        ).style.backgroundImage = "URL('" + url + "')";
      } else {
        document.getElementById(
          'train-side-card-picture'
        ).style.backgroundImage = "URL('Trains/Train scaled.png')";
      }
    };
  }

  displayTrackInfo(railInfo) {
    const namingTrack = {
      fid: 'fid',
      gleis: 'Gleis',
      type: 'Typ',
      name: 'Name',
      service: 'Service',
      maxspeed: 'Höchstgeschwindigkeit',
      'railway:track_class': 'track class',
      passenger_lines: 'passenger lines',
      electrified: 'electrified',
      'railway:bidirectional': 'bidirektional',
      'railway:track_type': 'track type',
      frequency: 'Frequenz',
      voltage: 'Stromspannung',
      'railway:track_ref': 'track ref',
    };

    for (var prop in railInfo) {
      if (railInfo[prop] !== null) {
        const propname = namingTrack[prop];
        if (propname) {
          this.trackService.popupTrackContent.pushObject({
            key: propname + ': ',
            value: railInfo[prop],
          });
        }
      }
    }
    this.trackService.sideBarIsVisible = true;
  }

  resetTrackStyle() {
    this.trackService.vectorSource.forEachFeature((f) => {
      const style = this.trackService.trackStyleFunction(f);
      f.setStyle(style);
    });
  }

  //getTrackOf Selected Train
  selectTrack() {
    try {
      //reset old selections if exists
      if (this.event) {
        this.resetTrackStyle();
      }

      //get actual track_id
      const currentTrains = this.trainService.trains.map((t) => t.track_id);
      const currentTrackId_ofSelectedTrain = this.event.j.trackID;

      //check if track_id is from an accurate feature (not outside the simulation area)
      if (currentTrains.includes(currentTrackId_ofSelectedTrain)) {
        //console.log(currentTrackId_ofSelectedTrain);
        const feature = this.trackService.vectorSource
          .getFeatures()
          .filter((f) => f.j.fid === currentTrackId_ofSelectedTrain)[0];

        //setTheSelected Track Style
        const selectedStyle =
          this.trackService.trackSelectStyleFunction(feature);
        feature.setStyle(selectedStyle);
      } else {
        //set the event null
        this.event = null;
      }
    } catch (e) {
      //console.log("nothing selected");
    }
  }
}
