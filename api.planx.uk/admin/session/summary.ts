import {
  GovUKPayment,
  PaymentRequest,
  Session,
} from "@opensystemslab/planx-core/types";
import { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";

import { Breadcrumb, Flow, LowCalSession, Passport, Team } from "../../types";
import { $api } from "../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/summary:
 *  get:
 *    summary: Returns a passport, breadcrumbs, and other key details about a session
 *    description: Returns a passport, breadcrumbs, and other key details about a session
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - bearerAuth: []
 */
export async function getSessionSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await getSessionSummaryById(req.params.sessionId);
    if (session) {
      res.send(session);
    } else {
      res.send({
        message: `Cannot find data for this session; double-check your sessionId is correct`,
      });
    }
  } catch (error) {
    return next({
      message:
        "Failed to fetch session summary data: " + (error as Error).message,
    });
  }
}

interface SessionSummary {
  flow: {
    id: Flow["id"];
    slug: Flow["slug"];
    team: {
      slug: Team["slug"];
    };
    created_at: LowCalSession["created_at"];
    updated_at: LowCalSession["updated_at"];
    locked_at: LowCalSession["lockedAt"];
    submitted_at: LowCalSession["submitted_at"];
    sanitised_at: string;
    email: LowCalSession["email"];
    passport: Passport["data"];
    breadcrumbs: Breadcrumb;
    payments?: Pick<
      GovUKPayment,
      "created_date" | "payment_id" | "amount" | "state"
    >[];
    invitations_to_pay?: Pick<
      PaymentRequest,
      "createdAt" | "govPayPaymentId" | "paymentAmount" | "paidAt"
    >[];
  };
}

const getSessionSummaryById = async (
  sessionId: Session["id"],
): Promise<SessionSummary | null> => {
  const { lowcalSession } = await $api.client.request<
    Record<"lowcalSession", SessionSummary | null>
  >(
    gql`
      query GetSessionSummary($sessionId: uuid!) {
        lowcalSession: lowcal_sessions_by_pk(id: $sessionId) {
          flow {
            id
            slug
            team {
              slug
            }
          }
          created_at
          updated_at
          submitted_at
          locked_at
          sanitised_at
          email
          passport: data(path: "passport.data")
          breadcrumbs: data(path: "breadcrumbs")
          payments: payment_status(order_by: { created_at: desc }) {
            created_at
            payment_id
            amount
            status
          }
          invitations_to_pay: payment_requests(order_by: { created_at: desc }) {
            created_at
            govpay_payment_id
            payment_amount
            paid_at
          }
        }
      }
    `,
    {
      sessionId,
    },
  );

  return lowcalSession;
};
