import MenuItem from "@mui/material/MenuItem";
import { SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { lowerCase, merge, upperFirst } from "lodash";
import React from "react";
import { ModalSubtitle } from "ui/editor/ModalSubtitle";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import SelectInput from "ui/shared/SelectInput/SelectInput";

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
  dataSchema?: string[];
  /**
   * Override the default condition titles with custom labels
   */
  labels?: Partial<Record<Condition, string>>;
}

export const RuleBuilder: React.FC<Props> = ({
  modalSubtitle = "Rule",
  rule,
  disabled,
  onChange,
  dataSchema,
  labels,
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
              {labels?.[condition] || upperFirst(lowerCase(condition))}
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
          {dataSchema ? (
            <DataFieldAutocomplete
              required
              schema={dataSchema}
              value={rule.val}
              onChange={handleValChange}
              placeholder="Value"
              disabled={disabled}
            />
          ) : (
            <Input
              required
              name="val"
              value={rule.val}
              onChange={(e) => handleValChange(e.target.value)}
              placeholder="Value"
              disabled={disabled}
            />
          )}
        </InputRow>
      )}
    </>
  );
};
