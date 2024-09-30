import { getClient } from "../../client/index.js";
import { ServerError } from "../../errors/index.js";
import type { RequestHandler } from "express";
import type { User } from "@opensystemslab/planx-core/types";
import { userContext } from "../auth/middleware.js";

export const getLoggedInUserDetails: RequestHandler<
  Record<string, never>,
  User & { jwt: string | undefined }
> = async (_req, res, next) => {
  try {
    const $client = getClient();

    const id = userContext.getStore()?.user.sub;
    if (!id)
      throw new ServerError({
        message: "User ID missing from request",
        status: 400,
      });

    const user = await $client.user.getById(parseInt(id));
    if (!user)
      throw new ServerError({
        message: `Unable to locate user with ID ${id}`,
        status: 400,
      });

    const jwt = userContext.getStore()?.user.jwt;

    res.json({
      ...user,
      jwt: jwt,
    });
  } catch (error) {
    next(error);
  }
};
