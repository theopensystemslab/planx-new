import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import SimpleMenu from "ui/editor/SimpleMenu";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option } from "../shared";
import { FlagsSelect } from "../shared/FlagsSelect";

export const OptionEditor: React.FC<{
  value: Option;
  onChange: (newVal: Option) => void;
  showValueField?: boolean;
  showDescriptionField?: boolean;
  index: number;
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
}> = (props) => (
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
    </InputRow>
    <InputRow>
      {props.showDescriptionField && (
        <Input
          value={props.value.data.description || ""}
          placeholder="Description"
          multiline
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                description: ev.target.value,
              },
            });
          }}
        />
      )}
      {typeof props.index !== "undefined" &&
        props.groups &&
        props.onMoveToGroup && (
          <SimpleMenu
            items={props.groups.map((group, groupIndex) => ({
              label: `Move to ${group || `group ${groupIndex}`}`,
              onClick: () => {
                props.onMoveToGroup &&
                  typeof props.index === "number" &&
                  props.onMoveToGroup(props.index, groupIndex);
              },
              disabled: groupIndex === props.groupIndex,
            }))}
          />
        )}
    </InputRow>
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
      value={
        Array.isArray(props.value.data.flag)
          ? props.value.data.flag
          : [props.value.data.flag]
      }
      onChange={(ev) => {
        props.onChange({
          ...props.value,
          data: {
            ...props.value.data,
            flag: ev,
          },
        });
      }}
    />
  </div>
);
