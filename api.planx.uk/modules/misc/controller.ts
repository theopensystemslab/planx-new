import { RequestHandler } from "express";
import { getClient } from "../../client";
import { userContext } from "../auth/middleware";
import { ServerError } from "../../errors";

export const getLoggedInUserDetails: RequestHandler = async (_req, res, next) => {
  try {
    const $client = getClient();
  
    const email = userContext.getStore()?.user.email
    if (!email) throw new ServerError({ message: "User email missing from request", status: 400 })
  
    const user = await $client.user.getByEmail(email);
    if (!user) throw new ServerError({ message: `Unable to locate user with email ${email}`, status: 400 })
  
    res.json(user);
  } catch (error) {
    next(error)
  }
};