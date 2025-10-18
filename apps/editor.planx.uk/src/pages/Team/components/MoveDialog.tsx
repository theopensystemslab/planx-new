import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useMutation } from "@tanstack/react-query";
import { moveFlow } from "api/flow/requests";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";
import * as yup from "yup";

interface MoveFlowForm {
  newTeamName: string;
}

const validationSchema = yup.object({
  newTeamName: yup.string().required("A team name is required"),
});

interface Props {
  isDialogOpen: boolean;
  handleClose: () => void;
  sourceFlow: {
    name: string;
    slug: string;
    id: string;
  };
}

export const MoveDialog: React.FC<Props> = ({
  isDialogOpen,
  handleClose,
  sourceFlow,
}) => {
  const currentTeamSlug = useStore((state) => state.teamSlug);
  const toast = useToast();
  const moveFlowMutation = useMutation({
    mutationFn: moveFlow,
    onSuccess: (data) => {
      toast.success(data.message || "Flow moved successfully");
      handleClose();
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        const apiError = error.response.data?.error;
        if (apiError?.toLowerCase().includes("uniqueness violation")) {
          toast.error(
            `Failed to move. A flow with name '${sourceFlow.name}' already exists in that team. Rename the flow and try again.`,
          );
        } else {
          toast.error(
            "Failed to move. Make sure you're entering a valid team name and try again.",
          );
        }
      }
    },
  });

  const onSubmit: FormikConfig<MoveFlowForm>["onSubmit"] = async (
    { newTeamName },
    { setFieldError },
  ) => {
    const newTeamSlug = slugify(newTeamName.trim());

    if (newTeamSlug === currentTeamSlug) {
      setFieldError("newTeamName", "This flow already belongs to this team.");
      return;
    }

    moveFlowMutation.mutate({
      flowId: sourceFlow.id,
      teamSlug: newTeamSlug,
    });
  };

  return (
    <Formik<MoveFlowForm>
      initialValues={{ newTeamName: "" }}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({ resetForm, isSubmitting, getFieldProps, errors, values }) => (
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            handleClose();
            resetForm();
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            Move "{sourceFlow.name}"
          </DialogTitle>
          <Box>
            <Form>
              <DialogContent
                dividers
                sx={{ gap: 2, display: "flex", flexDirection: "column" }}
              >
                <InputLabel label="New Team Name" htmlFor="newTeamName">
                  <Input
                    {...getFieldProps("newTeamName")}
                    id="newTeamName"
                    type="text"
                    errorMessage={errors.newTeamName}
                    value={values.newTeamName}
                  />
                </InputLabel>
              </DialogContent>
              <DialogActions>
                <Button
                  disableRipple
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="contained"
                  color="secondary"
                  sx={{ backgroundColor: "background.default" }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disableRipple
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Moving..." : "Move flow"}
                </Button>
              </DialogActions>
            </Form>
          </Box>
        </Dialog>
      )}
    </Formik>
  );
};
