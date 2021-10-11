import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FooterComponent extends Component {
  @service('openlayer') openlayerService;

  @action centerMap() {
    this.openlayerService.setCenter(this.openlayerService.center);
  }

  @action filterLocation() {
    //TODO: Filter-Location
  }

  @action bookmark() {
    //TODO: bookmark
  }

  @action search() {
    //TODO: serch
  }
}
