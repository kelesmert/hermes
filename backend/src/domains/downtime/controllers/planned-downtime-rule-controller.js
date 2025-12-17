const asyncHandler = require('../../../utils/async-handler');
const ruleService = require('../services/planned-downtime-rule-service');

const listRules = asyncHandler(async (req, res) => {
  const rules = await ruleService.listRules(req.query);
  res.json({ rules });
});

const createRule = asyncHandler(async (req, res) => {
  const rule = await ruleService.createRule(req.body, { userId: req.auth?.userId });
  res.status(201).json({ rule });
});

const updateRule = asyncHandler(async (req, res) => {
  const rule = await ruleService.updateRule(req.params.id, req.body);
  res.json({ rule });
});

const deleteRule = asyncHandler(async (req, res) => {
  await ruleService.deleteRule(req.params.id);
  res.status(204).send();
});

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
};

