import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { TeamSettings } from "@opensystemslab/planx-core/types";
import { FormikConfig } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import SettingsSection from "ui/editor/SettingsSection";

import BoundaryForm from "./BoundaryForm";
import ContactForm from "./ContactForm";
import ReferenceCodeForm from "./ReferenceCodeForm";
import SubmissionForm from "./SubmissionForm";

export interface FormProps {
  formikConfig: FormikConfig<TeamSettings>;
  onSuccess: () => void;
}

const GeneralSettings: React.FC = () => {
  const [formikConfig, setFormikConfig] = useState<
    FormikConfig<TeamSettings> | undefined
  >(undefined);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeam = await useStore.getState().fetchCurrentTeam();
        if (!fetchedTeam) throw Error("Unable to find team");

        setFormikConfig({
          initialValues: fetchedTeam.settings,
          onSubmit: () => {},
          validateOnBlur: false,
          validateOnChange: false,
          enableReinitialize: true,
        });
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };

    fetchTeam();
  }, []);

  const [open, setOpen] = useState(false);
  const [updateMessage, _setUpdateMessage] = useState("Setting Updated");

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const onSuccess = () => setOpen(true);

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1">
          Important links and settings for how your users connect with you.
        </Typography>
      </SettingsSection>
      {formikConfig && (
        <>
          <ContactForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <BoundaryForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <ReferenceCodeForm
            formikConfig={formikConfig}
            onSuccess={onSuccess}
          />
          <SubmissionForm formikConfig={formikConfig} onSuccess={onSuccess} />
        </>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {updateMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GeneralSettings;
