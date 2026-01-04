const asyncHandler = require('../../../utils/async-handler');
const AppError = require('../../../utils/app-error');
const aiInsightService = require('../services/ai-insight-service');
const oeeInsightService = require('../services/oee-insight-service');
const downtimeReasonService = require('../services/downtime-reason-service');
const openaiClient = require('../services/openai-client');

const getHealth = asyncHandler(async (req, res) => {
  const probe = String(req.query?.probe || '').toLowerCase() === 'true';
  const base = await openaiClient.healthCheck();

  if (!probe || !base.ok) {
    return res.json({
      ok: base.ok,
      model: base.model,
      probed: false,
    });
  }

  try {
    await openaiClient.requestResponse({
      input: 'ping',
      max_output_tokens: 5,
    });
    return res.json({
      ok: true,
      model: base.model,
      probed: true,
    });
  } catch (error) {
    return res.json({
      ok: false,
      model: base.model,
      probed: true,
      error: error?.message || 'OpenAI probe failed',
    });
  }
});

const listInsights = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const insights = await aiInsightService.listInsights({
    userId,
    useCase: req.query?.useCase,
    machineId: req.query?.machineId,
    downtimeId: req.query?.downtimeId,
    source: req.query?.source,
    limit: req.query?.limit,
  });
  res.json(insights || []);
});

const getLatestInsight = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const insight = await aiInsightService.getLatestInsight({
    userId,
    useCase: req.query?.useCase,
    machineId: req.query?.machineId,
    downtimeId: req.query?.downtimeId,
    source: req.query?.source,
    mode: req.query?.mode,
    shiftDate: req.query?.shiftDate,
    from: req.query?.from,
    to: req.query?.to,
    timezone: req.query?.timezone,
    checkStale: String(req.query?.checkStale || '').toLowerCase() === 'true' ||
      String(req.query?.checkStale || '') === '1',
  });
  res.json(insight || null);
});

const getInsightById = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const insight = await aiInsightService.getInsightById(req.params.id, userId);
  if (!insight) {
    throw new AppError('AI analizi bulunamadı.', 404);
  }
  res.json(insight);
});

const createOeeInsight = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const {
    machineId,
    source,
    mode,
    shiftDate,
    from,
    to,
    timezone,
    forceRefresh,
  } = req.body || {};

  const result = await oeeInsightService.generateOeeInsight({
    userId,
    machineId,
    source,
    mode,
    shiftDate,
    from,
    to,
    timezone,
    forceRefresh: Boolean(forceRefresh),
  });

  res.json(result);
});

const createDowntimeReason = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const { downtimeId, forceRefresh } = req.body || {};

  const result = await downtimeReasonService.generateDowntimeReasonInsight({
    userId,
    downtimeId,
    forceRefresh: Boolean(forceRefresh),
  });

  res.json(result);
});

const createAnomalyRisk = asyncHandler(async () => {
  throw new AppError('Bu endpoint henüz aktif değil.', 501);
});

module.exports = {
  getHealth,
  listInsights,
  getLatestInsight,
  getInsightById,
  createOeeInsight,
  createDowntimeReason,
  createAnomalyRisk,
};
