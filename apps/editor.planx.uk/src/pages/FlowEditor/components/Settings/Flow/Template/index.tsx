import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "@tanstack/react-router";
import { useSlackMessage } from "pages/FlowEditor/components/Settings/hooks/useSlackMessage";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import SettingsDescription from "ui/editor/SettingsDescription";

import SettingsFormContainer from "../../shared/SettingsForm";
import { EJECT_FLOW_FROM_TEMPLATE, GET_FLOW_TEMPLATE_STATUS } from "./queries";
import { validationSchema } from "./schema";
import {
  type EjectFlowFromTemplate,
  type FormValues,
  GetFlowTemplateStatus,
} from "./types";

const Template: React.FC = () => {
  const flowId = useStore((state) => state.id);
  const navigate = useNavigate();
  const { mutate: sendSlackMessage } = useSlackMessage();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => setIsOpen(false);

  const handleSuccess = (data: GetFlowTemplateStatus | undefined) => {
    // Navigate away from tab, as we're about to remove it
    navigate({ to: "." });
    setIsOpen(false);

    // Type-narrowing only, should not happen!
    if (!data)
      throw Error("Failed to get query data for template ejection form");

    const {
      flow: { name, team, template },
    } = data;
    const message = `:eject: *${team.name}* have ejected their "${name}" service from the "${template.name} "template`;
    sendSlackMessage(message);
  };

  return (
    <SettingsFormContainer<
      GetFlowTemplateStatus,
      EjectFlowFromTemplate,
      FormValues
    >
      query={GET_FLOW_TEMPLATE_STATUS}
      mutation={EJECT_FLOW_FROM_TEMPLATE}
      validationSchema={validationSchema}
      legend="Templated flow updates"
      description="Manage how your templated flow receives updates."
      getInitialValues={({ flow: { templatedFrom } }) => ({ templatedFrom })}
      queryVariables={{ flowId }}
      getMutationVariables={(_values, data) => ({
        flowId,
        copiedFrom: data.flow.templatedFrom,
      })}
      showActionButtons={false}
      defaultValues={{ templatedFrom: "" }}
      onSuccess={handleSuccess}
    >
      {({ formik, data }) =>
        data?.flow?.template && (
          <>
            <SettingsDescription>
              <p>
                <strong>
                  {`This service is templated from ${data?.flow.template.team.name}.`}
                </strong>
              </p>
              <p>
                This means this service will update whenever the source template
                is published. Updates are made to reflect legislative changes,
                introduce additional functionality and improve user experience.
              </p>
              <p>
                If you no longer wish to receive updates and instead manage the
                content of this service manually you can do this by opting out
                of updates below.
              </p>
              <p>
                Please note that once you opt out of updates, you will be fully
                responsible for managing all content in this service. Opting
                back into templated flow updates is not currently supported.
              </p>
            </SettingsDescription>
            <Box>
              <Button
                onClick={() => {
                  formik.setFieldValue("templatedFrom", null);
                  setIsOpen(true);
                }}
                variant="contained"
                color="warning"
              >
                Opt-out of updates
              </Button>
            </Box>
            {isOpen && (
              <Dialog open={isOpen} onClose={handleClose}>
                <DialogTitle component="h1" variant="h3">
                  Opt-out of templated flow updates
                </DialogTitle>
                <DialogContent dividers>
                  <DialogContentText>
                    Are you sure you want to opt-out of templated flow updates
                    and manage the content of this service manually?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleClose}
                    color="secondary"
                    variant="contained"
                    sx={{ backgroundColor: "background.default" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={formik.submitForm}
                    type="submit"
                    color="warning"
                    variant="contained"
                  >
                    Opt-out of updates
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </>
        )
      }
    </SettingsFormContainer>
  );
};

export default Template;
