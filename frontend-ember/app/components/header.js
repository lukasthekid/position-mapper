import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MapComponent extends Component {
  @service('websocket') trainService;
  @service('openlayer') openlayerService;
  @service('settings') settingsService;
  @service('map-scaler') mapService;


  @action myFunction(e) {
    //console.log(e);
    document.getElementById('myDropdown').classList.toggle('show');
  }
  @action changeMap(e) {
    e.preventDefault();
    const config = this.getData(e);
    // console.log(config);

    document.getElementById('distortion-range').value = 0;
    //console.log(r.value);
    this.openlayerService.initMap(config);
    this.trainService.initTrain();
  }

  @action toggleVisibility(e) {
    this.settingsService.toggleVisibility();
  }

  getData(e) {
    const name = e.target.innerText;

    if (name === 'Rekawinkel') {
      return {
        dataString: 'scaled-rekawinkel',
        focusCenter: [16.03553295135498, 48.180566815673096],
        rotation: 0,
      };
    } else if (name === 'Stockerau') {
      return {
        dataString: 'scaled-stockerau',
        focusCenter: [16.216249465942383, 48.38310507394401],
        rotation: -0.21,
      };
    }
  }
}
