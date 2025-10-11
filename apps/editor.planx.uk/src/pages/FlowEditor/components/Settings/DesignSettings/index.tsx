import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { FormikConfig } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { ButtonForm } from "./ButtonForm";
import { FaviconForm } from "./FaviconForm";
import { TextLinkForm } from "./TextLinkForm";
import { ThemeAndLogoForm } from "./ThemeAndLogoForm";

export const DesignPreview = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.border.input}`,
  padding: theme.spacing(2),
  boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
  display: "flex",
  justifyContent: "center",
}));

export const EXAMPLE_COLOUR = "#007078";

export interface FormProps {
  formikConfig: FormikConfig<TeamTheme>;
  onSuccess: () => void;
}

const DesignSettings: React.FC = () => {
  const [formikConfig, setFormikConfig] = useState<
    FormikConfig<TeamTheme> | undefined
  >(undefined);
  const toast = useToast();
  /**
   * Fetch current team and setup shared form config
   */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeam = await useStore.getState().fetchCurrentTeam();
        if (!fetchedTeam) throw Error("Unable to find team");

        setFormikConfig({
          initialValues: fetchedTeam.theme,
          // This value will be set per form section
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

  const onSuccess = () => toast.success("Theme updated successfully");

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Design
        </Typography>
        <Typography variant="body1">
          How your service appears to public users.
        </Typography>
      </SettingsSection>
      {formikConfig && (
        <>
          <ThemeAndLogoForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <ButtonForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <TextLinkForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <FaviconForm formikConfig={formikConfig} onSuccess={onSuccess} />
        </>
      )}
    </Container>
  );
};

export default DesignSettings;
