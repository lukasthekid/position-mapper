import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const BASE_URL = '';

export default class TrainPositionComponent extends Component {
  @service('websocket') wsService;

  @tracked trains = this.wsService.getTrains();

  @action initTrain() {
    this.wsService.initTrain();
  }
}
