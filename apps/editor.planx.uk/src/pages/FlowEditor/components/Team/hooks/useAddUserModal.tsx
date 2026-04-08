import { useLazyQuery, useMutation } from "@apollo/client";
import type { Role, User } from "@opensystemslab/planx-core/types";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useState } from "react";

import { isUserAlreadyExistsError } from "../errors/addNewEditorErrors";
import { emailSchema, upsertMemberSchema } from "../formSchema";
import {
  ADD_EXISTING_USER_TO_TEAM,
  CREATE_AND_ADD_USER_TO_TEAM,
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

  const role: Role = "teamEditor";

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

  const [assignUser, { loading: assignLoading }] = useMutation<
    User[],
    { teamId: number; role: Role; userId: number }
  >(ADD_EXISTING_USER_TO_TEAM, {
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

  const [createUser, { loading: createLoading }] = useMutation(
    CREATE_AND_ADD_USER_TO_TEAM,
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

    if (step.stage === "confirm-existing") {
      assignUser({ variables: { userId: step.existingUser.id, teamId, role } });
      return;
    }

    if (step.stage === "create-new") {
      createUser({ variables: { ...values, email, teamId, role } });
    }
  };

  const title =
    step.stage === "confirm-existing"
      ? `Add ${step.existingUser.firstName} ${step.existingUser.lastName} to team?`
      : "Add a new member";

  return {
    step,
    role,
    title,
    handleClose,
    handleSubmit,
    submitButtonText: SUBMIT_BUTTON_TEXT[step.stage],
    isSubmitting: checkingEmail || assignLoading || createLoading,
    validationSchema:
      step.stage === "create-new" ? upsertMemberSchema : emailSchema,
  };
};
