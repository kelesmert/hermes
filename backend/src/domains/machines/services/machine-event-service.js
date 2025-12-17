const mongoose = require('mongoose');
const Machine = require('../models/machine-model');
const MachineEvent = require('../models/machine-event-model');
const machineStatuses = require('../../../constants/machine-statuses');
const AppError = require('../../../utils/app-error');

const MACHINE_STATUS_VALUES = Object.values(machineStatuses);

const ensureMachine = async (machineId) => {
  if (!mongoose.Types.ObjectId.isValid(machineId)) {
    throw new AppError('Geçersiz makine id formatı.', 400);
  }
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError('Makine bulunamadı.', 404);
  }
  return machine;
};

const listEvents = async (machineId, { limit = 50 }) => {
  await ensureMachine(machineId);
  const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  return MachineEvent.find({ machine: machineId })
    .sort({ startedAt: -1 })
    .limit(cappedLimit);
};

const closeOpenEvents = async (machineId, closeTime) => {
  await MachineEvent.updateMany(
    { machine: machineId, endedAt: { $exists: false } },
    { $set: { endedAt: closeTime || new Date() } },
  );
};

const createEvent = async (machineId, payload) => {
  const machine = await ensureMachine(machineId);
  const {
    state,
    startedAt,
    endedAt,
    reasonCode,
    reasonCategory,
    jobOrder,
    description,
    triggeredBy,
    source,
    metadata,
  } =
    payload;

  if (!state || !MACHINE_STATUS_VALUES.includes(state)) {
    throw new AppError('Geçersiz makine durumu.', 400);
  }

  const eventStart = startedAt ? new Date(startedAt) : new Date();
  if (Number.isNaN(eventStart.getTime())) {
    throw new AppError('Geçersiz başlangıç zamanı.', 400);
  }

  const eventEnd = endedAt ? new Date(endedAt) : undefined;
  if (eventEnd && Number.isNaN(eventEnd.getTime())) {
    throw new AppError('Geçersiz bitiş zamanı.', 400);
  }

  // yeni event başlamadan önce açık eventleri kapat
  await closeOpenEvents(machineId, eventStart);

  const event = await MachineEvent.create({
    machine: machineId,
    state,
    startedAt: eventStart,
    endedAt: eventEnd,
    reasonCode,
    reasonCategory,
    jobOrder,
    description,
    triggeredBy,
    source,
    metadata,
  });

  machine.status = state;
  machine.lastEventAt = eventEnd || eventStart;
  await machine.save();

  return event;
};

module.exports = {
  listEvents,
  createEvent,
};
