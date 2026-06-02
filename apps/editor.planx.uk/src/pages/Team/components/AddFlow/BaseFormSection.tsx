import Box from "@mui/material/Box";
import List from "@mui/material/List";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useFormikContext } from "formik";
import React, { useState } from "react";
import Permission from "ui/editor/Permission";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";
import { slugify } from "utils";

import { CreateFromCopyFormSection } from "./CreateFromCopyFormSection";
import { CreateFromTemplateFormSection } from "./CreateFromTemplateFormSection";
import { CREATE_FLOW_MODES, CreateFlow } from "./types";

export const BaseFormSection: React.FC = () => {
  const [nestedSourceTemplates, setNestedSourceTemplates] = useState<string[]>(
    [],
  );
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
      <CreateFromTemplateFormSection
        setNestedSourceTemplates={setNestedSourceTemplates}
      />
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
      {values.mode === "template" && nestedSourceTemplates.length > 0 && (
        <Box sx={{ py: 1 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {`This template relies on nested templates`}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {`If any of these templated flows are not yet in your workspace, please add them next before you begin customising this template.`}
          </Typography>
          <List>
            {nestedSourceTemplates.map((name) => (
              <ul key={name}>{name}</ul>
            ))}
          </List>
        </Box>
      )}
    </>
  );
};
