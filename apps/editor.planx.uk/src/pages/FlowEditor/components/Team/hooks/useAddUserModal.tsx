import { useLazyQuery, useMutation } from "@apollo/client";
import type { Role, User } from "@opensystemslab/planx-core/types";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useState } from "react";

import { isUserAlreadyExistsError } from "../errors/addNewEditorErrors";
import { emailSchema, upsertMemberSchema } from "../formSchema";
import {
  ADD_EXISTING_USER_TO_TEAM_AS_ADMIN,
  ADD_EXISTING_USER_TO_TEAM_AS_EDITOR,
  CREATE_AND_ADD_ADMIN_TO_TEAM,
  CREATE_AND_ADD_EDITOR_TO_TEAM,
  GET_USER_BY_EMAIL,
  GET_USERS_FOR_TEAM_QUERY,
} from "../queries";
import { type UserFormValues } from "../types";

export type Step =
  | { stage: "email" }
  | { stage: "confirm-existing"; existingUser: User }
  | { stage: "create-new" };

const SUBMIT_BUTTON_TEXT: Record<Step["stage"], string> = {
  email: "Continue",
  "confirm-existing": "Add to team",
  "create-new": "Create user",
};

export const useAddUserModal = ({ onClose }: { onClose: () => void }) => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);
  const toast = useToast();

  const [step, setStep] = useState<Step>({ stage: "email" });

  const handleClose = () => {
    onClose();
    setStep({ stage: "email" });
  };

  const handleCompleted = (message: string) => {
    handleClose();
    toast.success(message);
  };

  const [
    checkEmail,
    { loading: checkingEmail, data: emailCheckData, error: emailCheckError },
  ] = useLazyQuery(GET_USER_BY_EMAIL);

  useEffect(() => {
    if (emailCheckError) {
      toast.error("Failed to look up email, please try again");
      return;
    }

    if (!emailCheckData) return;

    if (emailCheckData.users[0]) {
      setStep({
        stage: "confirm-existing",
        existingUser: emailCheckData.users[0],
      });
      return;
    }

    setStep({ stage: "create-new" });
  }, [emailCheckData, emailCheckError, toast]);

  const [assignEditor, { loading: assignLoadingEditor }] = useMutation<
    User[],
    { teamId: number; userId: number }
  >(ADD_EXISTING_USER_TO_TEAM_AS_EDITOR, {
    onCompleted: () => handleCompleted("Successfully added user to team"),
    onError: (error) => {
      if (isUserAlreadyExistsError(error.message)) {
        return toast.error("User is already a member of this team");
      }
      toast.error("Failed to add user to team, please try again");
    },
    refetchQueries: [
      { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
    ],
  });

  const [assignAdmin, { loading: assignLoadingAdmin }] = useMutation<
    User[],
    { teamId: number; userId: number }
  >(ADD_EXISTING_USER_TO_TEAM_AS_ADMIN, {
    onCompleted: () => handleCompleted("Successfully added user to team"),
    onError: (error) => {
      if (isUserAlreadyExistsError(error.message)) {
        return toast.error("User is already a member of this team");
      }
      toast.error("Failed to add user to team, please try again");
    },
    refetchQueries: [
      { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
    ],
  });

  const [createTeamEditor, { loading: createEditorLoading }] = useMutation(
    CREATE_AND_ADD_EDITOR_TO_TEAM,
    {
      onCompleted: () => handleCompleted("Successfully added a user"),
      onError: () => toast.error("Failed to add new user, please try again"),
      refetchQueries: [
        { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
      ],
    },
  );

  // we have two separate mutations here because teamAdmin model requires two entries in the team_members table (one mutation creates one teamEditor row and the other mutation creates both teamEditor and teamAdmin)
  const [createTeamAdmin, { loading: createAdminLoading }] = useMutation(
    CREATE_AND_ADD_ADMIN_TO_TEAM,
    {
      onCompleted: () => handleCompleted("Successfully added a user"),
      onError: () => toast.error("Failed to add new user, please try again"),
      refetchQueries: [
        { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
      ],
    },
  );

  const handleSubmit = (values: UserFormValues) => {
    const email = values.email.toLowerCase();
    if (step.stage === "email") {
      checkEmail({ variables: { email } });
      return;
    }

    if (step.stage === "confirm-existing" && values.role === "teamEditor") {
      assignEditor({
        variables: { userId: step.existingUser.id, teamId },
      });
      return;
    }

    if (step.stage === "confirm-existing" && values.role === "teamAdmin") {
      assignAdmin({
        variables: { userId: step.existingUser.id, teamId },
      });
      return;
    }

    if (step.stage === "create-new" && values.role === "teamEditor") {
      createTeamEditor({
        variables: { ...values, email, teamId },
      });
    }

    if (step.stage === "create-new" && values.role === "teamAdmin") {
      createTeamAdmin({
        variables: { ...values, email, teamId },
      });
    }
  };

  const title =
    step.stage === "confirm-existing"
      ? `Add ${step.existingUser.firstName} ${step.existingUser.lastName} to team?`
      : "Add a new member";

  return {
    step,
    title,
    handleClose,
    handleSubmit,
    submitButtonText: SUBMIT_BUTTON_TEXT[step.stage],
    isSubmitting:
      checkingEmail ||
      assignLoadingEditor ||
      assignLoadingAdmin ||
      createEditorLoading ||
      createAdminLoading,
    validationSchema:
      step.stage === "create-new" ? upsertMemberSchema : emailSchema,
  };
};
