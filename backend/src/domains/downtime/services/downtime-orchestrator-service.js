const machineStatuses = require('../../../constants/machine-statuses');
const MachineEvent = require('../../machines/models/machine-event-model');
const { createEvent: createMachineEvent } = require('../../machines/services/machine-event-service');

const UNPLANNED_CONFIRMATION_THRESHOLD_MS = 5 * 60 * 1000;

const openDowntimeFromTelemetry = async ({
  machine,
  startedAt,
  reasonCode,
  reasonCategory = 'unplanned',
  description,
}) => {
  if (!machine) return null;

  return createMachineEvent(machine._id, {
    state: machineStatuses.DOWNTIME,
    startedAt,
    reasonCode,
    reasonCategory,
    jobOrder: machine.currentJobOrder || undefined,
    description: description || 'Otomatik tespit edilen duruş',
    source: 'system',
  });
};

const closeDowntimeFromTelemetry = async ({ machine, endedAt, hasAssignedJob }) => {
  if (!machine) return null;

  const closeTime = endedAt ? new Date(endedAt) : new Date();
  if (Number.isNaN(closeTime.getTime())) {
    return null;
  }

  const openEvent = await MachineEvent.findOne({
    machine: machine._id,
    endedAt: { $exists: false },
  }).sort({ startedAt: -1 });

  if (
    openEvent &&
    openEvent.state === machineStatuses.DOWNTIME &&
    openEvent.reasonCategory === 'unplanned' &&
    openEvent.source === 'system' &&
    closeTime.getTime() - openEvent.startedAt.getTime() >= UNPLANNED_CONFIRMATION_THRESHOLD_MS
  ) {
    await MachineEvent.updateOne(
      { _id: openEvent._id },
      {
        $set: {
          'metadata.confirmationRequired': true,
          'metadata.confirmationRequiredAt': closeTime,
          'metadata.confirmationThresholdMs': UNPLANNED_CONFIRMATION_THRESHOLD_MS,
        },
      },
    );
  }

  return createMachineEvent(machine._id, {
    state: hasAssignedJob ? machineStatuses.RUNNING : machineStatuses.IDLE,
    startedAt: closeTime,
    source: 'system',
    jobOrder: hasAssignedJob ? machine.currentJobOrder : undefined,
    description: 'Otomatik tespit edilen duruş bitti',
  });
};

module.exports = {
  openDowntimeFromTelemetry,
  closeDowntimeFromTelemetry,
};
