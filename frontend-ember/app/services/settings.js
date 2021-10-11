import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SettingsService extends Service {
  @tracked sideBarIsVisible = false;

  @action toggleVisibility() {
    this.sideBarIsVisible = !this.sideBarIsVisible;
  }
}
