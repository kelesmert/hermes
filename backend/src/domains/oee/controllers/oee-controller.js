const asyncHandler = require('../../../utils/async-handler');
const oeeRulesService = require('../services/oee-rules-service');
const oeeCalculatorService = require('../services/oee-calculator-service');

const getReasonCatalog = asyncHandler(async (_req, res) => {
  res.json(oeeRulesService.getReasonCatalog());
});

const getOeeStats = asyncHandler(async (req, res) => {
  const {
    machineId,
    mode,
    shiftDate,
    from,
    to,
    source,
  } = req.query || {};

  const stats = await oeeCalculatorService.calculateOeeForMachine({
    machineId,
    mode,
    shiftDate,
    from,
    to,
    source,
  });

  res.json(stats);
});

module.exports = {
  getReasonCatalog,
  getOeeStats,
};
