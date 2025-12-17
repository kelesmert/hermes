const asyncHandler = require('../../../utils/async-handler');
const oeeRulesService = require('../services/oee-rules-service');

const getReasonCatalog = asyncHandler(async (_req, res) => {
  res.json(oeeRulesService.getReasonCatalog());
});

module.exports = {
  getReasonCatalog,
};

