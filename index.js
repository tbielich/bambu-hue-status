const { getHueConfig, getBambuConfig } = require("./src/config");
const { createHueApi, setLightsColor } = require("./src/hue");
const { connectBambu } = require("./src/bambu");

async function main() {
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.map((arg) => (typeof arg === "string" ? arg : "")).join(" ");
    if (
      message.startsWith("******** NEW JOB") ||
      message.startsWith("Previous job data:") ||
      message.startsWith("Updated job data:") ||
      message.startsWith("Update package:") ||
      message.startsWith("Emitted job:update event")
    ) {
      return;
    }
    originalLog(...args);
  };

  const hueConfig = getHueConfig({ requireAppKey: true, requireLightIds: true });
  const bambuConfig = getBambuConfig();

  const hueApi = await createHueApi(hueConfig);

  let lastAction = "";
  let connected = false;
  let lastPercent = null;

  const setColor = async (key, label, rgb) => {
    if (lastAction === key) return;
    lastAction = key;
    console.log(label);
    await setLightsColor(hueApi, hueConfig.lightIds, rgb, 100);
  };

  const setYellow = () =>
    setColor("yellow", "🟡 Print started. Setting Hue lights to yellow.", [255, 255, 0]);
  const setBlue = () =>
    setColor("blue", "🔵 Print running. Setting Hue lights to blue.", [0, 120, 255]);
  const setRed = () =>
    setColor("red", "🔴 Error state detected. Setting Hue lights to red.", [255, 0, 0]);
  const setPurple = () =>
    setColor("purple", "🟣 Print paused/idle. Setting Hue lights to purple.", [180, 0, 255]);
  const setGreen = () =>
    setColor("green", "🟢 Print finished successfully. Setting Hue lights to green.", [0, 255, 0]);

  const logRunningProgress = (percent) => {
    if (!Number.isFinite(percent)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    if (lastPercent === clamped) return;
    lastPercent = clamped;
    console.log(`🔵 Print running. ${clamped}%`);
  };

  await connectBambu({
    host: bambuConfig.host,
    accessCode: bambuConfig.accessCode,
    printerSn: bambuConfig.printerSn,
    onJobStart: async () => {
      await setYellow();
    },
    onJobUpdate: async (job) => {
      const rawStatus = job?.data?.status || job?.status || "";
      const percent =
        job?.data?.percentDone ??
        job?.data?.mc_percent ??
        job?.percentDone ??
        job?.mc_percent;
      const percentNum = Number(percent);
      const status = String(rawStatus).toUpperCase();
      if (status === "RUNNING" || status === "PRINTING") {
        await setBlue();
        logRunningProgress(percentNum);
      } else if (status === "PAUSE" || status === "PAUSED" || status === "IDLE") {
        await setPurple();
      } else if (status === "FAILED") {
        await setRed();
      }
    },
    onJobFinish: async (_job, outcome) => {
      if (outcome === "SUCCESS") {
        await setGreen();
      } else {
        console.log(`Print finished with outcome: ${outcome}`);
        await setRed();
      }
    },
    onStatus: ({ oldStatus, newStatus }) => {
      if (!connected) return;
      if (oldStatus !== newStatus) {
        const status = String(newStatus || "").toUpperCase();
        if (status === "RUNNING" || status === "PRINTING") {
          void setBlue();
        } else if (status === "PAUSE" || status === "PAUSED" || status === "IDLE") {
          void setPurple();
        } else if (status === "FAILED") {
          void setRed();
        }
      }
    }
  });

  // Mark as connected after the client is up to avoid noisy initial status transitions.
  connected = true;

  console.log("Listening for Bambu Lab print status updates...");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
