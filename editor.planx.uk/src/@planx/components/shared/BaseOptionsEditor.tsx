import React, { ReactNode } from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option } from ".";
import { FlagsSelect } from "./FlagsSelect";

export interface BaseOptionsEditorProps {
  value: Option;
  showValueField?: boolean;
  showDescriptionField?: boolean;
  onChange: (newVal: Option) => void;
  children?: ReactNode;
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
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                text: ev.target.value,
              },
            });
          }}
          placeholder="Option"
        />
      </InputRowItem>
      <ImgInput
        img={props.value.data.img}
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
      <InputRow>
        <Input
          format="data"
          value={props.value.data.val || ""}
          placeholder="Data Value"
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                val: ev.target.value,
              },
            });
          }}
        />
      </InputRow>
    )}
    <FlagsSelect
      value={props.value.data.flags}
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
