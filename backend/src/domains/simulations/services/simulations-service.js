const { spawn } = require('child_process');
const path = require('path');
const config = require('../../../config');
const AppError = require('../../../utils/app-error');

const MAX_LOG_LINES = Math.max(200, Number(process.env.SIMULATION_LOG_MAX_LINES) || 2000);
const STOP_TIMEOUT_MS = Math.max(1000, Number(process.env.SIMULATION_STOP_TIMEOUT_MS) || 8000);

const normalizeBoolean = (value) => String(value || '').toLowerCase() === 'true';

const isControlEnabled =
  config.env !== 'production' || normalizeBoolean(process.env.ENABLE_SIMULATION_CONTROL);

const BACKEND_ROOT = process.cwd();
const NODE_BIN = process.execPath;

const SIMULATION_DEFS = {
  'data-gen': {
    name: 'data-gen',
    label: 'Telemetry (data-gen)',
    description:
      'Makine telemetry/sinyal üretir ve düzenli aralıklarla veritabanına yazar (npm run data:gen).',
    command: NODE_BIN,
    args: ['scripts/data-gen.js'],
    cwd: BACKEND_ROOT,
  },
  'shift-sim': {
    name: 'shift-sim',
    label: 'Vardiya Telemetry (shift-sim)',
    description:
      '07:00–18:00 vardiyası için hızlandırılmış deterministik telemetry üretir (npm run shift:sim). data-gen ile aynı anda çalıştırılmaz.',
    command: NODE_BIN,
    args: ['scripts/shift-simulator.js'],
    cwd: BACKEND_ROOT,
  },
  'job-sim': {
    name: 'job-sim',
    label: 'Üretim (job-sim)',
    description:
      'Aktif iş emirleri için telemetry sinyaline bağlı good/defect üretim event’i üretir (npm run job:sim).',
    command: NODE_BIN,
    args: ['scripts/job-simulator.js'],
    cwd: BACKEND_ROOT,
    dependsOn: ['shift-sim'],
  },
};

const createInitialState = (definition) => ({
  ...definition,
  running: false,
  pid: null,
  startedAt: null,
  stoppedAt: null,
  lastExitCode: null,
  lastExitSignal: null,
  lastError: null,
  startedBy: null,
  stoppedBy: null,
  process: null,
  logs: [],
  nextLogId: 1,
  stdoutRemainder: '',
  stderrRemainder: '',
});

const states = new Map(Object.values(SIMULATION_DEFS).map((def) => [def.name, createInitialState(def)]));

const pushLog = (state, entry) => {
  state.logs.push({
    id: state.nextLogId++,
    ts: new Date().toISOString(),
    ...entry,
  });
  if (state.logs.length > MAX_LOG_LINES) {
    state.logs.splice(0, state.logs.length - MAX_LOG_LINES);
  }
};

const flushRemainder = (state, stream) => {
  const key = stream === 'stdout' ? 'stdoutRemainder' : 'stderrRemainder';
  const line = state[key];
  if (line) {
    pushLog(state, { stream, message: line });
    state[key] = '';
  }
};

const appendChunk = (state, stream, chunk) => {
  const key = stream === 'stdout' ? 'stdoutRemainder' : 'stderrRemainder';
  const text = chunk.toString('utf8');
  const combined = `${state[key]}${text}`;
  const lines = combined.split(/\r?\n/);
  state[key] = lines.pop() || '';
  lines.forEach((line) => {
    if (line.length === 0) return;
    pushLog(state, { stream, message: line });
  });
};

const requireEnabled = () => {
  if (!isControlEnabled) {
    throw new AppError(
      'Simülasyon kontrolü kapalı. ENABLE_SIMULATION_CONTROL=true ile açabilirsiniz.',
      403,
    );
  }
};

const getState = (name) => {
  const state = states.get(name);
  if (!state) {
    throw new AppError('Simülasyon bulunamadı.', 404);
  }
  return state;
};

const waitForExit = (childProcess, timeoutMs) =>
  new Promise((resolve) => {
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = setTimeout(() => done({ exited: false }), timeoutMs);

    childProcess.once('exit', (code, signal) => {
      clearTimeout(timer);
      done({ exited: true, code, signal });
    });
  });

const listSimulations = () => ({
  enabled: isControlEnabled,
  items: Array.from(states.values()).map((state) => ({
    name: state.name,
    label: state.label,
    description: state.description,
    dependsOn: state.dependsOn || [],
    running: state.running,
    pid: state.pid,
    startedAt: state.startedAt,
    stoppedAt: state.stoppedAt,
    lastExitCode: state.lastExitCode,
    lastExitSignal: state.lastExitSignal,
    lastError: state.lastError,
    startedBy: state.startedBy,
    stoppedBy: state.stoppedBy,
    logCursor: state.logs.at(-1)?.id || 0,
    logLines: state.logs.length,
  })),
});

const startSimulation = async (name, { requestedBy } = {}) => {
  requireEnabled();
  const state = getState(name);

  if (state.running || state.process) {
    throw new AppError('Simülasyon zaten çalışıyor.', 409);
  }

  if (name === 'shift-sim' && states.get('data-gen')?.running) {
    throw new AppError('shift-sim başlatılamaz: data-gen çalışıyor. Önce data-gen durdurun.', 409);
  }
  if (name === 'data-gen' && states.get('shift-sim')?.running) {
    throw new AppError('data-gen başlatılamaz: shift-sim çalışıyor. Önce shift-sim durdurun.', 409);
  }

  const cwd = state.cwd || BACKEND_ROOT;
  const resolvedArgs = (state.args || []).map((arg) =>
    arg.startsWith('scripts/') ? path.resolve(cwd, arg) : arg,
  );
  const child = spawn(state.command, resolvedArgs, {
    cwd,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  state.process = child;
  state.running = true;
  state.pid = child.pid || null;
  state.startedAt = new Date().toISOString();
  state.stoppedAt = null;
  state.lastExitCode = null;
  state.lastExitSignal = null;
  state.lastError = null;
  state.startedBy = requestedBy || null;
  state.stoppedBy = null;

  pushLog(state, {
    stream: 'system',
    message: `--- START (${state.name}) ${state.startedAt}${requestedBy?.username ? ` by ${requestedBy.username}` : ''} ---`,
  });

  child.stdout?.on('data', (chunk) => appendChunk(state, 'stdout', chunk));
  child.stderr?.on('data', (chunk) => appendChunk(state, 'stderr', chunk));

  child.on('error', (err) => {
    state.lastError = err?.message || 'Process error';
    pushLog(state, { stream: 'system', message: `[error] ${state.lastError}` });

    if (!child.pid) {
      flushRemainder(state, 'stdout');
      flushRemainder(state, 'stderr');
      state.running = false;
      state.process = null;
      state.pid = null;
      state.stoppedAt = new Date().toISOString();
      pushLog(state, {
        stream: 'system',
        message: `--- EXIT (${state.name}) spawn-error at ${state.stoppedAt} ---`,
      });
    }
  });

  child.on('exit', (code, signal) => {
    flushRemainder(state, 'stdout');
    flushRemainder(state, 'stderr');

    state.running = false;
    state.process = null;
    state.pid = null;
    state.stoppedAt = new Date().toISOString();
    state.lastExitCode = typeof code === 'number' ? code : null;
    state.lastExitSignal = signal || null;

    pushLog(state, {
      stream: 'system',
      message: `--- EXIT (${state.name}) code=${state.lastExitCode ?? '-'} signal=${state.lastExitSignal ?? '-'} at ${state.stoppedAt} ---`,
    });
  });

  return { ok: true };
};

const stopSimulation = async (name, { requestedBy } = {}) => {
  requireEnabled();
  const state = getState(name);

  if (!state.running || !state.process) {
    return { ok: true, alreadyStopped: true };
  }

  state.stoppedBy = requestedBy || null;
  pushLog(state, {
    stream: 'system',
    message: `--- STOP requested (${state.name}) ${new Date().toISOString()}${
      requestedBy?.username ? ` by ${requestedBy.username}` : ''
    } ---`,
  });

  try {
    state.process.kill('SIGTERM');
  } catch (err) {
    throw new AppError(`Simülasyon durdurulamadı: ${err.message}`, 500);
  }

  const result = await waitForExit(state.process, STOP_TIMEOUT_MS);
  if (result.exited) {
    return { ok: true };
  }

  pushLog(state, {
    stream: 'system',
    message: `--- STOP timeout (${state.name}) SIGKILL gönderiliyor ---`,
  });

  try {
    state.process.kill('SIGKILL');
  } catch (err) {
    throw new AppError(`Simülasyon zorla kapatılamadı: ${err.message}`, 500);
  }

  await waitForExit(state.process, 2000);
  return { ok: true, forced: true };
};

const clearLogs = (name) => {
  requireEnabled();
  const state = getState(name);
  state.logs = [];
  state.stdoutRemainder = '';
  state.stderrRemainder = '';
  state.nextLogId = 1;
  return { ok: true };
};

const getLogs = (name, { afterId, limit } = {}) => {
  const state = getState(name);
  const safeLimit = Math.min(2000, Math.max(1, Number(limit) || 500));
  const after = Number(afterId) || 0;

  const minId = state.logs.at(0)?.id || 0;
  const maxId = state.logs.at(-1)?.id || 0;

  if (after <= 0) {
    const slice = state.logs.slice(-safeLimit);
    return {
      name: state.name,
      cursor: slice.at(-1)?.id || 0,
      minId,
      maxId,
      truncated: state.logs.length > slice.length,
      items: slice,
    };
  }

  const items = state.logs.filter((entry) => entry.id > after).slice(-safeLimit);
  return {
    name: state.name,
    cursor: items.at(-1)?.id || after,
    minId,
    maxId,
    truncated: after < minId - 1,
    items,
  };
};

module.exports = {
  listSimulations,
  startSimulation,
  stopSimulation,
  getLogs,
  clearLogs,
};
