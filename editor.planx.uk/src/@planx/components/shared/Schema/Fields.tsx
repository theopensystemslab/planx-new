import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import { visuallyHidden } from "@mui/utils";
import { paddedDate } from "@planx/components/DateInput/model";
import { MapContainer } from "@planx/components/shared/Preview/MapContainer";
import type {
  ChecklistField,
  DateField,
  Field,
  MapField,
  NumberField,
  QuestionField,
  TextField,
} from "@planx/components/shared/Schema/model";
import { FormikHandlers, FormikHelpers } from "formik";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import DateInput from "ui/shared/DateInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../constants";
import BasicRadio from "../Radio/BasicRadio";

type BaseProps<T extends Field> = {
  id: string;
  errorMessage: string;
  value: unknown;
  name: string
} & T;

type Props<T extends Field> = { 
  onChange: FormikHandlers["handleChange"]
} & BaseProps<T>

type DateFieldProps = {
  onChange: FormikHelpers<unknown>["setFieldValue"]
  value: string;
} & BaseProps<DateField>

type ChecklistFieldProps = {
  onChange: FormikHelpers<unknown>["setFieldValue"]
  value: string[];
} & BaseProps<ChecklistField>

type MapFieldProps = {
  onChange: FormikHelpers<unknown>["setFieldValue"]
  value: string[];
} & BaseProps<MapField>

export const TextFieldInput: React.FC<Props<TextField>> = (props) => {

  return (
    <InputLabel label={props.data.title} htmlFor={props.id}>
      <Input
        {...props}
        type={((type) => {
          if (type === "email") return "email";
          else if (type === "phone") return "tel";
          return "text";
        })(props.data.type)}
        multiline={props.data.type && ["long", "extraLong"].includes(props.data.type)}
        bordered
        rows={
          props.data.type && ["long", "extraLong"].includes(props.data.type) ? 5 : undefined
        }
        required
        inputProps={{
          "aria-describedby": [
            props.data.description ? DESCRIPTION_TEXT : "",
            props.errorMessage
              ? `${ERROR_MESSAGE}-${props.id}`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        }}
      />
    </InputLabel>
  );
};

export const NumberFieldInput: React.FC<Props<NumberField>> = (props) => {

  return (
    <InputLabel label={props.data.title} htmlFor={props.id}>
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Input
          {...props}
          required
          bordered
          type="number"
          inputProps={{
            "aria-describedby": [
              props.data.description ? DESCRIPTION_TEXT : "",
              props.errorMessage
                ? `${ERROR_MESSAGE}-${props.id}`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
          }}
        />
        {props.data.units && <InputRowLabel>{props.data.units}</InputRowLabel>}
      </Box>
    </InputLabel>
  );
};

export const RadioFieldInput: React.FC<Props<QuestionField>> = ({
  id, data, name, value, onChange, errorMessage,
}) => {
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
        error={errorMessage}
      >
        <RadioGroup
          aria-labelledby={`radio-buttons-group-label-${id}`}
          name={name}
          sx={{ p: 1, mb: -2 }}
          value={value}
        >
          {data.options.map(({ id, data }) => (
            <BasicRadio
              key={id}
              id={data.val || data.text}
              title={data.text}
              onChange={onChange}
            />
          ))}
        </RadioGroup>
      </ErrorWrapper>
    </FormControl>
  );
};

export const SelectFieldInput: React.FC<Props<QuestionField>> = ({ id, data, errorMessage, name, value, onChange }) => {
  return (
    <InputLabel label={data.title} id={`select-label-${id}`}>
      <ErrorWrapper
        id={`${id}-error`}
        error={errorMessage}
      >
        <SelectInput
          bordered
          required
          title={data.title}
          labelId={`select-label-${id}`}
          value={value}
          onChange={onChange}
          name={name}
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

export const ChecklistFieldInput: React.FC<ChecklistFieldProps> = (props) => {
  const {
    id,
    data: { options, title },
    name,
    value,
    errorMessage,
    onChange,
  } = props;

  const changeCheckbox =
    (id: string) =>
    async (
      _checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined,
    ) => {
      let newCheckedIds;

      if (value.includes(id)) {
        newCheckedIds = (
          value as string[]
        ).filter((x) => x !== id);
      } else {
        newCheckedIds = [...value, id];
      }

      await onChange(name, newCheckedIds);
    };

  return (
    <InputLabel label={title} id={`checklist-label-${id}`}>
      <ErrorWrapper
        error={errorMessage}
        id={id}
      >
        <Grid container component="fieldset">
          <legend style={visuallyHidden}>{title}</legend>
          {options.map((option) => (
            <ChecklistItem
              key={option.id}
              onChange={changeCheckbox(option.id)}
              label={option.data.text}
              id={option.id}
              checked={value.includes(
                option.id,
              )}
            />
          ))}
        </Grid>
      </ErrorWrapper>
    </InputLabel>
  );
};

export const DateFieldInput: React.FC<DateFieldProps> = ({
  id,
  data,
  errorMessage,
  onChange,
  value,
  name
}) => {
  return (
    <InputLabel label={data.title} htmlFor={id}>
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <DateInput
          value={value}
          bordered
          onChange={(newDate: string, eventType: string) => {
            onChange(name, paddedDate(newDate, eventType));
          }}
          error={errorMessage}
          id={id}
        />
      </Box>
    </InputLabel>
  );
};

export const MapFieldInput: React.FC<MapFieldProps> = (props) => {
  const {
    id,
    name,
    data: { title, mapOptions },
  } = props;

  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  const [_features, setFeatures] = useState<Feature[] | undefined>(undefined);

  useEffect(() => {
    const geojsonChangeHandler = async ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
        props.onChange(name, geojson["EPSG:3857"].features)
      } else {
        // if the user clicks 'reset' on the map, geojson will be empty object, so set features to undefined
        setFeatures(undefined);
        props.onChange(name, undefined)
      }
    };

    const map: any = document.getElementById(id);

    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setFeatures]);

  return (
    <InputLabel label={title} id={`map-label-${id}`} htmlFor={id}>
      <ErrorWrapper
        error={props.errorMessage}
        id={id}
      >
        <MapContainer environment="standalone">
          {/* @ts-ignore */}
          <my-map
            id={id}
            // TODO
            // ariaLabelOlFixedOverlay={`An interactive map for plotting and describing ${schema.type.toLocaleLowerCase()}`}
            height={400}
            basemap={mapOptions?.basemap}
            drawMode
            drawMany={mapOptions?.drawMany}
            drawColor={mapOptions?.drawColor}
            drawType={mapOptions?.drawType}
            drawPointer="crosshair"
            zoom={20}
            maxZoom={23}
            latitude={Number(passport?.data?._address?.latitude)}
            longitude={Number(passport?.data?._address?.longitude)}
            osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
            osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
            clipGeojsonData={
              teamSettings?.boundaryBBox &&
              JSON.stringify(teamSettings?.boundaryBBox)
            }
          />
        </MapContainer>
      </ErrorWrapper>
    </InputLabel>
  );
};
