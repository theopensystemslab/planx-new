import { ServerError } from "../../errors/serverError.js";
import { generateDownloadToken } from "./service/generateDownloadToken.js";
import { generateHTML } from "./service/generateHTML.js";
import { getApplications } from "./service/getApplications/index.js";
import { login } from "./service/login.js";
import type { Applications } from "./types/applications.js";
import type { DownloadHTML } from "./types/downloadHTML.js";
import type { GenerateDownloadToken } from "./types/downloadToken.js";
import type { Login } from "./types/login.js";

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
    return res.status(200).json(applications);
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to fetch LPS applications for token ${token}. ${(error as Error).message}`,
      }),
    );
  }
};

export const generateDownloadTokenController: GenerateDownloadToken = async (
  _req,
  res,
  next,
) => {
  const { email, sessionId } = res.locals.parsedReq.body;
  try {
    const token = await generateDownloadToken(email, sessionId);
    return res.status(200).json({ token });
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to generate download token. ${
          (error as Error).message
        }`,
        cause: (error as Error).cause,
      }),
    );
  }
};

export const downloadHTMLController: DownloadHTML = async (_req, res, next) => {
  const { sessionId, email } = res.locals.parsedReq.body;
  try {
    const html = await generateHTML(sessionId, email);
    return res.header("Content-type", "text/html").send(html);
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to generate HTML for session ${sessionId}. ${
          (error as Error).message
        }`,
        cause: (error as Error).cause,
      }),
    );
  }
};
