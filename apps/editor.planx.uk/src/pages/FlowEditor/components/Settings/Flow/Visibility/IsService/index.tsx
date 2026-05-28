import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_IS_SERVICE, UPDATE_IS_SERVICE } from "./queries";
import { validationSchema } from "./schema";
import type {
  GetIsServiceResponse,
  IsServiceFormValues,
  IsServiceVars,
} from "./types";

const IsService: React.FC = () => {
  const [flowId] = useStore((state) => [state.id]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <SettingsFormContainer<
      GetIsServiceResponse,
      IsServiceVars,
      IsServiceFormValues
    >
      query={GET_IS_SERVICE}
      mutation={UPDATE_IS_SERVICE}
      validationSchema={validationSchema}
      legend={"Is this flow a service?"}
      description={
        "A service is user-facing and can accept responses from users when turned online."
      }
      getInitialValues={({ flow: { isService } }) => ({ isService })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
      showActionButtons={false}
      defaultValues={{ isService: false }}
    >
      {({ formik, data }) => {
        const isTrial = data?.flow.team.settings.isTrial;

        return (
          <>
            {isTrial && (
              <WarningContainer>
                <PendingActionsIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Trial accounts cannot create publicly-accessible services.
                </Typography>
              </WarningContainer>
            )}
            <Box sx={{ display: "flex-col", alignItems: "center", mb: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: FONT_WEIGHT_BOLD, mr: 1, mb: 2 }}
              >
                {formik.values.isService === true
                  ? "This is a service"
                  : "This is currently a flow"}
              </Typography>
              {formik.values.isService === true ? (
                <Typography variant="body2">
                  If this is a mistake, please contact an admin to revert it to
                  a flow.
                </Typography>
              ) : (
                <Typography variant="body1">
                  A flow cannot accept responses from users. It can be nested in
                  other services.
                </Typography>
              )}
            </Box>
            {formik.values.isService === false && (
              <Box sx={{ display: "flex" }}>
                <Button
                  id="set-is-service-button"
                  data-testid="set-is-service-button"
                  sx={{ mb: 2 }}
                  disabled={isTrial}
                  variant="contained"
                  onClick={() => setDialogOpen(true)}
                >
                  {"Make this a user-facing service"}
                </Button>
              </Box>
            )}
            <ConfirmationDialog
              open={dialogOpen}
              onClose={async () => {
                setDialogOpen(false);
                await formik.setFieldValue(
                  "isService",
                  !formik.values.isService,
                );
                await formik.submitForm();
              }}
              title="Confirm change to service"
              confirmText={"Set to service"}
              cancelText="Cancel"
            >
              Are you sure you want to set this flow as a user-facing service?
            </ConfirmationDialog>
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

export default IsService;
