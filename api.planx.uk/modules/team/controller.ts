import * as Service from "./service";
import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { ServerError } from "../../errors";

interface TeamMemberResponse {
  message: string;
}

export const upsertMemberSchema = z.object({
  params: z.object({
    teamSlug: z.string().toLowerCase(),
  }),
  body: z.object({
    userEmail: z.string().email(),
    role: z.enum(["teamEditor", "teamViewer"]),
  }),
});

export type UpsertMember = ValidatedRequestHandler<
  typeof upsertMemberSchema,
  TeamMemberResponse
>;

export const removeMemberSchema = z.object({
  params: z.object({
    teamSlug: z.string().toLowerCase(),
  }),
  body: z.object({
    userEmail: z.string().email(),
  }),
});

export type RemoveMember = ValidatedRequestHandler<
  typeof removeMemberSchema,
  TeamMemberResponse
>;

export const addMember: UpsertMember = async (_req, res, next) => {
  const { teamSlug } = res.locals.parsedReq.params;
  const { userEmail, role } = res.locals.parsedReq.body;

  try {
    await Service.addMember({ userEmail, teamSlug, role });
    return res.send({ message: "Successfully added user to team" });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to add member to team",
        cause: error,
      }),
    );
  }
};

export const changeMemberRole: UpsertMember = async (_req, res, next) => {
  const { teamSlug } = res.locals.parsedReq.params;
  const { userEmail, role } = res.locals.parsedReq.body;

  try {
    await Service.changeMemberRole({ userEmail, teamSlug, role });
    return res.send({ message: "Successfully changed role" });
  } catch (error) {
    return next(
      new ServerError({ message: "Failed to change role", cause: error }),
    );
  }
};

export const removeMember: RemoveMember = async (_req, res, next) => {
  const { teamSlug } = res.locals.parsedReq.params;
  const { userEmail } = res.locals.parsedReq.body;

  try {
    await Service.removeMember({ userEmail, teamSlug });
    return res.send({ message: "Successfully removed user from team" });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to remove member from team",
        cause: error,
      }),
    );
  }
};
