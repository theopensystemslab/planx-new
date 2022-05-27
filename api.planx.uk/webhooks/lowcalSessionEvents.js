const { addDays } = require("date-fns");
const { createScheduledEvent } = require("../hasura/metadata");

const DAYS_UNTIL_EXPIRY = 28;

/**
 * Create a "reminder" event for a lowcal_session record
 * @param {object} req 
 * @param {object} res 
 * @param {object} next 
 */
const createReminderEvent = async (req, res, next) => {
  try {
    const { createdAt, payload } = req.body
    const response = createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder",
      schedule_at: addDays(Date.parse(createdAt), (DAYS_UNTIL_EXPIRY - 7)),
      payload: payload,
      comment: `reminder_${payload.sessionId}`,
    });
    res.json(response);
  } catch (error) {
    next(error);
  };
};

/**
 * Create an "expiry" event for a lowcal_session record
 * @param {object} req 
 * @param {object} res 
 * @param {object} next 
 */
const createExpiryEvent = async (req, res, next) => {
  try {
    const { createdAt, payload } = req.body
    const response = createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/expiry",
      schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
      payload: payload,
      comment: `expiry_${payload.sessionId}`,
    });
    res.json(response);
  } catch (error) {
    next(error);
  };
};

module.exports = {
  createReminderEvent,
  createExpiryEvent,
};