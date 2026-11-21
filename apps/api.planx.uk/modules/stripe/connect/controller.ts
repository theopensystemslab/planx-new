import { ServerError } from "../../../errors/index.js";
import {
  clearPendingOnboarding,
  generateNonce,
  getPendingOnboarding,
  setConnectState,
  setPendingOnboarding,
  verifyState,
} from "./middleware.js";
import * as Service from "./service.js";
import type {
  ConnectCallbackController,
  ConnectStatusController,
  InitiateConnectController,
  OnboardingReturnController,
} from "./types.js";

const editorPaymentsUrl = (teamSlug: string): string =>
  `${process.env.EDITOR_URL_EXT}/app/${teamSlug}/settings/payments`;

export const initiateConnect: InitiateConnectController = async (
  req,
  res,
  next,
) => {
  try {
    const { team } = res.locals;
    const { account: accountName } = res.locals.parsedReq.query;

    // Staging creates a prefilled test account and sends the user through Stripe-hosted onboarding
    if (Service.getStripeMode() === "test") {
      const pending = getPendingOnboarding(req, team.id, accountName);
      const accountId =
        pending?.accountId ??
        (await Service.createPrefilledTestAccount(
          team,
          {
            ip: req.ip ?? "0.0.0.0",
            userAgent: req.get("user-agent"),
          },
          accountName,
        ));
      setPendingOnboarding(req, { teamId: team.id, accountId, accountName });

      try {
        const onboardingUrl = await Service.createOnboardingLink(
          accountId,
          team.slug,
          accountName,
        );
        return res.redirect(onboardingUrl);
      } catch (error) {
        // Only discard a resumed account if Stripe rejects it (e.g. it's been deleted) - otherwise keep it for the next attempt
        if (pending && Service.isInvalidRequestError(error)) {
          clearPendingOnboarding(req);
        }
        throw error;
      }
    }

    // Production uses OAuth to connect a new or existing live account
    const nonce = generateNonce();
    setConnectState(req, {
      teamId: team.id,
      teamSlug: team.slug,
      nonce,
      accountName,
    });

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

// Stripe redirects here when the user finishes or leaves staging onboarding - only save the account once it's complete
export const handleOnboardingReturn: OnboardingReturnController = async (
  req,
  res,
) => {
  const { team } = res.locals;
  const { account: accountName } = res.locals.parsedReq.query;
  const pending = getPendingOnboarding(req, team.id, accountName);

  if (!pending) {
    return res.redirect(
      `${editorPaymentsUrl(team.slug)}?stripeError=invalid_state`,
    );
  }

  try {
    if (!(await Service.isOnboardingComplete(pending.accountId))) {
      // Keep the pending account so connecting again resumes it
      return res.redirect(
        `${editorPaymentsUrl(team.slug)}?stripeError=onboarding_incomplete`,
      );
    }

    await Service.saveStripeAccountId(team.id, pending.accountId, accountName);
    clearPendingOnboarding(req);
    await Service.postStripeConnectedToSlack(
      team.slug,
      pending.accountId,
      accountName,
    );
    return res.redirect(`${editorPaymentsUrl(team.slug)}?stripeConnected=true`);
  } catch (err) {
    console.error("Stripe onboarding return failed", err);
    return res.redirect(
      `${editorPaymentsUrl(team.slug)}?stripeError=connect_failed`,
    );
  }
};

export const getConnectStatus: ConnectStatusController = async (
  _req,
  res,
  next,
) => {
  try {
    const { team } = res.locals;
    const [stripeAccounts, multipleAccountsEnabled, govPayConfigured] =
      await Promise.all([
        Service.getStripeAccounts(team.id),
        Service.isMultipleStripeAccountsEnabled(team.id),
        Service.hasGovPayConfigured(team.id),
      ]);

    // A team with multiple accounts gets the status of every account
    // Other teams just have the account named after the team
    const listedAccounts = multipleAccountsEnabled
      ? stripeAccounts
      : stripeAccounts.filter(({ name }) => name === team.name);

    const accounts = await Promise.all(
      listedAccounts.map(async ({ name, accountId }) => ({
        name,
        accountId,
        accountStatus: accountId
          ? await Service.getAccountStatus(accountId)
          : null,
      })),
    );
    const teamAccount = accounts.find(({ name }) => name === team.name);

    return res.send({
      connected: accounts.some(({ accountId }) => accountId),
      accountId: teamAccount?.accountId ?? null,
      accountStatus: teamAccount?.accountStatus ?? null,
      mode: Service.getStripeMode(),
      govPayConfigured,
      ...(multipleAccountsEnabled && { accounts }),
    });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to fetch Stripe Connect status",
        cause: error,
      }),
    );
  }
};

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
    const { teamId, teamSlug, accountName } = savedState;

    const accountId = await Service.exchangeCodeForAccountId(code);
    await Service.saveStripeAccountId(teamId, accountId, accountName);
    await Service.postStripeConnectedToSlack(teamSlug, accountId, accountName);
    return res.redirect(`${editorPaymentsUrl(teamSlug)}?stripeConnected=true`);
  } catch (err) {
    console.error("Stripe Connect callback failed", err);
    return res.redirect(
      `${editorPaymentsUrl(savedState.teamSlug)}?stripeError=connect_failed`,
    );
  }
};
