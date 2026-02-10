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

  await client.connect();

  return { client };
}

module.exports = {
  connectBambu
};
