import { ServerError } from ".././../errors/index.js";
import { CreateSessionEventController } from "./service/lowcalSessionEvents/schema.js";
import {
  createSessionExpiryEvent,
  createSessionReminderEvent,
} from "./service/lowcalSessionEvents/index.js";
import { SendSlackNotification } from "./service/sendNotification/types.js";
import { sendSlackNotification } from "./service/sendNotification/index.js";
import { CreatePaymentEventController } from "./service/paymentRequestEvents/schema.js";
import {
  createPaymentExpiryEvents,
  createPaymentInvitationEvents,
  createPaymentReminderEvents,
} from "./service/paymentRequestEvents/index.js";
import { SanitiseApplicationData } from "./service/sanitiseApplicationData/types.js";
import { sanitiseApplicationData } from "./service/sanitiseApplicationData/index.js";
import { IsCleanJSONBController } from "./service/validateInput/schema.js";
import { analyzeSessions } from "./service/analyzeSessions/index.js";

export const sendSlackNotificationController: SendSlackNotification = async (
  _req,
  res,
  next,
) => {
  const isProduction = process.env.APP_ENVIRONMENT === "production";
  if (!isProduction) {
    return res.status(200).send({
      message: `Staging application submitted, skipping Slack notification`,
    });
  }

  const { body, query } = res.locals.parsedReq;
  const eventData = body.event.data.new;
  const eventType = query.type;

  try {
    const data = await sendSlackNotification(eventData, eventType);
    return res.status(200).send({ message: "Posted to Slack", data });
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to send ${eventType} Slack notification`,
        cause: error,
      }),
    );
  }
};

export const createPaymentInvitationEventsController: CreatePaymentEventController =
  async (_req, res, next) => {
    try {
      const response = await createPaymentInvitationEvents(
        res.locals.parsedReq.body,
      );
      res.json(response);
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to create payment invitation events`,
          cause: error,
        }),
      );
    }
  };

export const createPaymentReminderEventsController: CreatePaymentEventController =
  async (_req, res, next) => {
    try {
      const response = await createPaymentReminderEvents(
        res.locals.parsedReq.body,
      );
      res.json(response);
    } catch (error) {
      return next(
        new ServerError({
          message: "Failed to create payment reminder events",
          cause: error,
        }),
      );
    }
  };

export const createPaymentExpiryEventsController: CreatePaymentEventController =
  async (_req, res, next) => {
    try {
      const response = await createPaymentExpiryEvents(
        res.locals.parsedReq.body,
      );
      res.json(response);
    } catch (error) {
      return next(
        new ServerError({
          message: "Failed to create payment expiry events",
          cause: error,
        }),
      );
    }
  };

export const createSessionReminderEventController: CreateSessionEventController =
  async (_req, res, next) => {
    try {
      const response = await createSessionReminderEvent(
        res.locals.parsedReq.body,
      );
      res.json(response);
    } catch (error) {
      return next(
        new ServerError({
          message: "Failed to create session reminder event",
          cause: error,
        }),
      );
    }
  };

export const createSessionExpiryEventController: CreateSessionEventController =
  async (_req, res, next) => {
    try {
      const response = await createSessionExpiryEvent(
        res.locals.parsedReq.body,
      );
      res.json(response);
    } catch (error) {
      return next(
        new ServerError({
          message: "Failed to create session expiry event",
          cause: error,
        }),
      );
    }
  };

export const sanitiseApplicationDataController: SanitiseApplicationData =
  async (_req, res, next) => {
    try {
      const { operationFailed, results } = await sanitiseApplicationData();
      if (operationFailed) res.status(500);
      return res.json(results);
    } catch (error) {
      return next(
        new ServerError({
          message: "Failed to sanitise application data",
          cause: error,
        }),
      );
    }
  };

export const analyzeSessionsController: SanitiseApplicationData = async (
  _req,
  res,
  next,
) => {
  try {
    const { operationFailed, results } = await analyzeSessions();
    if (operationFailed) res.status(500);
    return res.json(results);
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to update session analytics",
        cause: error,
      }),
    );
  }
};

export const isCleanJSONBController: IsCleanJSONBController = async (
  _req,
  res,
  next,
) => {
  try {
    const { isClean } = res.locals.parsedReq.body;

    return isClean
      ? res.status(200).send()
      : res.status(400).json({
          message: "Invalid HTML content",
        });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to validate application data",
        cause: error,
      }),
    );
  }
};
