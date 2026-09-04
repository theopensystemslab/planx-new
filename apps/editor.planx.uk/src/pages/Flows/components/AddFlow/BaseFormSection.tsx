import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { useFormikContext } from "formik";
import Permission from "ui/editor/Permission";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";
import { slugify } from "utils";

import { CreateFromCopyFormSection } from "./CreateFromCopyFormSection";
import { CreateFromTemplateFormSection } from "./CreateFromTemplateFormSection";
import type { CreateFlow, FlowTypeOption } from "./types";
import {
  CREATE_FLOW_MODES,
  FLOW_TYPE_OPTIONS,
  PATTERN_TYPE_OPTION,
} from "./types";

export const BaseFormSection: React.FC = () => {
  const { values, setFieldValue, getFieldProps, errors } =
    useFormikContext<CreateFlow>();

  let flowType: FlowTypeOption = "flow";
  if (values.flow.isPattern) flowType = "pattern";
  else if (values.flow.isService) flowType = "service";

  const handleFlowTypeChange: React.ComponentProps<
    typeof BasicRadio
  >["onChange"] = (e) => {
    const value = (e.target as HTMLInputElement).value as FlowTypeOption;
    setFieldValue("flow.isService", value === "service");
    setFieldValue("flow.isPattern", value === "pattern");
  };

  let nameLabel = "Flow name";
  if (values.mode === "new") {
    if (flowType === "pattern") nameLabel = "Pattern name";
    else if (flowType === "service") nameLabel = "Service name";
  }

  return (
    <>
      <InputLabel label="How do you want to start?" id="create-flow-mode">
        <SelectInput
          value={values.mode}
          name="mode"
          bordered
          required={true}
          title={"How do you want to start?"}
          labelId="create-flow-mode"
          onChange={(e) => {
            setFieldValue("mode", e.target.value);
            setFieldValue("flow.sourceId", "");
            setFieldValue("flow.name", "");
            setFieldValue("flow.slug", "");
          }}
        >
          {CREATE_FLOW_MODES.map(({ mode, title }) => (
            <MenuItem key={mode} value={mode}>
              {title}
            </MenuItem>
          ))}
        </SelectInput>
      </InputLabel>
      {values.mode === "new" && (
        <Stack spacing={1}>
          <Typography variant="body1">What are you creating?</Typography>
          <RadioGroup value={flowType}>
            {FLOW_TYPE_OPTIONS.map((option) => (
              <BasicRadio
                key={option.value}
                id={option.value}
                label={option.title}
                description={option.description}
                variant="inline"
                onChange={handleFlowTypeChange}
              />
            ))}
            <Permission.IsPlatformAdmin>
              <BasicRadio
                id={PATTERN_TYPE_OPTION.value}
                label={PATTERN_TYPE_OPTION.title}
                description={PATTERN_TYPE_OPTION.description}
                variant="inline"
                onChange={handleFlowTypeChange}
              />
            </Permission.IsPlatformAdmin>
          </RadioGroup>
        </Stack>
      )}
      {values.mode === "new" && flowType !== "pattern" && (
        <Permission.IsPlatformAdmin>
          <Switch
            name="isTemplate"
            checked={values.flow.isTemplate}
            onChange={() =>
              setFieldValue("flow.isTemplate", !values.flow.isTemplate)
            }
            label={"Source template"}
          />
        </Permission.IsPlatformAdmin>
      )}
      <CreateFromTemplateFormSection />
      <CreateFromCopyFormSection />
      <InputLabel label={nameLabel} htmlFor="flow.name">
        <Input
          {...getFieldProps("flow.name")}
          id="flow.name"
          type="text"
          onChange={(e) => {
            setFieldValue("flow.name", e.target.value);
            setFieldValue("flow.slug", slugify(e.target.value));
          }}
          errorMessage={errors.flow?.name}
          value={values.flow?.name}
        />
      </InputLabel>
      <InputLabel label="Editor URL" htmlFor="flow.slug">
        <Input
          {...getFieldProps("flow.slug")}
          disabled
          id="flow.slug"
          type="text"
          startAdornment={<URLPrefix mode="flow" />}
        />
      </InputLabel>
    </>
  );
};
