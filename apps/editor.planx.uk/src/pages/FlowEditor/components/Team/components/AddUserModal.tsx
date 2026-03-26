import { useLazyQuery, useMutation } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import type { Role, User } from "@opensystemslab/planx-core/types";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";

import { emailSchema, upsertMemberSchema } from "../formSchema";
import {
  ADD_EXISTING_USER_TO_TEAM,
  CREATE_AND_ADD_USER_TO_TEAM,
  GET_USER_BY_EMAIL,
  GET_USERS_FOR_TEAM_QUERY,
} from "../queries";
import { DEMO_TEAM_ID, EditorModalProps, UserFormValues } from "../types";
import { MemberFields } from "./MemberFields";
import { ModalActions } from "./ModalActions";

const SUBMIT_BUTTON_TEXT: Record<Step["stage"], string> = {
  "email": "Continue",
  "confirm-existing": "Add to team",
  "create-new": "Create user",
};

export type Step =
  | { stage: "email" }
  | { stage: "confirm-existing"; existingUser: User }
  | { stage: "create-new" };

type Props = Extract<EditorModalProps, { action: "add" }>;

export const AddUserModal: React.FC<Props> = ({ onClose }) => {
  const [teamId, teamSlug] = useStore((state) => [state.teamId, state.teamSlug]);
  const isDemoTeam = teamId === DEMO_TEAM_ID;
  const toast = useToast();

  const [step, setStep] = useState<Step>({ stage: "email" });

  const role = isDemoTeam ? "demoUser" : "teamEditor";

  const handleClose = () => {
    onClose();
    setStep({ stage: "email" });
  };

  const handleCompleted = (message: string) => {
    handleClose();
    toast.success(message);
  };

  const [checkEmail, { loading: checkingEmail, data: emailCheckData, error: emailCheckError }] =
    useLazyQuery(GET_USER_BY_EMAIL);

  useEffect(() => {
    if (emailCheckError) {
      toast.error("Failed to look up email, please try again");
      return;
    }

    if (!emailCheckData) return;

    if (emailCheckData.users[0]) {
      setStep({ stage: "confirm-existing", existingUser: emailCheckData.users[0] });
      return;
    }

    setStep({ stage: "create-new" });
  }, [emailCheckData, emailCheckError, toast]);

  const [assignUser, { loading: assignLoading }] = useMutation<User[], { teamId: number, role: Role, userId: number }>(ADD_EXISTING_USER_TO_TEAM, {
    onCompleted: () => handleCompleted("Successfully added user to team"),
    onError: () => toast.error("Failed to add user to team, please try again"),
    refetchQueries: [{ query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } }],
  });

  const [createUser, { loading: createLoading }] = useMutation(CREATE_AND_ADD_USER_TO_TEAM, {
    onCompleted: () => handleCompleted("Successfully added a user"),
    onError: () => toast.error("Failed to add new user, please try again"),
    refetchQueries: [{ query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } }],
  });

  const handleSubmit = (values: UserFormValues) => {
    const email = values.email.toLowerCase();

    if (step.stage === "email") {
      checkEmail({ variables: { email } });
      return;
    }

    if (step.stage === "confirm-existing") {
      assignUser({
        variables: { userId: step.existingUser.id, teamId, role },
      });
      return;
    }

    if (step.stage === "create-new") {
      createUser({
        variables: { ...values, email, teamId, role },
      });
    }
  };

  const title =
    step.stage === "confirm-existing"
      ? `Add ${step.existingUser.firstName} ${step.existingUser.lastName} to team?`
      : "Add a new member";

  const isSubmitting = checkingEmail || assignLoading || createLoading;

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-add-user"
      open
      onClose={onClose}
    >
      <Formik<UserFormValues>
        initialValues={{ firstName: "", lastName: "", email: "", role }}
        validationSchema={
          step.stage === "create-new" ? upsertMemberSchema : emailSchema
        }
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
      >
        <Form>
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            {title}
          </DialogTitle>
          <DialogContent dividers data-testid="modal-create-user">
            <MemberFields mode={step["stage"]}/>
            {step.stage === "confirm-existing" && (
              <Typography>
                An account already exists for that email address. Would you
                like to add them to this team?
              </Typography>
            )}
          </DialogContent>

          <DialogActions>
            <ModalActions
              submitButtonText={SUBMIT_BUTTON_TEXT[step.stage]}
              submitDataTestId="modal-create-user-button"
              isSubmitting={isSubmitting}
              onCancel={handleClose}
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};