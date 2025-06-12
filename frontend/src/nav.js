import { map } from './map.js'
import { FrameRateService } from './services.js'

const navCircle = document.getElementById("navCircle")
let rateHandler = new FrameRateService(30)
const flapsIndicator = document.getElementById("flapsIndicator")

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
