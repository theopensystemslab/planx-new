import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import { typographyClasses } from "@mui/material/Typography";
import { useFormikContext } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";

import { CREATE_FLOW_MODES, CreateFlow } from "./types";

const URLPrefix: React.FC = () => {
  const { origin, pathname } = window.location;
  const urlPrefix = `${origin}${pathname}/`;

  return (
    <InputAdornment
      position="start"
      sx={(theme) => ({
        mr: 0,
        [`& .${typographyClasses.root}`]: {
          color: theme.palette.text.disabled,
        },
      })}
    >
      {urlPrefix}
    </InputAdornment>
  );
};

export const BaseFormSection: React.FC = () => {
  const { values, setFieldValue, getFieldProps, errors } =
    useFormikContext<CreateFlow>();

  return (
    <>
      <InputLabel
        label="How do you want to create a new service?"
        id="create-flow-mode"
      >
        <SelectInput
          value={values.mode}
          name="mode"
          bordered
          required={true}
          title={"How do you want to create a new service?"}
          labelId="create-flow-mode"
          onChange={(e) => {
            setFieldValue("mode", e.target.value);
            setFieldValue("flow.source.id", undefined);
          }}
        >
          {CREATE_FLOW_MODES.map(({ mode, title }) => (
            <MenuItem
              key={mode}
              value={mode}
              // TODO: Enable "copy"
              disabled={
                mode === "copy" ||
                (mode === "template" && !hasFeatureFlag("TEMPLATES"))
              }
            >
              {title}
            </MenuItem>
          ))}
        </SelectInput>
      </InputLabel>
      <InputLabel label="Service name" htmlFor="flow.name">
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
      <InputLabel label="Service URL" htmlFor="flow.slug">
        <Input
          {...getFieldProps("flow.slug")}
          disabled
          id="flow.slug"
          type="text"
          startAdornment={<URLPrefix />}
        />
      </InputLabel>
    </>
  );
};
