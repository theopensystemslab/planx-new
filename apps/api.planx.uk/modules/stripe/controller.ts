import type { Team } from "@opensystemslab/planx-core/types";

import { ServerError } from "../../errors/index.js";
import { generateNonce, setConnectState, verifyState } from "./middleware.js";
import * as Service from "./service.js";
import type {
  ConnectCallbackController,
  ConnectStatusController,
  InitiateConnectController,
} from "./types.js";

export const initiateConnect: InitiateConnectController = async (
  req,
  res,
  next,
) => {
  try {
    const team = res.locals.team as Team;

    const nonce = generateNonce();
    setConnectState(req, { teamId: team.id, teamSlug: team.slug, nonce });

    const authoriseUrl = Service.buildAuthoriseUrl(nonce);
    return res.redirect(authoriseUrl);
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to start Stripe Connect onboarding",
        cause: error,
      }),
    );
  }
};

export const getConnectStatus: ConnectStatusController = async (
  _req,
  res,
  next,
) => {
  try {
    const team = res.locals.team as Team;
    const accountId = await Service.getStripeAccountId(team.id);
    return res.send({ connected: Boolean(accountId), accountId });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to fetch Stripe Connect status",
        cause: error,
      }),
    );
  }
};

const editorPaymentsUrl = (teamSlug: string): string =>
  `${process.env.EDITOR_URL_EXT}/${teamSlug}/settings/payments`;

// After the user has connected their Stripe account, get their account ID, store it, and redirect them to the team's payments page
export const handleCallback: ConnectCallbackController = async (req, res) => {
  const { code, state, error } = res.locals.parsedReq.query;

  const savedState = verifyState(req, state);

  if (!savedState) {
    // No valid session state to redirect back to a specific team - send to the homepage with an error
    return res.redirect(
      `${process.env.EDITOR_URL_EXT}/app?stripeError=invalid_state`,
    );
  }

  if (error || !code) {
    // e.g. the council declined the Stripe consent screen (error=access_denied)
    return res.redirect(
      `${editorPaymentsUrl(savedState.teamSlug)}?stripeError=${
        error || "missing_code"
      }`,
    );
  }

  try {
    const accountId = await Service.exchangeCodeForAccountId(code);
    await Service.saveStripeAccountId(savedState.teamId, accountId);
    return res.redirect(
      `${editorPaymentsUrl(savedState.teamSlug)}?stripeConnected=true`,
    );
  } catch (err) {
    console.error("Stripe Connect callback failed", err);
    return res.redirect(
      `${editorPaymentsUrl(savedState.teamSlug)}?stripeError=connect_failed`,
    );
  }
};
