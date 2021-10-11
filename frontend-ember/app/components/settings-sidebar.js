import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SettingsSidebarComponent extends Component {
  @service('settings') settingsService;
  @service('openlayer') openlayerService;
  @service('websocket') trainService;
  @service('map-scaler') scaleService;
  @service('track') trackService;

  @tracked sliderValue;

  @action setIntervall(e) {
    const intervall = parseInt(e.target.value);
    // console.log(e);
    this.trainService.changeIntervall(intervall);
    const label = e.target.previousElementSibling;
    // console.log(label.innerHTML);
    // label.innerHTML = 'Intervall [s]: ' + sliderValue;
  }

  @action inputChange(e) {
    this.sliderValue = e.target.value;
  }

  @action initInputChange(e) {
    this.sliderValue = e.value;
  }

  @action scaleMap(e) {
    const factor = parseInt(e.target.value);
    this.scaleService.scaleMap(factor, this.trackService.station);
  }
}
