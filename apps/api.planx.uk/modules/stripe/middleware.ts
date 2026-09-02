import crypto from "crypto";
import type { RequestHandler } from "express";

import { assertTeamEditPermission } from "../auth/requireTeamMembership.js";
import { getTeamBySlug } from "./service.js";

interface StripeConnectSessionState {
  teamId: number;
  teamSlug: string;
  nonce: string;
}

/**
 * Only the `session` property is needed for these middleware functions
 */
interface RequestWithSession {
  session?: Record<string, unknown> | null;
}

/**
 * Look up the team and confirm the requesting user is a teamEditor/teamAdmin for it (or a platformAdmin)
 */
export const requireStripeConnectTeamAuth: RequestHandler = async (
  _,
  res,
  next,
) => {
  const { teamSlug } = res.locals.parsedReq.params as { teamSlug: string };

  try {
    const team = await getTeamBySlug(teamSlug);
    await assertTeamEditPermission(team.id, team.slug);

    res.locals.team = team;
    return next();
  } catch (error) {
    return next(error);
  }
};

// Save the connect state in the session, for CSRF protection on the OAuth round-trip
export const setConnectState = (
  req: RequestWithSession,
  state: StripeConnectSessionState,
): void => {
  req.session!.stripeConnect = state;
};

// Read the connect state from the session and clear it so it can't be reused
export const consumeConnectState = (
  req: RequestWithSession,
): StripeConnectSessionState | undefined => {
  const state = req.session?.stripeConnect as
    StripeConnectSessionState | undefined;
  req.session!.stripeConnect = undefined;
  return state;
};

export const generateNonce = (): string => crypto.randomUUID();

// checks that the request contains a connect state and that the nonce matches the provided state nonce
export const verifyState = (
  req: RequestWithSession,
  providedStateNonce: string | undefined,
): StripeConnectSessionState | undefined => {
  const savedState = consumeConnectState(req);
  if (
    !savedState ||
    !providedStateNonce ||
    savedState.nonce !== providedStateNonce
  ) {
    return undefined;
  }
  return savedState;
};
