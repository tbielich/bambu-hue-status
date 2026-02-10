const { v3 } = require("node-hue-api");
const { getHueConfig } = require("../src/config");

async function listLights() {
  const { bridgeIp, appKey } = getHueConfig({ requireAppKey: true });

  const api = await v3.api.createLocal(bridgeIp).connect(appKey);
  const lights = await api.lights.getAll();

  if (!lights.length) {
    console.log("No Hue lights found.");
    return;
  }

  console.log("Hue lights:");
  for (const light of lights) {
    console.log(`- ID ${light.id}: ${light.name}`);
  }
}

listLights().catch((error) => {
  console.error("Failed to list lights:", error.message);
  process.exit(1);
});
