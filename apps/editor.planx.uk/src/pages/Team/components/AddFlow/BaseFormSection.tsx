import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { useFormikContext } from "formik";
import React from "react";
import Permission from "ui/editor/Permission";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";
import { slugify } from "utils";

import { CreateFromCopyFormSection } from "./CreateFromCopyFormSection";
import { CreateFromTemplateFormSection } from "./CreateFromTemplateFormSection";
import { CREATE_FLOW_MODES, CreateFlow, FLOW_SERVICE_OPTIONS } from "./types";

export const BaseFormSection: React.FC = () => {
  const { values, setFieldValue, getFieldProps, errors } =
    useFormikContext<CreateFlow>();
  return (
    <>
      <InputLabel
        label="How do you want to create a new flow?"
        id="create-flow-mode"
      >
        <SelectInput
          value={values.mode}
          name="mode"
          bordered
          required={true}
          title={"How do you want to create a new flow?"}
          labelId="create-flow-mode"
          onChange={(e) => {
            setFieldValue("mode", e.target.value);
            setFieldValue("flow.source.id", undefined);
          }}
        >
          {CREATE_FLOW_MODES.map(({ mode, title }) => (
            <MenuItem key={mode} value={mode}>
              {title}
            </MenuItem>
          ))}
        </SelectInput>
      </InputLabel>
      <CreateFromTemplateFormSection />
      <CreateFromCopyFormSection />
      <InputLabel label="Flow name" htmlFor="flow.name">
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
          startAdornment={<URLPrefix />}
        />
      </InputLabel>
      {values.mode === "new" && (
        <>
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
          <Typography variant="h4">Is this a flow or a service?</Typography>
          <RadioGroup
            defaultValue={false}
            value={values.flow.isService}
            sx={{ gap: 1 }}
          >
            {FLOW_SERVICE_OPTIONS.map((option) => (
              <BasicRadio
                id={option.isService}
                label={option.title}
                description={option.description}
                variant="compact"
                onChange={(e) =>
                  setFieldValue(
                    "flow.isService",
                    (e.target as HTMLInputElement).value === "true",
                  )
                }
              />
            ))}
          </RadioGroup>
        </>
      )}
    </>
  );
};
