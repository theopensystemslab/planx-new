import { styled } from "@mui/material/styles";
import React from "react";

import { Field, SchemaUserResponse } from "./../shared/Schema/model";

const List = styled("ul")(() => ({
  listStylePosition: "inside",
  padding: 0,
  margin: 0,
}));

/**
 * In the case of "question" and "checklist" fields, ensure the displayed value reflects option "text", rather than "val" as recorded in passport
 * @param value - the `val` or `text` of an Option defined in the schema's fields
 * @param field - the Field object
 * @returns string | React.JSX.Element - the `text` for the given value `val`, or the original value
 */
export function formatSchemaDisplayValue(
  value: string | string[],
  field: Field,
) {
  switch (field.type) {
    case "number":
      return field.data.units ? `${value} ${field.data.units}` : value;
    case "text":
    case "date":
      return value;
    case "checklist": {
      const matchingOptions = field.data.options.filter((option) =>
        (value as string[]).includes(option.id),
      );
      return (
        <List>
          {matchingOptions.map((option) => (
            <li key={option.id}>{option.data.text}</li>
          ))}
        </List>
      );
    }
    case "question": {
      const matchingOption = field.data.options.find(
        (option) => option.data.text === value || option.data.val === value,
      );
      return matchingOption?.data.text;
    }
    case "map": {
      const feature = value[0] as string as any; // won't be necessary to cast once we're only setting "geojsonData" prop in future
      const drawType = field.data.mapOptions?.drawType;

      switch (drawType) {
        case "Point":
          // Our "geojsonData" layer doesn't have a "point" style yet, so make due with center marker for now!
          //   Once style layers are more comprehensive, share same map as "Polygon" style here
          return (
            <>
              {/* @ts-ignore */}
              <my-map
                id="inactive-list-map"
                basemap={field.data.mapOptions?.basemap}
                latitude={feature.geometry.coordinates[1]}
                longitude={feature.geometry.coordinates[0]}
                zoom={19}
                showCentreMarker
                markerLatitude={feature.geometry.coordinates[1]}
                markerLongitude={feature.geometry.coordinates[0]}
                markerColor={field.data.mapOptions?.drawColor}
                osProxyEndpoint={`${
                  import.meta.env.VITE_APP_API_URL
                }/proxy/ordnance-survey`}
                hideResetControl
                staticMode
                style={{ width: "100%", height: "30vh" }}
                osCopyright={
                  field.data.mapOptions?.basemap === "OSVectorTile"
                    ? `© Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`
                    : ``
                }
                mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN}
                collapseAttributions
              />
            </>
          );
        case "Polygon":
          return (
            <>
              {/* @ts-ignore */}
              <my-map
                id="inactive-list-map"
                basemap={field.data.mapOptions?.basemap}
                geojsonData={JSON.stringify(feature)}
                geojsonColor={field.data.mapOptions?.drawColor}
                geojsonFill
                geojsonBuffer={20}
                osProxyEndpoint={`${
                  import.meta.env.VITE_APP_API_URL
                }/proxy/ordnance-survey`}
                hideResetControl
                staticMode
                style={{ width: "100%", height: "30vh" }}
                osCopyright={
                  field.data.mapOptions?.basemap === "OSVectorTile"
                    ? `© Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`
                    : ``
                }
                mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN}
                collapseAttributions
              />
            </>
          );
      }
    }
  }
}

/**
 * If the schema includes a field that sets fn = "identicalUnits", sum of total units
 * @param fn - passport key of current List
 * @param passportData - default passport data format for the List
 * @returns - sum of all units, or 0 if field not set
 */
export function sumIdenticalUnits(
  fn: string,
  passportData: Record<string, SchemaUserResponse[]>,
): number {
  let sum = 0;
  passportData[`${fn}`].map((item) => {
    if (!Array.isArray(item?.identicalUnits)) {
      sum += parseInt(item?.identicalUnits);
    }
  });
  return sum;
}

/**
 * If the schema includes fields that set fn = "development" and fn = "identicalUnits", sum of total units by development option "val"
 * @param fn - passport key of current List
 * @param passportData - default passport data format for the List
 * @returns - sum of all units by development type, or empty object if fields not set
 */
export function sumIdenticalUnitsByDevelopmentType(
  fn: string,
  passportData: Record<string, SchemaUserResponse[]>,
): Record<string, number> {
  // Sum identical units by development type (@todo read all possible option `val` from Schema in future)
  const baseSums: Record<string, number> = {
    changeOfUse: 0,
    changeOfUseFrom: 0,
    changeOfUseTo: 0,
    conversion: 0,
    gain: 0,
    extension: 0,
    loss: 0,
    newBuild: 0,
    notKnown: 0,
  };
  passportData[`${fn}`].map((item) => {
    if (!Array.isArray(item?.identicalUnits)) {
      baseSums[`${item?.development}`] += parseInt(item?.identicalUnits);
    }
  });

  // Format property names for passport, and filter out any entries with default sum = 0
  const formattedSums: Record<string, number> = {};
  Object.entries(baseSums).forEach(([k, v]) => {
    if (v > 0) {
      formattedSums[`${fn}.total.units.development.${k}`] = v;
    }
  });

  return formattedSums;
}

interface FlattenOptions {
  depth?: number;
  path?: string | null;
  separator?: string;
}

/**
 * Flattens nested object so we can output passport variables like `{listFn}.{itemIndexAsText}.{fieldFn}`
 *   Adapted from https://gist.github.com/penguinboy/762197
 */
export function flatten<T extends Record<string, any>>(
  object: T,
  { depth = Infinity, path = null, separator = "." }: FlattenOptions = {},
): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const value = object[key];

    // If the key is a whole number, convert to text before setting newPath
    //   eg because Calculate/MathJS cannot automate passport variables with number segments
    if (/^-?\d+$/.test(key)) {
      key = convertNumberToText(parseInt(key) + 1);
    }

    const newPath = [path, key].filter(Boolean).join(separator);

    const isObject = [
      typeof value === "object",
      value !== null,
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject && depth > 0
      ? {
          ...acc,
          ...flatten(value, { depth: depth - 1, path: newPath, separator }),
        }
      : { ...acc, [newPath]: value };
  }, {} as T);
}

const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];
const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];
const teens = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

function convertTens(num: number): string {
  if (num < 10) {
    return ones[num];
  } else if (num >= 10 && num < 20) {
    return teens[num - 10];
  } else {
    // format as compound string - eg "thirtyfour" instead of "thirty four"
    return tens[Math.floor(num / 10)] + ones[num % 10];
  }
}

/**
 * Convert a whole number up to 99 to a spelled-out word (eg 34 => 'thirtyfour')
 *   Adapted from https://stackoverflow.com/questions/5529934/javascript-numbers-to-words
 */
function convertNumberToText(num: number): string {
  if (num == 0) {
    return "zero";
  } else {
    return convertTens(num);
  }
}
