import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import { visuallyHidden } from "@mui/utils";
import type {
  ChecklistField,
  NumberField,
  QuestionField,
  TextField,
} from "@planx/components/List/model";
import { getIn } from "formik";
import get from "lodash/get";
import React from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../shared/constants";
import BasicRadio from "../../shared/Radio/BasicRadio";
import { useMapAndLabelContext } from "./Context";

type Props<T> = T & { id: string };

export const TextFieldInput: React.FC<Props<TextField>> = ({ id, data }) => {
  const { formik, activeIndex } = useMapAndLabelContext();

  return (
    <InputLabel label={data.title} htmlFor={id}>
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
        errorMessage={get(formik.errors, ["userData", activeIndex, data.fn])}
        id={id}
        rows={
          data.type && ["long", "extraLong"].includes(data.type) ? 5 : undefined
        }
        name={`userData[${activeIndex}]['${data.fn}']`}
        required
        inputProps={{
          "aria-describedby": [
            data.description ? DESCRIPTION_TEXT : "",
            get(formik.errors, ["userData", activeIndex, data.fn])
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
}) => {
  const { formik, activeIndex } = useMapAndLabelContext();

  return (
    <InputLabel label={data.title} htmlFor={id}>
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Input
          required
          bordered
          name={`userData[${activeIndex}]['${data.fn}']`}
          type="number"
          value={formik.values.userData[activeIndex][data.fn]}
          onChange={formik.handleChange}
          errorMessage={get(formik.errors, ["userData", activeIndex, data.fn])}
          inputProps={{
            "aria-describedby": [
              data.description ? DESCRIPTION_TEXT : "",
              get(formik.errors, ["userData", activeIndex, data.fn])
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
  const { formik, activeIndex } = useMapAndLabelContext();
  const { id, data } = props;

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
        {data.title}
      </FormLabel>
      <ErrorWrapper
        id={`${id}-error`}
        error={get(formik.errors, ["userData", activeIndex, data.fn])}
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
  const { formik, activeIndex } = useMapAndLabelContext();
  const { id, data } = props;

  return (
    <InputLabel label={data.title} id={`select-label-${id}`}>
      <ErrorWrapper
        id={`${id}-error`}
        error={get(formik.errors, ["userData", activeIndex, data.fn])}
      >
        <SelectInput
          bordered
          required
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
            >
              {option.data.text}
            </MenuItem>
          ))}
        </SelectInput>
      </ErrorWrapper>
    </InputLabel>
  );
};

export const ChecklistFieldInput: React.FC<Props<ChecklistField>> = (props) => {
  const { formik, activeIndex } = useMapAndLabelContext();
  const {
    id,
    data: { options, title, fn },
  } = props;

  const changeCheckbox =
    (id: string) =>
    async (
      _checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined,
    ) => {
      let newCheckedIds;

      if (formik.values.userData[activeIndex][fn].includes(id)) {
        newCheckedIds = (
          formik.values.userData[activeIndex][fn] as string[]
        ).filter((x) => x !== id);
      } else {
        newCheckedIds = [...formik.values.userData[activeIndex][fn], id];
      }

      await formik.setFieldValue(
        `userData[${activeIndex}]['${fn}']`,
        newCheckedIds,
      );
    };

  return (
    <InputLabel label={title} id={`checklist-label-${id}`}>
      <ErrorWrapper
        error={getIn(formik.errors, `userData[${activeIndex}]['${fn}']`)}
        id={id}
      >
        <Grid container component="fieldset">
          <legend style={visuallyHidden}>{title}</legend>
          {options.map((option) => (
            <ChecklistItem
              onChange={changeCheckbox(option.id)}
              label={option.data.text}
              id={option.id}
              checked={formik.values.userData[activeIndex][fn].includes(
                option.id,
              )}
            />
          ))}
        </Grid>
      </ErrorWrapper>
    </InputLabel>
  );
};
