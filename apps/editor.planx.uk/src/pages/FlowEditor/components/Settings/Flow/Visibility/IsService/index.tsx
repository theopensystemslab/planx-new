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
import {
  GET_IS_SERVICE,
  UPDATE_IS_SERVICE,
} from "./queries";
import { validationSchema } from "./schema";
import type {
  GetIsServiceResponse,
  IsServiceFormValues,
  UpdateIsServiceVars,
} from "./types";

const IsService: React.FC = () => {
  const [flowId] = useStore((state) => [state.id]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const isProduction = import.meta.env.VITE_APP_ENV === "production";

  return (
    <SettingsFormContainer<
      GetIsServiceResponse,
      UpdateIsServiceVars,
      IsServiceFormValues
    >
      query={GET_IS_SERVICE}
      mutation={UPDATE_IS_SERVICE}
      validationSchema={validationSchema}
      legend={"Is this flow a service?"}
      description={
        "A service is user-facing and includes more customisable settings. Only services can accept responses."
      }
      getInitialValues={({ flow: { isService } }) => ({ isService })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
      showActionButtons={false}
      defaultValues={{isService: false}}
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
          {isProduction && (
            <>
            <Box sx={{ display: "flex-col", alignItems: "center", mb: 2 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: FONT_WEIGHT_BOLD, mr: 1, mb: 2 }}
              >
                This is currently a {formik.values.isService === true ? "service" : "flow"}
              </Typography>
              <Typography
                variant="body1"
              >
                {formik.values.isService === true ? 
                "A service is user-facing and can accept submissions" : 
                "A flow is content that will be nested in other services, and cannot directly accept submissions"}
                .
              </Typography>
            </Box>
              <Box sx={{ display: "flex" }}>
                <Button
                  id="set-is-service-button"
                  data-testid="set-is-service-button"
                  sx={{ mb: 2 }}
                  disabled={data?.flow.team.settings.isTrial}
                  variant="contained"
                  onClick={() => setDialogOpen(true)}
                >
                  {formik.values.isService === false
                    ? "Change to user-facing service"
                    : "Change to flow"}
                </Button>
              </Box>
              </>
            )}
            {isProduction && (
              <ConfirmationDialog
                open={dialogOpen}
                onClose={async () => {
                    setDialogOpen(false);
                    await formik.setFieldValue(
                      "isService",
                      !formik.values.isService,
                    );
                    await formik.submitForm();
                }
                }
                title="Confirm flow type change"
                confirmText={
                  formik.values.isService === false
                    ? "Set to service"
                    : "Set to flow"
                }
                cancelText="Cancel"
              >
                {formik.values.isService === false 
                ? "Are you sure you want to set this flow as a user-facing service?"
                : "Are you sure you want to set this service as a flow? This should only be set if it is intended for use as a nested flow."}
              </ConfirmationDialog>
            )}
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

export default IsService;
