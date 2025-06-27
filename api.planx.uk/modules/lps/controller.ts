import { ServerError } from "../../errors/serverError.js";
import { login } from "./service/login.js";
import type { Login } from "./types.js";

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
