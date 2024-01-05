import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { getClient } from "../../client";
import { ServerError } from "../../errors";
import { RequestHandler } from "express";
import { User } from "@opensystemslab/planx-core/types";
import { userContext } from "../auth/middleware";

interface UserResponse {
  message: string;
}

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    isPlatformAdmin: z.boolean().optional().default(false),
  }),
});

export type CreateUser = ValidatedRequestHandler<
  typeof createUserSchema,
  UserResponse
>;

export const createUser: CreateUser = async (_req, res, next) => {
  try {
    const newUser = res.locals.parsedReq.body;
    const $client = getClient();
    await $client.user.create(newUser);
    return res.send({ message: "Successfully created user" });
  } catch (error) {
    return next(
      new ServerError({ message: "Failed to create user", cause: error }),
    );
  }
};

export const deleteUserSchema = z.object({
  params: z.object({
    email: z.string().trim().email().toLowerCase(),
  }),
});

export type DeleteUser = ValidatedRequestHandler<
  typeof deleteUserSchema,
  UserResponse
>;

export const deleteUser: DeleteUser = async (_req, res, next) => {
  try {
    const { email } = res.locals.parsedReq.params;
    const $client = getClient();

    const user = await $client.user.getByEmail(email);
    if (!user) throw Error(`No user matching email ${email} found`);

    const isSuccessful = await $client.user.delete(user.id);
    if (!isSuccessful) throw Error("Request to delete user failed");

    return res.send({ message: "Successfully deleted user" });
  } catch (error) {
    return next(
      new ServerError({ message: "Failed to delete user", cause: error }),
    );
  }
};

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
