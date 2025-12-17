const http = require('http');
require('./models');
const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const startOeeProcessorJob = require('./jobs/oee-processor-job');
const startPlannedDowntimeSchedulerJob = require('./jobs/planned-downtime-scheduler-job');

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    startOeeProcessorJob();
    startPlannedDowntimeSchedulerJob();

    server.listen(config.port, () => {
      console.log(`MES API ${config.port} portunda çalışıyor (${config.env})`);
    });
  } catch (err) {
    console.error('Sunucu başlatılırken hata oluştu:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = server;
