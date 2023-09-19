import { z } from "zod";
import { $admin } from "../../client";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

interface TeamMemberResponse {
  message: string;
}

export const upsertMemberSchema = z.object({
  params: z.object({
    teamId: z.string().transform((val) => parseInt(val)),
  }),
  body: z.object({
    userId: z.number(),
    role: z.enum(["teamEditor", "teamViewer"]),
  }),
});

export type UpsertMember = ValidatedRequestHandler<
  typeof upsertMemberSchema,
  TeamMemberResponse
>;

export const removeMemberSchema = z.object({
  params: z.object({
    teamId: z.string().transform((val) => parseInt(val)),
  }),
  body: z.object({
    userId: z.number(),
  }),
});

export type RemoveMember = ValidatedRequestHandler<
  typeof removeMemberSchema,
  TeamMemberResponse
>;

export const addMember: UpsertMember = async (req, res) => {
  const { teamId } = req.params;
  const { userId, role } = req.body;

  const isSuccess = await $admin.team.addMember({ teamId, userId, role });

  if (!isSuccess)
    return res.status(500).json({ message: "Failed to add member to team" });

  res.send({ message: "Successfully added user to team" });
};

export const changeMemberRole: UpsertMember = async (req, res) => {
  const { teamId } = req.params;
  const { userId, role } = req.body;

  const isSuccess = await $admin.team.changeMemberRole({
    teamId,
    userId,
    role,
  });

  if (!isSuccess)
    return res.status(500).json({ message: "Failed to change role" });

  res.send({ message: "Successfully changed role" });
};

export const removeMember: RemoveMember = async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;

  const isSuccess = await $admin.team.removeMember({ teamId, userId });

  if (!isSuccess)
    return res
      .status(500)
      .json({ message: "Failed to remove member from team" });

  res.send({ message: "Successfully removed user from team" });
};
