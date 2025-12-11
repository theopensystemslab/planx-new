import Box from "@mui/material/Box";
// eslint-disable-next-line no-restricted-imports
import { SwitchProps } from "@mui/material/Switch";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import Input, { Props as InputProps } from "ui/shared/Input/Input";
import { Switch } from "ui/shared/Switch";

export const TextInput: React.FC<{
  title: string;
  richText?: boolean;
  description?: string;
  switchProps?: SwitchProps;
  headingInputProps: InputProps;
  contentInputProps: InputProps;
}> = ({
  title,
  richText = false,
  description,
  switchProps,
  headingInputProps,
  contentInputProps,
}) => {
  return (
    <Box width="100%">
      <Box mb={0.5} display="flex" alignItems="center">
        <Switch
          label={title}
          name={switchProps?.name}
          variant="editorPage"
          onChange={switchProps?.onChange}
          checked={switchProps?.checked}
        />
      </Box>
      <Box mb={1}>
        {description && (
          <SettingsDescription>{description}</SettingsDescription>
        )}
      </Box>
      <InputGroup flowSpacing>
        <InputLabel label="Heading" htmlFor={headingInputProps.id}>
          <Input placeholder="Heading" format="bold" {...headingInputProps} />
        </InputLabel>
        <InputLabel label="Text" htmlFor={contentInputProps.id}>
          {richText ? (
            <RichTextInput
              placeholder="Text"
              multiline
              rows={6}
              errorMessage={contentInputProps.errorMessage || ""}
              {...contentInputProps}
            />
          ) : (
            <Input
              placeholder="Text"
              multiline
              rows={6}
              {...contentInputProps}
            />
          )}
        </InputLabel>
      </InputGroup>
    </Box>
  );
};
