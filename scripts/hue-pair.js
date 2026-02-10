const { v3 } = require("node-hue-api");
const { getHueConfig } = require("../src/config");

async function pair() {
  const { bridgeIp } = getHueConfig();

  console.log("Press the link button on the Hue Bridge, then wait...");
  const unauthenticatedApi = await v3.api.createLocal(bridgeIp).connect();

  const appName = "bambu-hue-status";
  const deviceName = "node";

  const createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
  console.log("Pairing successful. Add this to .env as HUE_APP_KEY:");
  console.log(createdUser.username);
}

pair().catch((error) => {
  console.error("Pairing failed:", error.message);
  process.exit(1);
});
