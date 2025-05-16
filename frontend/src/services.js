
export class FrameRateService {
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
