const oeeDashboardService = require('../../oee/services/oee-dashboard-service');

const getBoardMetrics = async () => oeeDashboardService.getGlobalMetrics();

const getMachineTelemetrySummary = async (machineId, options) =>
  oeeDashboardService.getMachineTelemetrySummary(machineId, options);

const getMachineTelemetrySeries = async (machineId, options) =>
  oeeDashboardService.getMachineTelemetrySeries(machineId, options);

const getOperationsDashboard = async (options) =>
  oeeDashboardService.getOperationsDashboard(options);

module.exports = {
  getBoardMetrics,
  getMachineTelemetrySummary,
  getMachineTelemetrySeries,
  getOperationsDashboard,
  telemetryWindowMs: oeeDashboardService.telemetryWindowMs,
};
