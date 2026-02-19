import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const TeamMembers: Schema = {
  type: "Team Member",
  fields: [
    {
      type: "text",
      data: {
        title: "Full name",
        fn: "fullName",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Email address",
        fn: "email",
        type: TextInputType.Email,
      },
    },
    {
      type: "text",
      data: {
        title: "Job Role",
        fn: "role",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
