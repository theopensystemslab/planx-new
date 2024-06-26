import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import { Option } from "@planx/components/shared";
import { getIn } from "formik";
import React from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../shared/constants";
import BasicRadio from "../../shared/Radio/BasicRadio";
import type { NumberField, QuestionField, TextField } from "../model";
import { useListContext } from "./Context";

type Props<T> = T & { id: string };

export const TextFieldInput: React.FC<Props<TextField>> = ({
  id,
  data,
  required,
}) => {
  const { formik, activeIndex } = useListContext();

  return (
    <InputLabel
      label={required === false ? data.title + " (optional)" : data.title}
      htmlFor={id}
    >
      <Input
        type={((type) => {
          if (type === "email") return "email";
          else if (type === "phone") return "tel";
          return "text";
        })(data.type)}
        multiline={data.type && ["long", "extraLong"].includes(data.type)}
        bordered
        value={formik.values.userData[activeIndex][data.fn]}
        onChange={formik.handleChange}
        errorMessage={getIn(
          formik.errors,
          `userData[${activeIndex}][${data.fn}]`,
        )}
        id={id}
        rows={
          data.type && ["long", "extraLong"].includes(data.type) ? 5 : undefined
        }
        name={`userData[${activeIndex}]['${data.fn}']`}
        required={required}
        inputProps={{
          "aria-describedby": [
            data.description ? DESCRIPTION_TEXT : "",
            getIn(formik.errors, `userData[${activeIndex}][${data.fn}]`)
              ? `${ERROR_MESSAGE}-${id}`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        }}
      />
    </InputLabel>
  );
};

export const NumberFieldInput: React.FC<Props<NumberField>> = ({
  id,
  data,
  required,
}) => {
  const { formik, activeIndex } = useListContext();

  return (
    <InputLabel
      label={required === false ? data.title + " (optional)" : data.title}
      htmlFor={id}
    >
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Input
          required={required}
          bordered
          name={`userData[${activeIndex}]['${data.fn}']`}
          type="number"
          value={formik.values.userData[activeIndex][data.fn]}
          onChange={formik.handleChange}
          errorMessage={getIn(
            formik.errors,
            `userData[${activeIndex}][${data.fn}]`,
          )}
          inputProps={{
            "aria-describedby": [
              data.description ? DESCRIPTION_TEXT : "",
              getIn(formik.errors, `userData[${activeIndex}][${data.fn}]`)
                ? `${ERROR_MESSAGE}-${id}`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
          }}
          id={id}
        />
        {data.units && <InputRowLabel>{data.units}</InputRowLabel>}
      </Box>
    </InputLabel>
  );
};

export const RadioFieldInput: React.FC<Props<QuestionField>> = (props) => {
  const { formik, activeIndex } = useListContext();
  const { id, data, required } = props;

  return (
    <FormControl sx={{ width: "100%" }} component="fieldset">
      <FormLabel
        component="legend"
        id={`radio-buttons-group-label-${id}`}
        sx={(theme) => ({
          color: theme.palette.text.primary,
          "&.Mui-focused": {
            color: theme.palette.text.primary,
          },
        })}
      >
        {required === false ? data.title + " (optional)" : data.title}
      </FormLabel>
      <ErrorWrapper
        id={`${id}-error`}
        error={getIn(formik.errors, `userData[${activeIndex}][${data.fn}]`)}
      >
        <RadioGroup
          aria-labelledby={`radio-buttons-group-label-${id}`}
          name={`userData[${activeIndex}]['${data.fn}']`}
          sx={{ p: 1, mb: -2 }}
          value={formik.values.userData[activeIndex][data.fn]}
        >
          {data.options.map(({ id, data }) => (
            <BasicRadio
              key={id}
              id={data.val || data.text}
              title={data.text}
              onChange={formik.handleChange}
            />
          ))}
        </RadioGroup>
      </ErrorWrapper>
    </FormControl>
  );
};

export const SelectFieldInput: React.FC<Props<QuestionField>> = (props) => {
  const { formik, activeIndex } = useListContext();
  const { id, data, required } = props;

  const isDisabled = (option: Option) => {
    if (!props.unique) return false;

    const existingValues = formik.values.userData
      .map((response) => response[data.fn])
      .filter(
        (value) => value === option.data.val || value === option.data.text,
      );

    return existingValues.includes(option.data.val || option.data.text);
  };

  return (
    <InputLabel
      label={required === false ? data.title + " (optional)" : data.title}
      id={`select-label-${id}`}
    >
      <ErrorWrapper
        id={`${id}-error`}
        error={getIn(formik.errors, `userData[${activeIndex}][${data.fn}]`)}
      >
        <SelectInput
          bordered
          required={required}
          title={data.title}
          labelId={`select-label-${id}`}
          value={formik.values.userData[activeIndex][data.fn]}
          onChange={formik.handleChange}
          name={`userData[${activeIndex}]['${data.fn}']`}
        >
          {data.options.map((option) => (
            <MenuItem
              key={option.id}
              value={option.data.val || option.data.text}
              disabled={isDisabled(option)}
            >
              {option.data.text}
            </MenuItem>
          ))}
        </SelectInput>
      </ErrorWrapper>
    </InputLabel>
  );
};
