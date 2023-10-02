import { RequestHandler } from "express";
import { getClient } from "../../client";
import { userContext } from "../auth/middleware";
import { ServerError } from "../../errors";

export const getLoggedInUserDetails: RequestHandler = async (
  _req,
  res,
  next,
) => {
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

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const healthCheck: RequestHandler = (_req, res) =>
  res.json({ hello: "world" });
