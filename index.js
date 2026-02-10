const { getHueConfig, getBambuConfig } = require("./src/config");
const { createHueApi, setLightsColor } = require("./src/hue");
const { connectBambu } = require("./src/bambu");

async function main() {
  const hueConfig = getHueConfig({ requireAppKey: true, requireLightIds: true });
  const bambuConfig = getBambuConfig();

  if (bambuConfig.email || bambuConfig.password || bambuConfig.region) {
    console.log(
      "Note: @hiv3d/bambu-node connects locally and does not use BAMBU_EMAIL/BAMBU_PASSWORD/BAMBU_REGION."
    );
  }

  const hueApi = await createHueApi(hueConfig);

  let lastAction = "";

  const setRed = async () => {
    if (lastAction === "red") return;
    lastAction = "red";
    console.log("Print started. Setting Hue lights to red.");
    await setLightsColor(hueApi, hueConfig.lightIds, [255, 0, 0], 100);
  };

  const setGreen = async () => {
    if (lastAction === "green") return;
    lastAction = "green";
    console.log("Print finished successfully. Setting Hue lights to green.");
    await setLightsColor(hueApi, hueConfig.lightIds, [0, 255, 0], 100);
  };

  await connectBambu({
    host: bambuConfig.host,
    accessCode: bambuConfig.accessCode,
    printerSn: bambuConfig.printerSn,
    onJobStart: async () => {
      await setRed();
    },
    onJobFinish: async (_job, outcome) => {
      if (outcome === "SUCCESS") {
        await setGreen();
      } else {
        console.log(`Print finished with outcome: ${outcome}`);
      }
    },
    onStatus: ({ oldStatus, newStatus }) => {
      if (oldStatus !== newStatus) {
        console.log(`Printer status changed: ${oldStatus} -> ${newStatus}`);
      }
    }
  });

  console.log("Listening for Bambu Lab print status updates...");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
