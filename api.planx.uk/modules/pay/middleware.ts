import { RequestHandler } from "express";

/**
 * Confirm that this local authority (aka team) has a pay token
 * TODO: Check this against a DB value instead of env vars?
 */
export const isTeamUsingGovPay: RequestHandler = (req, _res, next) => {
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  if (!isSupported) {
    return next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority (${req.params.localAuthority})`,
    });
  }

  next();
};
