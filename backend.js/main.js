const pos = document.getElementById('pos')
        const socket = new WebSocket("ws://localhost:5000/radar/ws");

        socket.addEventListener('open', (event)=>{
            console.log("connection established");
        })

        socket.addEventListener('message', (event) =>{
            console.log('received: ' + event.data);
            pos.innerHTML = event.data;

        })

        const sendmsg = (val) =>{
            socket.send(val)
        }

        const pointFeature = new ol.Feature({
            geometry: new ol.geom.Point([16.035373526273947, 48.17977240136297]),
            name: 'Null Island',
            population: 4000,
            rainfall: 500,

        });
        const vectorsource = new ol.source.Vector({
            features: [pointFeature],
        })
        const vectorLayer= new ol.layer.Vector({
            source: vectorsource,
        })

        var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
            vectorLayer
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([16.035373526273947, 48.17977240136297]),
          zoom: 18
        })
      });