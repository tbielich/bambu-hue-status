const { BambuClient } = require("@hiv3d/bambu-node");

async function connectBambu({ host, accessCode, printerSn, onJobStart, onJobFinish, onStatus }) {
  if (!host) {
    throw new Error("BAMBU_HOST is required. This library connects locally to the printer.");
  }
  if (!accessCode) {
    throw new Error("BAMBU_ACCESS_CODE is required.");
  }
  if (!printerSn) {
    throw new Error("BAMBU_PRINTER_SN is required.");
  }

  const client = new BambuClient({
    host,
    accessToken: accessCode,
    serialNumber: printerSn
  });

  client.on("client:connect", () => {
    console.log("Bambu client connected.");
  });

  client.on("client:disconnect", () => {
    console.log("Bambu client disconnected.");
  });

  client.on("error", (error) => {
    const message = error?.message || String(error);
    console.error("Bambu client error:", message);
  });

  if (typeof onStatus === "function") {
    client.on("printer:statusUpdate", (oldStatus, newStatus) => {
      onStatus({ oldStatus, newStatus });
    });
  }

  if (typeof onJobStart === "function") {
    client.on("job:start", (job) => {
      onJobStart(job);
    });
  }

  if (typeof onJobFinish === "function") {
    client.on("job:finish", (job, outcome) => {
      onJobFinish(job, outcome);
    });
  }

  try {
    await client.connect();
  } catch (error) {
    const message = error?.message || String(error);
    throw new Error(`Failed to connect to Bambu printer: ${message}`);
  }

  return { client };
}

module.exports = {
  connectBambu
};
