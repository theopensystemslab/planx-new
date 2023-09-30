import { ServerError } from "../../errors";
import { CreatePaymentEventController } from "./paymentRequestEvents/schema";
import {
  createPaymentInvitationEvents,
  createPaymentReminderEvents,
} from "./paymentRequestEvents/service";
import { sendSlackNotification } from "./sendNotification/service";
import { SendSlackNotification } from "./sendNotification/types";

export const sendSlackNotificationController: SendSlackNotification = async (
  req,
  res,
  next,
) => {
  const isProduction = process.env.APP_ENVIRONMENT === "production";
  if (!isProduction) {
    return res.status(200).send({
      message: `Staging application submitted, skipping Slack notification`,
    });
  }

  const eventData = req.body.event.data.new;
  const eventType = req.query.type;

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
      const response = await createPaymentInvitationEvents(req.body);
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
      const response = await createPaymentReminderEvents(req.body);
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
