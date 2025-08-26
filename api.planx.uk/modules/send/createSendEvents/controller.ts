import type { CombinedResponse } from "../../../lib/hasura/metadata/index.js";
import { createScheduledEvent } from "../../../lib/hasura/metadata/index.js";
import type { CreateSendEventsController } from "./types.js";

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
//   REMINDER to keep these destinations in sync with api.planx.uk/modules/pay/service/inviteToPay/createPaymentSendEvents.ts
const createSendEvents: CreateSendEventsController = async (
  _req,
  res,
  next,
) => {
  return res.status(500).send();

};

export { createSendEvents };
