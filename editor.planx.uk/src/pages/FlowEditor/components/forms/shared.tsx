import { MenuItem } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
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

const renderMenuItem = (category: string) => {
  return flags
    .filter((flag) => flag.category === category)
    .map((flag, index) => (
      <MenuItem key={index} value={flag.value}>
        {flag.text}
      </MenuItem>
    ));
};

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

export const PermissionSelect: React.FC<SelectInputProps> = (props) => (
  <SelectInput {...props}>
    {props.value && <MenuItem value="">Remove Flag</MenuItem>}
    <MenuItem disabled>Planning permission</MenuItem>
    {renderMenuItem("Planning permission")}
    <MenuItem disabled>Listed building consent</MenuItem>
    {renderMenuItem("Listed building consent")}
    <MenuItem disabled>Works to trees</MenuItem>
    {renderMenuItem("Works to trees")}
    <MenuItem disabled>Demolition in a conservation area</MenuItem>
    {renderMenuItem("Demolition in a conservation area")}
    <MenuItem disabled>Planning policy</MenuItem>
    {renderMenuItem("Planning policy")}
    <MenuItem disabled>Community infrastructure levy</MenuItem>
    {renderMenuItem("Community infrastructure levy")}
  </SelectInput>
);

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
