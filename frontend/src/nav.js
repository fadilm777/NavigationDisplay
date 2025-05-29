import { map } from './map.js'
import { FrameRateService } from './services.js'

const navCircle = document.getElementById("navCircle")
let rateHandler = new FrameRateService(30)
const flapsIndicator = document.getElementById("flapsIndicator")

const navItems = ["GS", "DTK", "TRK", "N1", "N2", "EGT", "DIFF PSI", "ALT FT", "OIL PSI", "OIL C", "FLAPS"]
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

function updateNavInfo(data) {
  for (let i = 0; i < navItems.length; i++) {
    const navItemName = navItems[i]

    const navItem = document.getElementById(`${navItemName}value`)
    navItem.textContent = `${data[navItemName]}`

    const navItemRating = document.getElementById(`${navItemName}rating`)
    if (navItemRating) {
      const rating = (data[navItemName] / maxRatings[navItemName] * 100) - 90
      navItemRating.style.transform = `rotate(${rating}deg)`
    }

    const navItemBarRating = document.getElementById(`${navItemName}barRating`)
    if (navItemBarRating) {
      const barRating = (data[navItemName] / maxRatings[navItemName] * 100) - 50
      navItemBarRating.style.left = `${barRating}%`
    }
  }

  updateFlapsRating(data["FLAPS"])
}
