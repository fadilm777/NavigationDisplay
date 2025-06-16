import { map } from './map.js'
import { FrameRateService } from './services.js'

const navCircle = document.getElementById("navCircle")
let rateHandler = new FrameRateService(30)
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
    updateFlightPlan(data)
  }
}

function updateNavCircle(bearing) {
  navCircle.style.transform = `translate(-50%, -50%) rotate(${-bearing}deg)`;
}

function updateFlapsRating(rating) {
  flapsIndicator.style.top = `${(rating * 4)}px`
}

function updateLocation(latitude, longitude, bearing) {
  const now = Date.now();
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

function updateFlightPlan(data) {
  waypoints = data.waypoints
  const flightPlan = map.getSource('flight-plan')

  if (flightPlan) {
    flightPlan.setData({
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': data.waypoints
      }
    })
  }
}

function updateFlightPath(location) {
  if (isWithin1Km(location[1], location[0], waypoints[0][1], waypoints[0][0])) {
    waypoints.shift()
  }

  const flightPath = map.getSource('flight-path')

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

function toRad(value) {
  return value * Math.PI / 180;
}
