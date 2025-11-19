const oeeDashboardService = require('../../oee/services/oee-dashboard-service');

const getBoardMetrics = async () => oeeDashboardService.getGlobalMetrics();

const getMachineTelemetrySummary = async (machineId) =>
  oeeDashboardService.getMachineTelemetrySummary(machineId);

const getMachineTelemetrySeries = async (machineId, options) =>
  oeeDashboardService.getMachineTelemetrySeries(machineId, options);

const getMachineTelemetryTrend = async (machineId, options) =>
  oeeDashboardService.getMachineTelemetryTrend(machineId, options);

module.exports = {
  getBoardMetrics,
  getMachineTelemetrySummary,
  getMachineTelemetrySeries,
  getMachineTelemetryTrend,
  telemetryWindowMs: oeeDashboardService.telemetryWindowMs,
};
