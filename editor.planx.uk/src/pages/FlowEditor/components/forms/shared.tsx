import MenuItem from "@material-ui/core/MenuItem";
import InfoOutlined from "@material-ui/icons/InfoOutlined";
import trim from "lodash/trim";
import React from "react";

import {
  ImgInput,
  InputGroup,
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
  SelectInput,
  SelectInputProps,
} from "../../../../ui";
import flags from "../../data/flags";

export interface IEditor {
  headerTextField?: string;
  whyItMatters?: string;
  policyField?: string;
  definition?: string;
  notes?: string;
}

interface MoreInformationProps {
  changeField: (any) => any;
  howMeasured: string;
  policyRef: string;
  info: string;
  definitionImg: string;
}

export const MoreInformation = ({
  changeField,
  definitionImg,
  howMeasured,
  policyRef,
  info,
}: MoreInformationProps) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More Information" Icon={InfoOutlined}>
        <InputGroup label="Why it matters">
          <InputRow>
            <RichTextInput
              multiline
              name="info"
              value={info}
              onChange={changeField}
              placeholder="Why it matters"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Policy source">
          <InputRow>
            <RichTextInput
              multiline
              name="policyRef"
              value={policyRef}
              onChange={changeField}
              placeholder="Policy source"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="How it is defined?">
          <InputRow>
            <RichTextInput
              multiline
              name="howMeasured"
              value={howMeasured}
              onChange={changeField}
              placeholder="How it is defined?"
            />
            <ImgInput
              img={definitionImg}
              onChange={(newUrl) => {
                changeField({
                  target: { name: "definitionImg", value: newUrl },
                });
              }}
            />
          </InputRow>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};

export const PermissionSelect: React.FC<SelectInputProps> = (props) => {
  // Material-ui doesn't like Fragments so this needs to be an array
  const flagMenuItems = Object.entries(flags).flatMap(([category, flags]) => [
    <MenuItem disabled key={category}>
      {category}
    </MenuItem>,
    Object.entries(flags).map(([id, flag]) => (
      <MenuItem
        key={id}
        value={id}
        style={{ borderLeft: `1em solid ${flag.bgColor || "transparent"}` }}
      >
        {flag.text}
      </MenuItem>
    )),
  ]);

  return (
    <SelectInput {...props}>
      {props.value && <MenuItem value="">Remove Flag</MenuItem>}
      {flagMenuItems}
    </SelectInput>
  );
};

export const parseFormValues = (ob, defaultValues = {}) =>
  ob.reduce((acc, [k, v]) => {
    if (typeof v === "string") {
      // Remove trailing lines (whitespace)
      // and non-ASCII characters https://stackoverflow.com/a/44472084
      v = trim(v).replace(/[\u{0080}-\u{FFFF}]/gu, "");
      // don't store empty fields
      if (v) acc[k] = v;
    } else if (Array.isArray(v)) {
      // if it's an array (i.e. options)
      acc[k] = v
        // only store fields that have values
        .map((o) => parseFormValues(Object.entries(o)))
        // don't store options with no values
        .filter((o) => Object.keys(o).length > 0);
    } else {
      // it's a number or boolean etc
      acc[k] = v;
    }
    return acc;
  }, defaultValues);

export const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? <span className="error">{message}</span> : null;
