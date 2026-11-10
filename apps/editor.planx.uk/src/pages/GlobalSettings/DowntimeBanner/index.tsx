import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DowntimeBanner from "components/DowntimeBanner/DowntimeBanner";
import { type DowntimeBannerVariant } from "hooks/data/useDowntimeBanner";
import SettingsFormContainer from "pages/FlowEditor/components/Settings/shared/SettingsForm";
import InputLabel from "ui/editor/InputLabel";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import { Switch } from "ui/shared/Switch";

import {
  GET_DOWNTIME_BANNER_SETTINGS,
  UPDATE_DOWNTIME_BANNER_SETTINGS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  DowntimeBannerFormValues,
  GetDowntimeBannerSettingsData,
  UpdateDowntimeBannerSettingsVariables,
} from "./types";

const VARIANT_CONFIG: Record<
  DowntimeBannerVariant,
  { legend: string; description: string }
> = {
  editor: {
    legend: "Editor banner",
    description:
      "Displayed at the top of every page of the PlanX editor, for service designers and team members.",
  },
  public: {
    legend: "Public banner",
    description:
      "Displayed at the top of every public service, for applicants and agents.",
  },
};

const toNullable = (value: string) => value.trim() || null;

const DowntimeBannerForm: React.FC<{ variant: DowntimeBannerVariant }> = ({
  variant,
}) => {
  const { legend, description } = VARIANT_CONFIG[variant];
  const id = (field: string) => `${variant}-downtime-banner-${field}`;

  return (
    <SettingsFormContainer<
      GetDowntimeBannerSettingsData,
      UpdateDowntimeBannerSettingsVariables,
      DowntimeBannerFormValues
    >
      query={GET_DOWNTIME_BANNER_SETTINGS}
      queryVariables={{ name: variant }}
      mutation={UPDATE_DOWNTIME_BANNER_SETTINGS}
      getInitialValues={({ downtimeBanner }) => ({
        isVisible: downtimeBanner?.isVisible ?? defaultValues.isVisible,
        title: downtimeBanner?.title || defaultValues.title,
        description: downtimeBanner?.description ?? defaultValues.description,
      })}
      getMutationVariables={(values) => ({
        name: variant,
        set: {
          is_visible: values.isVisible,
          title: toNullable(values.title),
          description: toNullable(values.description),
        },
      })}
      successMessage={`${legend} updated`}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend={legend}
      description={
        <>
          <p>{description}</p>
          <p>Changes take effect as soon as they are saved.</p>
        </>
      }
      preview={(formik) => (
        <Box>
          <Typography variant="body2" sx={{ pb: 0.5 }}>
            Preview
          </Typography>
          <DowntimeBanner
            title={formik.values.title}
            description={formik.values.description}
            isPreview
          />
        </Box>
      )}
    >
      {({ formik }) => (
        <>
          <Box>
            <Switch
              label={`Show ${legend.toLowerCase()}`}
              name="isVisible"
              variant="editorPage"
              checked={formik.values.isVisible}
              onChange={() =>
                formik.setFieldValue("isVisible", !formik.values.isVisible)
              }
            />
          </Box>
          <InputLabel label="Title" htmlFor={id("title")}>
            <Input
              id={id("title")}
              name="title"
              format="bold"
              value={formik.values.title}
              onChange={formik.handleChange}
              errorMessage={formik.errors.title}
            />
          </InputLabel>
          <InputLabel label="More information (optional)">
            <RichTextInput
              name="description"
              placeholder="More information"
              multiline
              rows={6}
              value={formik.values.description}
              onChange={(ev) =>
                formik.setFieldValue("description", ev.target.value)
              }
              errorMessage={formik.errors.description}
            />
          </InputLabel>
        </>
      )}
    </SettingsFormContainer>
  );
};

const DowntimeBannerSettings: React.FC = () => (
  <>
    <DowntimeBannerForm variant="editor" />
    <DowntimeBannerForm variant="public" />
  </>
);

export default DowntimeBannerSettings;
