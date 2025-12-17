const { runSchedulerTick } = require('../domains/downtime/services/planned-downtime-scheduler-service');

let intervalRef = null;
let isRunning = false;

const startPlannedDowntimeSchedulerJob = () => {
  if (intervalRef) return;
  if (process.env.ENABLE_PLANNED_DOWNTIME_SCHEDULER !== 'true') {
    console.log('Planned downtime scheduler devre dışı (ENABLE_PLANNED_DOWNTIME_SCHEDULER=true ile açılır).');
    return;
  }

  const intervalMs = Math.max(Number(process.env.PLANNED_DOWNTIME_SCHEDULER_INTERVAL_MS) || 30000, 5000);

  const runJob = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await runSchedulerTick();
    } catch (error) {
      console.error('Planned downtime scheduler hata verdi:', error.message);
    } finally {
      isRunning = false;
    }
  };

  runJob();
  intervalRef = setInterval(runJob, intervalMs);
  console.log(`Planned downtime scheduler ${intervalMs}ms aralıkla çalışıyor.`);
};

module.exports = startPlannedDowntimeSchedulerJob;

