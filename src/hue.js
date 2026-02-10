const { v3 } = require("node-hue-api");

async function createHueApi({ bridgeIp, appKey }) {
  if (!bridgeIp) {
    throw new Error("HUE_BRIDGE_IP is required.");
  }
  if (!appKey) {
    throw new Error("HUE_APP_KEY is required. Run `npm run hue:pair` first.");
  }

  const api = await v3.api.createLocal(bridgeIp).connect(appKey);
  return api;
}

function createLightState() {
  return new v3.lightStates.LightState();
}

async function setLightsColor(api, lightIds, rgb, brightness = 100) {
  if (!Array.isArray(lightIds) || lightIds.length === 0) {
    throw new Error("No Hue light IDs provided. Set HUE_LIGHT_IDS in .env.");
  }

  const state = createLightState().on().rgb(rgb[0], rgb[1], rgb[2]).brightness(brightness);
  const results = [];

  for (const id of lightIds) {
    try {
      const result = await api.lights.setLightState(id, state);
      results.push({ id, result });
    } catch (error) {
      results.push({ id, error });
    }
  }

  return results;
}

module.exports = {
  createHueApi,
  setLightsColor
};
