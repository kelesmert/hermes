const asyncHandler = require('../../../utils/async-handler');
const { listEvents, createEvent } = require('../services/machine-event-service');

const listMachineEvents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit } = req.query;
  const events = await listEvents(id, { limit });
  res.json({ events });
});

const createMachineEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await createEvent(id, req.body || {});
  res.status(201).json({ event });
});

module.exports = {
  listMachineEvents,
  createMachineEvent,
};
