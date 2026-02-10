const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load .env from project root explicitly to avoid surprises when run from other directories.
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseLightIds(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}

function getHueConfig({ requireAppKey = false, requireLightIds = false } = {}) {
  const bridgeIp = requireEnv("HUE_BRIDGE_IP");
  const appKey = process.env.HUE_APP_KEY || "";
  const lightIds = parseLightIds(process.env.HUE_LIGHT_IDS || "");

  if (requireAppKey && !appKey) {
    throw new Error("Missing required env var: HUE_APP_KEY");
  }
  if (requireLightIds && lightIds.length === 0) {
    throw new Error("Missing required env var: HUE_LIGHT_IDS");
  }

  return { bridgeIp, appKey, lightIds };
}

function getBambuConfig() {
  return {
    host: requireEnv("BAMBU_HOST"),
    printerSn: requireEnv("BAMBU_PRINTER_SN"),
    accessCode: requireEnv("BAMBU_ACCESS_CODE"),
    email: process.env.BAMBU_EMAIL || "",
    password: process.env.BAMBU_PASSWORD || "",
    region: process.env.BAMBU_REGION || ""
  };
}

module.exports = { getHueConfig, getBambuConfig };
