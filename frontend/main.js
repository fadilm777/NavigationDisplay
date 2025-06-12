import { map } from './src/map.js'
import { infoMiddleware, locationMiddleware, flightPlanMiddleware } from './src/nav.js';


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

  // flight path joining waypoints
  map.addSource('flight-plan', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': []
      }
    }
  })

  map.addLayer({
    id: 'flight-plan',
    type: 'line',
    source: 'flight-plan',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FFFFFF',
      'line-width': 3
    }
  });

  // flight path joining plane and next waypoint
  map.addSource('flight-path', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': []
      }
    }
  })

  map.addLayer({
    id: 'flight-path',
    type: 'line',
    source: 'flight-path',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FF0000',
      'line-width': 3
    }
  });

  var socket = new WebSocket("ws://127.0.0.1:8325")

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data)

    if (data.request.type === "location") {
      locationMiddleware(data.request.method, data.body)
    }

    if (data.request.type === "navInfo") {
      infoMiddleware(data.request.method, data.body)
    }

    if (data.request.type === "flightPlan") {
      flightPlanMiddleware(data.request.method, data.body)
    }
  });

  const testing_dummy = {
    waypoints: [[-73.5818, 45.3654], [-74.2546, 45.2500]]
  }
  flightPlanMiddleware("PUT", testing_dummy)
})

