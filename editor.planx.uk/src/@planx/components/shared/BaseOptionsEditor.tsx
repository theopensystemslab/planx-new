import React, { ReactNode } from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option } from ".";
import { DataFieldAutocomplete } from "./DataFieldAutocomplete";
import { FlagsSelect } from "./FlagsSelect";

export interface BaseOptionsEditorProps {
  value: Option;
  schema?: string[];
  optionPlaceholder?: string;
  showValueField?: boolean;
  showDescriptionField?: boolean;
  onChange: (newVal: Option) => void;
  children?: ReactNode;
  disabled?: boolean;
  index: number;
}

export const BaseOptionsEditor: React.FC<BaseOptionsEditorProps> = (props) => (
  <div style={{ width: "100%" }}>
    <InputRow>
      {props.value.id && (
        <input type="hidden" value={props.value.id} readOnly />
      )}
      <InputRowItem width="200%">
        <Input
          required
          format="bold"
          multiline
          value={props.value.data.text || ""}
          disabled={props.disabled}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                text: ev.target.value,
              },
            });
          }}
          placeholder={props.optionPlaceholder || "Option"}
        />
      </InputRowItem>
      <ImgInput
        img={props.value.data.img}
        disabled={props.disabled}
        onChange={(img) => {
          props.onChange({
            ...props.value,
            data: {
              ...props.value.data,
              img,
            },
          });
        }}
      />
      {props.children}
    </InputRow>
    {props.showDescriptionField && (
      <InputRow>
        <Input
          value={props.value.data.description || ""}
          placeholder="Description"
          multiline
          disabled={props.disabled}
          onChange={(ev) =>
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                description: ev.target.value,
              },
            })
          }
        />
      </InputRow>
    )}
    {props.showValueField && (
      <DataFieldAutocomplete
        key={`${props.value.id}-data-field-autocomplete`}
        data-testid={`data-field-autocomplete-option-${props.index}`}
        schema={props.schema}
        value={props.value.data.val}
        disabled={props.disabled}
        onChange={(targetValue) => {
          props.onChange({
            ...props.value,
            data: {
              ...props.value.data,
              val: targetValue ?? "",
            },
          });
        }}
      />
    )}
    <FlagsSelect
      value={props.value.data.flags}
      disabled={props.disabled}
      onChange={(ev) => {
        props.onChange({
          ...props.value,
          data: {
            ...props.value.data,
            flags: ev,
          },
        });
      }}
    />
  </div>
);
