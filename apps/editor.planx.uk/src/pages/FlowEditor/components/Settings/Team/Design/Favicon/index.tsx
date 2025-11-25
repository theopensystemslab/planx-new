import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_THEME, UPDATE_TEAM_THEME } from "../shared/queries";
import type { GetTeamTheme } from "../shared/types";
import { defaultValues, validationSchema } from "../shared/validationSchema";
import type { FormValues, MutationVars } from "./types";

const Favicon: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  return (
    <SettingsFormContainer<GetTeamTheme, MutationVars, FormValues>
      query={GET_TEAM_THEME}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_THEME}
      getInitialValues={({ themes: [theme] }) => theme}
      getMutationVariables={(theme) => ({
        teamId,
        theme: {
          favicon: theme.favicon,
        },
      })}
      validationSchema={validationSchema.pick(["favicon"])}
      legend="Favicon"
      description={
        <>
          <p>
            Set the favicon to be used in the browser tab. The favicon should be
            32x32px and in .ico or .png format.
          </p>
          <p>
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for favicons
            </Link>
          </p>
        </>
      }
    >
      {({ formik }) => (
        <InputRow>
          <InputRowLabel>Favicon:</InputRowLabel>
          <InputRowItem width={formik.values.favicon ? 90 : 50}>
            <ImgInput
              img={formik.values.favicon || undefined}
              onChange={(newFile) =>
                newFile
                  ? formik.setFieldValue("favicon", newFile)
                  : formik.setFieldValue("favicon", null)
              }
              acceptedFileTypes={{
                "image/png": [".png"],
                "image/x-icon": [".ico"],
                "image/vnd.microsoft.icon": [".ico"],
              }}
            />
          </InputRowItem>
          <Typography
            color="text.secondary"
            variant="body2"
            pl={2}
            alignSelf="center"
          >
            .ico or .png
          </Typography>
        </InputRow>
      )}
    </SettingsFormContainer>
  );
};

export default Favicon;
