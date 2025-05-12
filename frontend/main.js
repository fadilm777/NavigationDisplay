import { map } from './src/map.js'
import { middleware } from './src/nav.js';


map.on('load', () => {

  map.addLayer({
    "id": "Waypoints",
    "type": "symbol",
    "source": "waypoints",
    "layout": {
      "visibility": "visible",
      "icon-image": "marker",
      "icon-size": 1,
      "text-field": ["get", "name"],
      "text-anchor": "top",
      "text-offset": [0, 1.2]
    },
    "paint": {
      "text-color": "#FFFFFF"
    }
  })

  map.jumpTo({
    center: [-73.742157, 45.464088]
  })
  var socket = new WebSocket("ws://127.0.0.1:8001")

  socket.addEventListener("message", (event) => {

    const data = JSON.parse(event.data)
    if (data.request.type == "location") {
      middleware(data.request.method, data.body)
    }
  });

})

