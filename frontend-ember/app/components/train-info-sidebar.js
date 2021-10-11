import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TrainInfoSidebarComponent extends Component {
  @service('train') trainInfoService;
}
