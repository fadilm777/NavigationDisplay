import { map } from './map.js'

class FrameRateHandler {
  constructor(frameRate) {
    this.lastUpdate = 0;
    this.throttleMs = frameRate;
  }

  setThrottleMs(throttle) {
    this.throttleMs = throttle
  }

  getThrottleMs() {
    return this.throttleMs
  }

  getLastupdate() {
    return this.lastUpdate
  }

  setLastUpdate(update) {
    this.lastUpdate = update
  }
}

let rateHandler = new FrameRateHandler(33)

export function middleware(method, data) {
  if (method === "PUT") {
    updateLocation(data.latitude, data.longitude)
  }
}

function updateLocation(latitude, longitude) {
  const now = Date.now();
  if (now - rateHandler.getLastupdate() > rateHandler.getThrottleMs()) {
    map.easeTo({
      center: [longitude, latitude],
      duration: 0
    });
    rateHandler.setLastUpdate(now)
  }
}

