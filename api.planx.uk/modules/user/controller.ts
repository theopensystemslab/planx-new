import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { getClient } from "../../client";
import { ServerError } from "../../errors";

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

export const createUser: CreateUser = async (req, res, next) => {
  try {
    const $client = getClient();
    await $client.user.create(req.body);
    return res.send({ message: "Successfully created user" });
  } catch (error) {
    return next(
      new ServerError({ message: "Failed to create user", cause: error }),
    );
  }
};
