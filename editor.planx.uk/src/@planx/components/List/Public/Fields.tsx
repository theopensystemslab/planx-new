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
  MapField,
  NumberField,
  QuestionField,
  TextField,
} from "@planx/components/shared/Schema/model";
import { getIn } from "formik";
import { Feature } from "geojson";
import { get } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import DateInput from "ui/shared/DateInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../shared/constants";
import BasicRadio from "../../shared/Radio/BasicRadio";
import { useListContext } from "./Context";

type Props<T> = T & { id: string };

export const TextFieldInput: React.FC<Props<TextField>> = ({ id, data }) => {
  const { formik, activeIndex } = useListContext();

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
  const { formik, activeIndex } = useListContext();

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
  const { formik, activeIndex } = useListContext();
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
  const { formik, activeIndex } = useListContext();
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
  const { formik, activeIndex } = useListContext();
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
              key={option.id}
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

export const DateFieldInput: React.FC<Props<DateField>> = ({ id, data }) => {
  const { formik, activeIndex } = useListContext();

  return (
    <InputLabel label={data.title} htmlFor={id}>
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <DateInput
          value={formik.values.userData[activeIndex][data.fn] as string}
          bordered
          onChange={(newDate: string, eventType: string) => {
            formik.setFieldValue(
              `userData[${activeIndex}]['${data.fn}']`,
              paddedDate(newDate, eventType),
            );
          }}
          error={get(formik.errors, ["userData", activeIndex, data.fn])}
          id={id}
        />
      </Box>
    </InputLabel>
  );
};

export const MapFieldInput: React.FC<Props<MapField>> = (props) => {
  const { formik, activeIndex, schema } = useListContext();
  const {
    id,
    data: { title, fn, mapOptions },
  } = props;

  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  const [_features, setFeatures] = useState<Feature[] | undefined>(undefined);

  useEffect(() => {
    const geojsonChangeHandler = async ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
        await formik.setFieldValue(
          `userData[${activeIndex}]['${fn}']`,
          geojson["EPSG:3857"].features,
        );
      } else {
        // if the user clicks 'reset' on the map, geojson will be empty object, so set features to undefined
        setFeatures(undefined);
        await formik.setFieldValue(
          `userData[${activeIndex}]['${fn}']`,
          undefined,
        );
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
        error={getIn(formik.errors, `userData[${activeIndex}]['${fn}']`)}
        id={id}
      >
        <MapContainer environment="standalone">
          {/* @ts-ignore */}
          <my-map
            id={id}
            ariaLabelOlFixedOverlay={`An interactive map for plotting and describing ${schema.type.toLocaleLowerCase()}`}
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
