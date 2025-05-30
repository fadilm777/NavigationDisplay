import { map } from './map.js'
import { FrameRateService } from './services.js' 

const plane = document.getElementById("plane");
let rateHandler = new FrameRateService(30)

export function middleware(method, data) {
  if (method === "PUT") {
    updateLocation(data.latitude, data.longitude, data.bearing)
  }
}

function updateBearing(bearing) {
	plane.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`; 
}

function updateLocation(latitude, longitude, bearing) {
  const now = Date.now();
  if (now - rateHandler.getLastupdate() > rateHandler.getThrottleMs()) {
    map.easeTo({
      center: [longitude, latitude],
      duration: 0
    });

    updateBearing(bearing)

    rateHandler.setLastUpdate(now)
  }
}

