import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import React from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT } from "../../shared/constants";
import BasicRadio from "../../shared/Radio/BasicRadio";
import type { NumberField, QuestionField, TextField } from "../model";

type Props<T> = T & { id: string };

export const TextFieldInput: React.FC<Props<TextField>> = ({
  id,
  data,
  required,
}) => (
  <InputLabel label={data.title} htmlFor={id}>
    <Input
      type={((type) => {
        if (type === "email") return "email";
        else if (type === "phone") return "tel";
        return "text";
      })(data.type)}
      multiline={data.type && ["long", "extraLong"].includes(data.type)}
      bordered
      id={id}
      rows={
        data.type && ["long", "extraLong"].includes(data.type) ? 5 : undefined
      }
      name="text"
      required={required}
      inputProps={{
        "aria-describedby": [
          data.description ? DESCRIPTION_TEXT : "",
          // TODO: When handling errors, revisit this
          // formik.errors.text ? `${ERROR_MESSAGE}-${inputFieldId}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      }}
    />
  </InputLabel>
);

export const NumberFieldInput: React.FC<Props<NumberField>> = ({
  id,
  data,
  required,
}) => (
  <InputLabel label={data.title} htmlFor={id}>
    <Box sx={{ display: "flex", alignItems: "baseline" }}>
      <Input
        required={required}
        bordered
        name="value"
        type="number"
        // value={formik.values.value}
        // onChange={formik.handleChange}
        // errorMessage={formik.errors.value as string}
        inputProps={{
          "aria-describedby": [
            data.description ? DESCRIPTION_TEXT : "",
            // formik.errors.value ? `${ERROR_MESSAGE}-${props.id}` : "",
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

export const RadioFieldInput: React.FC<Props<QuestionField>> = ({
  id,
  data,
}) => (
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
      {data.title}
    </FormLabel>
    {/* <ErrorWrapper id={props.id} error={formik.errors.selected?.id}> */}
    <RadioGroup
      aria-labelledby={`radio-buttons-group-label-${id}`}
      name={`radio-buttons-group-${id}`}
      sx={{ p: 1 }}
      // value={formik.values.selected.id}
    >
      {data.options.map(({ id, data }) => (
        <BasicRadio
          id={id}
          title={data.text}
          onChange={() => console.log("change radio")}
        />
      ))}
    </RadioGroup>
    {/* </ErrorWrapper> */}
  </FormControl>
);

export const SelectFieldInput: React.FC<Props<QuestionField>> = ({
  id,
  data,
  required,
}) => (
  <InputLabel label={data.title} id={`select-label-${id}`}>
    <SelectInput
      bordered
      required={required}
      title={data.title}
      labelId={`select-label-${id}`}
    >
      {data.options.map((option) => (
        <MenuItem
          key={option.id}
          // value={option.data.text}
        >
          {option.data.text}
        </MenuItem>
      ))}
    </SelectInput>
  </InputLabel>
);
