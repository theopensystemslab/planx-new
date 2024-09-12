import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import {
  TeamContactSettings,
  TeamSettings,
} from "@opensystemslab/planx-core/types";
import { FormikConfig } from "formik";
import gql from "graphql-tag";
import { useToast } from "hooks/useToast";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import SettingsSection from "ui/editor/SettingsSection";

import BoundaryForm from "./BoundaryForm";
import ContactForm from "./ContactForm";
import ReferenceCodeForm from "./ReferenceCodeForm";
import SubmissionsForm from "./SubmissionsForm";

export interface FormProps {
  formikConfig: FormikConfig<TeamSettings>;
  onSuccess: () => void;
}

interface GetTeamEmailSettings {
  teams: {
    teamSettings: TeamContactSettings;
  }[];
}

const GeneralSettings: React.FC = () => {
  const [formikConfig, setFormikConfig] = useState<
    FormikConfig<TeamSettings> | undefined
  >(undefined);
  const toast = useToast();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeamSettings = await useStore
          .getState()
          .fetchCurrentTeamSettings();
        console.log(fetchedTeamSettings);
        if (!fetchedTeamSettings.settings) throw Error("Unable to find team");

        setFormikConfig({
          initialValues: fetchedTeamSettings.settings,
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

  const onSuccess = () => toast.success("Setting Updated");

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
          <SubmissionsForm formikConfig={formikConfig} onSuccess={onSuccess} />
        </>
      )}
    </Container>
  );
};

export default GeneralSettings;
