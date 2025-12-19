import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { ComponentType } from "@opensystemslab/planx-core/types";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option } from "../../Option/model";
import { DataFieldAutocomplete } from "../DataFieldAutocomplete";
import { FlagsSelect } from "../FlagsSelect";
import { RuleBuilder } from "../RuleBuilder";
import { Condition } from "../RuleBuilder/types";
import { Props } from "./types";

export const BaseOptionsEditor: React.FC<Props> = (props) => {
  const updateSharedField = <K extends keyof Option["data"]>(
    key: K,
    value: Option["data"][K],
  ) => {
    switch (props.type) {
      // Option
      case ComponentType.Question:
      case ComponentType.Checklist:
        props.onChange({
          ...props.value,
          data: { ...props.value.data, [key]: value },
        });
        break;

      // ConditionalOption
      case ComponentType.ResponsiveQuestion:
      case ComponentType.ResponsiveChecklist:
        props.onChange({
          ...props.value,
          data: { ...props.value.data, [key]: value },
        });
        break;
    }
  };

  const showRuleBuilder =
    props.type === ComponentType.ResponsiveQuestion ||
    props.type === ComponentType.ResponsiveChecklist;

  return (
    <Box
      id={props.value.id}
      sx={(theme) => ({
        scrollMarginTop: theme.spacing(1),
        width: "100%",
      })}
    >
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
            onChange={(ev) => updateSharedField("text", ev.target.value)}
            placeholder={props.optionPlaceholder || "Option"}
          />
        </InputRowItem>
        <ImgInput
          img={props.value.data.img}
          disabled={props.disabled}
          onChange={(img) => updateSharedField("img", img)}
        />
        {props.children}
      </InputRow>
      <Collapse in={!props.isCollapsed} timeout="auto">
        {props.showDescriptionField && (
          <InputRow>
            <Input
              value={props.value.data.description || ""}
              placeholder="Description"
              multiline
              disabled={props.disabled}
              onChange={(ev) =>
                updateSharedField("description", ev.target.value)
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
            onChange={(targetValue) =>
              updateSharedField("val", targetValue ?? "")
            }
          />
        )}
        <FlagsSelect
          value={props.value.data.flags}
          disabled={props.disabled}
          onChange={(ev) => updateSharedField("flags", ev)}
        />
        {showRuleBuilder && (
          <RuleBuilder
            labels={{
              [Condition.AlwaysRequired]: "Always show",
              [Condition.RequiredIf]: "Show if",
            }}
            dataSchema={[]}
            conditions={[Condition.AlwaysRequired, Condition.RequiredIf]}
            disabled={props.disabled}
            rule={props.value.data.rule}
            onChange={(rule) =>
              props.onChange({
                ...props.value,
                data: {
                  ...props.value.data,
                  rule,
                },
              })
            }
          />
        )}
      </Collapse>
    </Box>
  );
};
