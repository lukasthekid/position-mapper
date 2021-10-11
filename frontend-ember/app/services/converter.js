import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
// import fs from 'fs';
// import path from 'path';

export default class ConverterService extends Service {
  @service('map-scaler') scaleService;

  calculatePosition(relative_position, track_id) {
    //check for empty position object

    if (relative_position) {
      // console.log(JSON.stringify(relative_position) + ' on track:' + track_id);
      //relative_position = JSON.parse(relative_position)
      const data = this.scaleService.getMap();

      try {
        const s_node = relative_position.node_index;
        const e_node = relative_position.next_node_index;
        const factor = relative_position.factor;

        const track = data.features.filter(
          (i) => i.properties.fid === track_id
        )[0];
        const startPoint = track.geometry.coordinates[s_node];
        const endPoint = track.geometry.coordinates[e_node];

        if (factor === 0) {
          return startPoint;
        }

        const y_delta = (endPoint[0] - startPoint[0]) * factor;
        const x_delta = (endPoint[1] - startPoint[1]) * factor;
        return [startPoint[0] + y_delta, startPoint[1] + x_delta];
      } catch (e) {
        console.error('no coordinates found to track' + e.message);
      }
    }
  }
}
