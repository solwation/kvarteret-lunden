// Architectural source: solwation/lunden-3d-apartment, c079371f6782225e29e9dac51518c509ed8c37e6.
// Adapted for the independent, impersonal Kvarteret Lunden walkthrough.
export const LIFT_PANEL = {
  pxPerM: 640, radius: 0.034, pitch: 0.15, firstY: 1.0, carPlateW: 0.17, carZ: 0.45, // the car's button column (east wall)
  callPlateW: 0.11, callPitch: 0.12, callY: 1.1,                                     // beside each landing door
  indW: 0.5, indCarY: 2.17, indLandingY: 2.2, digit: '#ff7a1a',                      // floor indicators (over the doors)
  mirrorInset: 0.2, mirrorBottom: 1.05, mirrorTop: 2.0,                              // back wall, above the handrail (y 0.95)
  pressMs: 220, darkPlate: 0.3,                                                      // pressed look; plates in a power cut
};

// Battery lighting level for the fixed stairwell fittings.
export const EMERGENCY_LIGHT = 0.1;
