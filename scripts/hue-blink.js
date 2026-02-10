const { v3 } = require("node-hue-api");
const { getHueConfig } = require("../src/config");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function blink() {
  const { bridgeIp, appKey, lightIds } = getHueConfig({
    requireAppKey: true,
    requireLightIds: true,
  });

  const api = await v3.api.createLocal(bridgeIp).connect(appKey);
  const stateOn = new v3.lightStates.LightState()
    .on()
    .rgb(255, 255, 255)
    .brightness(100);
  const stateOff = new v3.lightStates.LightState().off();

  console.log(`Blinking lights: ${lightIds.join(", ")}`);

  for (const id of lightIds) {
    try {
      await api.lights.setLightState(id, stateOn);
      await sleep(300);
      await api.lights.setLightState(id, stateOff);
      await sleep(300);
      await api.lights.setLightState(id, stateOn);
    } catch (error) {
      console.error(`Failed to blink light ${id}:`, error.message);
    }
  }
}

blink().catch((error) => {
  console.error("Blink failed:", error.message);
  process.exit(1);
});
