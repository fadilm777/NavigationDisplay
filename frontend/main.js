import { map } from './src/map.js'
import { infoMiddleware, locationMiddleware, flightPlanMiddleware } from './src/nav.js';

// Function to run after map is done rendering
map.on('load', () => {
  // Error message to assert addition of api link from maptiler
  const maptilerSource = map.getSource('maptiler_planet')
  if (!maptilerSource.url) {
    document.body.innerHTML = "<h1>ADD API LINK FROM MAPTILER (follow instructions on github readme)</h1>"
  }

  // Add waypoints layer to map style
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

  // Add flight path joining waypoints
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

  // Add flight plan layer to map style
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
      'line-width': 2
    }
  });

  // Add flight path joining plane icon and next waypoint
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
      'line-width': 2
    }
  });

  // Connect to backend websocket server
  var socket = new WebSocket("ws://127.0.0.1:8325")

  // Runs everytime a message is received from backend
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

  // Example addition of flight-plan
  // const test_dummy = {
  //   waypoints: [[-73.5818, 45.3654]]
  // }
  // flightPlanMiddleware("PUT", test_dummy)
})
