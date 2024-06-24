import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { FormikConfig } from "formik";
import React, { useEffect, useState } from "react";
import EditorRow from "ui/editor/EditorRow";

import BoundaryForm from "./BoundaryForm";
import ContactForm from "./ContactForm";
import HomepagePlanningForm from "./HomepagePlanningForm";

export interface GeneralSettings {
  boundaryUrl: string;
  helpEmail: string;
  helpPhone: string;
  helpOpeningHours: string;
  homepage: string;
  isPlanningDataCollected: boolean;
  portalName: string;
  portalUrl: string;
}

export interface FormProps {
  formikConfig: FormikConfig<GeneralSettings>;
  onSuccess: () => void;
}

const GeneralSettings: React.FC = () => {
  const [formikConfig, setFormikConfig] = useState<
    FormikConfig<GeneralSettings> | undefined
  >(undefined);

  const initialValues = {
    boundaryUrl: "",
    helpEmail: "",
    helpPhone: "",
    helpOpeningHours: "",
    homepage: "",
    isPlanningDataCollected: true,
    portalName: "",
    portalUrl: "",
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setFormikConfig({
          initialValues: initialValues,
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
  const [updateMessage, setUpdateMessage] = useState("Setting Updated");

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
    <Box maxWidth="formWrap" mx="auto">
      <EditorRow>
        <Typography variant="h2" component="h3" gutterBottom>
          General
        </Typography>
        <Typography variant="body1">
          Important links and settings for how your users connect with you
        </Typography>
      </EditorRow>
      {formikConfig && (
        <>
          <ContactForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <HomepagePlanningForm
            formikConfig={formikConfig}
            onSuccess={onSuccess}
          />
          <BoundaryForm formikConfig={formikConfig} onSuccess={onSuccess} />
        </>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {updateMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneralSettings;
