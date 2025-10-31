import MenuItem from "@mui/material/MenuItem";
import { SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { lowerCase, merge, upperFirst } from "lodash";
import React from "react";
import { ModalSubtitle } from "ui/editor/ModalSubtitle";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../DataFieldAutocomplete";
import { Condition, Rule } from "./types";
import { checkIfConditionalRule, formatRule } from "./utils";

const Operator = styled(Typography)(({ theme }) => ({
  alignSelf: "center",
  padding: theme.spacing(0, 1),
  // Counteract InputRow's default spacing
  marginLeft: -5,
}));

export interface Props {
  modalSubtitle?: string;
  rule: Rule;
  disabled?: boolean;
  onChange: (rule: Rule) => void;
  conditions?: Condition[];
}

export const RuleBuilder: React.FC<Props> = ({
  modalSubtitle = "Rule",
  rule,
  disabled,
  onChange,
  conditions = Object.values(Condition),
}) => {
  const isConditionalRule = checkIfConditionalRule(rule.condition);

  const handleConditionChange: SelectProps["onChange"] = (e) =>
    onChange(
      formatRule(Condition[e.target.value as keyof typeof Condition], rule),
    );

  const handleFnChange = (fn: string | null) => onChange(merge(rule, { fn }));

  const handleValChange = (val: string | null) =>
    onChange(merge(rule, { val }));

  return (
    <>
      <ModalSubtitle title={modalSubtitle} />
      <InputRow>
        <SelectInput
          value={rule.condition}
          disabled={disabled}
          onChange={handleConditionChange}
        >
          {conditions.map((condition) => (
            <MenuItem key={condition} value={condition}>
              {upperFirst(lowerCase(condition))}
            </MenuItem>
          ))}
        </SelectInput>
      </InputRow>
      {isConditionalRule && (
        <InputRow>
          <DataFieldAutocomplete
            required
            value={rule.fn}
            onChange={handleFnChange}
            disabled={disabled}
          />
          <Operator variant="body2">Equals</Operator>
          <DataFieldAutocomplete
            required
            schema={dataSchema}
            value={rule.val}
            onChange={handleValChange}
            placeholder="Value"
            disabled={disabled}
          />
        </InputRow>
      )}
    </>
  );
};
