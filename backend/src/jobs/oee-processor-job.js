const { pollIntervalMs, processTelemetryBatch } = require('../domains/oee/services/oee-processor');

let intervalRef = null;

const startOeeProcessorJob = () => {
  if (intervalRef) return;

  const runJob = async () => {
    try {
      await processTelemetryBatch();
    } catch (error) {
      console.error('OEE telemetry job hata verdi:', error.message);
    }
  };

  runJob();
  intervalRef = setInterval(runJob, pollIntervalMs);
  console.log(`OEE telemetry job ${pollIntervalMs}ms aralıkla çalışıyor.`);
};

module.exports = startOeeProcessorJob;
