import { ServerError } from "../../errors";
import { CreateSessionEventController } from "./service/lowcalSessionEvents/schema";
import {
  createSessionExpiryEvent,
  createSessionReminderEvent,
} from "./service/lowcalSessionEvents";
import { SendSlackNotification } from "./service/sendNotification/types";
import { sendSlackNotification } from "./service/sendNotification";
import { CreatePaymentEventController } from "./service/paymentRequestEvents/schema";
import {
  createPaymentExpiryEvents,
  createPaymentInvitationEvents,
  createPaymentReminderEvents,
} from "./service/paymentRequestEvents";
import { SanitiseApplicationData } from "./service/sanitiseApplicationData/types";
import { sanitiseApplicationData } from "./service/sanitiseApplicationData";

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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
