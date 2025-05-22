import { map } from './map.js'
import { FrameRateService } from './services.js'

const navCircle = document.getElementById("navCircle")
let rateHandler = new FrameRateService(30)

export function locationMiddleware(method, data) {
  if (method === "PUT") {
    updateLocation(data.latitude, data.longitude, data.bearing)
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

function updateGS(GS) {
  const GSvalue = document.getElementById("GSvalue")
  GSvalue.textContent = `${GS}`
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
  updateGS(data.GS)
}
