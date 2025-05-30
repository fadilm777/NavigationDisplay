import { map } from './src/map.js'
import { infoMiddleware, locationMiddleware } from './src/nav.js';


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

  var socket = new WebSocket("ws://127.0.0.1:8325")

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data)

    if (data.request.type === "location") {
      locationMiddleware(data.request.method, data.body)
    }

    if (data.request.type === "navInfo") {
      infoMiddleware(data.request.method, data.body)
    }
  });

})

