const fs = require('fs');
const path = require('path');

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/scaled-tracks.json'))
);

const calculatePosition = (s_node, factor, e_node, track_id) => {
  try {
    const track = data.features.filter((i) => i.properties.fid === track_id)[0];
    const startPoint = track.geometry.coordinates[s_node];
    const endPoint = track.geometry.coordinates[e_node];
    const y_delta = (endPoint[0] - startPoint[0]) * factor;
    const x_delta = (endPoint[1] - startPoint[1]) * factor;
    return [startPoint[0] + y_delta, startPoint[1] + x_delta];
  } catch (e) {
    console.error('no coordinatedfound to track' + e.message);
  }
};

module.exports = { calculatePosition };
