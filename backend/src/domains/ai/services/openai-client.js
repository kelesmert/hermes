const OpenAI = require('openai');
const AppError = require('../../../utils/app-error');

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_RETRIES = 3;
const DEFAULT_MODEL = 'gpt-4o-mini';

const getConfig = () => {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  return { apiKey, model, timeoutMs };
};

const createClient = () => {
  const { apiKey, timeoutMs } = getConfig();
  if (!apiKey) {
    throw new AppError('OpenAI API key tanimli degil.', 500);
  }
  return new OpenAI({ apiKey, timeout: timeoutMs });
};

const parseRetryAfterMs = (error) => {
  const retryAfter =
    error?.headers?.['retry-after'] ||
    error?.response?.headers?.['retry-after'] ||
    error?.response?.headers?.get?.('retry-after');
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const parsedDate = new Date(retryAfter);
  if (!Number.isNaN(parsedDate.getTime())) {
    const diff = parsedDate.getTime() - Date.now();
    return diff > 0 ? diff : null;
  }
  return null;
};

const shouldRetry = (error) => {
  const status = error?.status || error?.response?.status;
  if (!status) return false;
  if (status === 429) return true;
  return status >= 500 && status < 600;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (operation, { maxRetries } = {}) => {
  const retries = Number(maxRetries ?? DEFAULT_RETRIES);
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }
      const retryAfterMs = parseRetryAfterMs(error);
      const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 4000);
      await sleep(retryAfterMs ?? backoffMs);
    }
  }
};

const requestResponse = async (payload, options = {}) => {
  const client = createClient();
  const { model } = getConfig();
  const requestPayload = {
    model,
    ...payload,
  };
  return withRetry(() => client.responses.create(requestPayload), {
    maxRetries: options.maxRetries,
  });
};

const healthCheck = async () => {
  const { apiKey, model } = getConfig();
  if (!apiKey) {
    return { ok: false, reason: 'missing_api_key', model };
  }
  return { ok: true, model };
};

module.exports = {
  requestResponse,
  healthCheck,
  getConfig,
};
