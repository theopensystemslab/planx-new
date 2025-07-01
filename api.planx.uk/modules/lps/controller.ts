import { ServerError } from "../../errors/serverError.js";
import { getApplications } from "./service/getApplications.js";
import { login } from "./service/login.js";
import type { Applications, Login } from "./types.js";

export const loginController: Login = async (_req, res, next) => {
  const { email } = res.locals.parsedReq.body;
  try {
    await login(email);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to send "lps-login" email. ${
          (error as Error).message
        }`,
      }),
    );
  }
};

export const applicationsController: Applications = async (_req, res, next) => {
  const { email, token } = res.locals.parsedReq.body;
  try {
    const applications = await getApplications(email, token);
    return res.status(200).json({ applications });
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to fetch LPS applications for token ${token}. ${(error as Error).message}`,
      }),
    );
  }
};
