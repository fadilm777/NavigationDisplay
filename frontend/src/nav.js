import { map } from './map.js'
import { FrameRateService } from './services.js'

const navCircle = document.getElementById("navCircle")
let rateHandler = new FrameRateService(30) // Restrict position updates to 30 FPS
const flapsIndicator = document.getElementById("flapsIndicator")
let waypoints = []

const navItems = ["GS", "DTK", "TRK", "N1", "N2", "EGT", "DIFF PSI", "ALT FT", "OIL PSI", "OIL C", "FLAPS", "AMPS1", "AMPS2", "VOLTS1", "VOLTS2"]
const maxRatings = {
  "N1": 100,
  "N2": 100,
  "EGT": 1450,
  "DIFF PSI": 6,
  "ALT FT": 13000,
  "OIL PSI": 115,
  "OIL C": 245,
  "FLAPS": 35
}

export function locationMiddleware(method, data) {
  if (method === "PUT") {
    updateLocation(data.latitude, data.longitude, data.heading)
  }
}

export function infoMiddleware(method, data) {
  if (method === "PUT") {
    updateNavInfo(data)
  }
}

export function flightPlanMiddleware(method, data) {
  if (method === "PUT") {
    waypoints = data.waypoints
    updateFlightPlan()
  }
}

function updateNavCircle(bearing) {
  // Rotate nav circle on map
  navCircle.style.transform = `translate(-50%, -50%) rotate(${-bearing}deg)`;
}

function updateFlapsRating(rating) {
  flapsIndicator.style.top = `${(rating * 4)}px`
}

function updateLocation(latitude, longitude, bearing) {
  // Store current time for framerate service
  const now = Date.now();
  // Update location with framerate restriction
  if (now - rateHandler.getLastupdate() > rateHandler.getThrottleMs()) {
    map.easeTo({
      center: [longitude, latitude],
      duration: 0,
      bearing: bearing
    });

    updateNavCircle(bearing)
    updateFlightPath([longitude, latitude])

    rateHandler.setLastUpdate(now)
  }
}

function updateRating(navItemName, value) {
  const navItemRating = document.getElementById(`${navItemName}rating`)
  if (navItemRating) {
    const rating = (value / maxRatings[navItemName] * 100) - 90
    navItemRating.style.transform = `rotate(${rating}deg)`
  }

  const navItemBarRating = document.getElementById(`${navItemName}barRating`)
  if (navItemBarRating) {
    const barRating = (value / maxRatings[navItemName] * 100) - 50
    navItemBarRating.style.left = `${barRating}%`
  }

  if (navItemName === "FLAPS") {
    updateFlapsRating(value)
  }
}

function updateNavInfo(data) {
  for (let i = 0; i < navItems.length; i++) {
    const navItemName = navItems[i]

    const navItem = document.getElementById(`${navItemName}value`)
    if (navItem) {
      navItem.textContent = `${data[navItemName]}`
    }

    updateRating(navItemName, data[navItemName])
  }

}

function updateFlightPlan() {
  const flightPlan = map.getSource('flight-plan')

  if (flightPlan) {
    flightPlan.setData({
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': waypoints
      }
    })
  }
}

function updateFlightPath(location) {
  // Shift to next waypoint if current waypoint target is within 1Km
  if (isWithin1Km(location[1], location[0], waypoints[0][1], waypoints[0][0])) {
    waypoints.shift()
    updateFlightPlan()
  }

  const flightPath = map.getSource('flight-path')

  // Update flight path with respect to current location
  if (flightPath && waypoints.length != 0) {
    flightPath.setData({
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [location, waypoints[0]]
      }
    })
  }
}

// Verify if two geolocations are within 1Km
function isWithin1Km(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance <= 1;
}

// Convert degrees to radians
function toRad(value) {
  return value * Math.PI / 180;
}
