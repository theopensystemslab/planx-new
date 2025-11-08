import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { Team } from "@opensystemslab/planx-core/types";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import { useToast } from "hooks/useToast";
import { moveFlow } from "lib/api/flow/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import * as yup from "yup";

interface MoveFlowForm {
  selectedTeam: string;
}

const validationSchema = yup.object({
  selectedTeam: yup.string().required("A team name is required"),
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
  const [currentTeamSlug, canUserEditTeam] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
  ]);
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

  const onSubmit: FormikConfig<MoveFlowForm>["onSubmit"] = async ({
    selectedTeam,
  }) => {
    moveFlowMutation.mutate({
      flowId: sourceFlow.id,
      teamSlug: selectedTeam,
    });
  };

  const { data, loading, error } = useQuery<{
    teams: Pick<Team, "id" | "name" | "slug">[];
  }>(gql`
    query GetTeams {
      teams(order_by: { name: asc }) {
        id
        name
        slug
      }
    }
  `);

  if (!loading && !data) throw new Error("Unable to find teams");
  if (error) throw new Error("Error fetching teams for Move dialog");

  const availableTeams =
    data?.teams.filter(
      ({ slug }) => slug !== currentTeamSlug && canUserEditTeam(slug),
    ) || [];

  return (
    <Formik<MoveFlowForm>
      initialValues={{ selectedTeam: "" }}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({ resetForm, isSubmitting, getFieldProps }) => (
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
                {loading && <Skeleton height="80px" />}
                {data?.teams && (
                  <SelectInput
                    bordered
                    required={true}
                    title={"Select team"}
                    labelId="move-team-select"
                    {...getFieldProps("selectedTeam")}
                  >
                    {availableTeams.map(({ slug, name }) => (
                      <MenuItem key={slug} value={slug}>
                        {name}
                      </MenuItem>
                    ))}
                  </SelectInput>
                )}
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
