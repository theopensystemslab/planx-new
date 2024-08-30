import { useSchema } from "@planx/components/shared/Schema/hook";
import { Schema, SchemaUserData } from "@planx/components/shared/Schema/model";
import {
  getPreviouslySubmittedData,
  makeData,
} from "@planx/components/shared/utils";
import { FormikProps, useFormik } from "formik";
import { Feature } from "geojson";
import { GeoJSONChange, GeoJSONChangeEvent, useGeoJSONChange } from "lib/gis";
import { get } from "lodash";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

import { PresentationalProps } from ".";

export const MAP_ID = "map-and-label-map";

interface MapAndLabelContextValue {
  schema: Schema;
  features?: Feature[];
  activeIndex: number;
  editFeature: (index: number) => void;
  formik: FormikProps<SchemaUserData>;
  validateAndSubmitForm: () => void;
  isFeatureInvalid: (index: number) => boolean;
  copyFeature: (sourceIndex: number, destinationIndex: number) => void;
  removeFeature: (index: number) => void;
  mapAndLabelProps: PresentationalProps;
  errors: {
    min: boolean;
    max: boolean;
  };
}

type MapAndLabelProviderProps = PropsWithChildren<PresentationalProps>;

const MapAndLabelContext = createContext<MapAndLabelContextValue | undefined>(
  undefined,
);

export const MapAndLabelProvider: React.FC<MapAndLabelProviderProps> = (
  props,
) => {
  const { schema, children, handleSubmit } = props;
  const { formikConfig, initialValues } = useSchema({
    schema,
    previousValues: getPreviouslySubmittedData(props),
  });

  const formik = useFormik<SchemaUserData>({
    ...formikConfig,
    // The user interactions are map driven - start with no values added
    initialValues: { schemaData: [] },
    onSubmit: (values) => {
      const defaultPassportData = makeData(props, values.schemaData)?.["data"];

      handleSubmit?.({
        data: {
          ...defaultPassportData,
        },
      });
    },
  });

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [minError, setMinError] = useState<boolean>(false);
  const [maxError, setMaxError] = useState<boolean>(false);

  const handleGeoJSONChange = (event: GeoJSONChangeEvent) => {
    // If the user clicks 'reset' on the map, geojson will be empty object
    const userHitsReset = !event.detail["EPSG:3857"];

    if (userHitsReset) {
      removeAllFeaturesFromMap();
      removeAllFeaturesFromForm();
      return;
    }

    addFeatureToMap(event.detail);
    addFeatureToForm();
  };

  const [features, setFeatures] = useGeoJSONChange(MAP_ID, handleGeoJSONChange);

  const resetErrors = () => {
    setMinError(false);
    setMaxError(false);
  };

  const removeAllFeaturesFromMap = () => setFeatures(undefined);

  const removeAllFeaturesFromForm = () => {
    formik.setFieldValue("schemaData", []);
    setActiveIndex(-1);
  };

  const validateAndSubmitForm = () => {
    // Manually validate minimum number of features
    if (formik.values.schemaData.length < schema.min) {
      return setMinError(true);
    }

    formik.handleSubmit();
  };

  const editFeature = (index: number) => {
    setActiveIndex(index);
  };

  const isFeatureInvalid = (index: number) =>
    Boolean(get(formik.errors, ["schemaData", index]));

  const addFeatureToMap = (geojson: GeoJSONChange) =>
    setFeatures(geojson["EPSG:3857"].features);

  const addFeatureToForm = () => {
    resetErrors();

    const currentFeatures = formik.values.schemaData;
    const updatedFeatures = [...currentFeatures, initialValues];
    formik.setFieldValue("schemaData", updatedFeatures);

    // TODO: Handle more gracefully - stop user from adding new feature to map?
    if (schema.max && updatedFeatures.length > schema.max) {
      setMaxError(true);
    }

    setActiveIndex(activeIndex + 1);
  };

  const copyFeature = (sourceIndex: number, destinationIndex: number) => {
    const sourceFeature = formik.values.schemaData[sourceIndex];
    formik.setFieldValue(`schemaData[${destinationIndex}]`, sourceFeature);
  };

  const removeFeatureFromForm = (index: number) => {
    formik.setFieldValue(
      "schemaData",
      formik.values.schemaData.filter((_, i) => i !== index),
    );
  };

  const removeFeature = (index: number) => {
    resetErrors();
    setActiveIndex(activeIndex - 1);
    removeFeatureFromForm(index);

    // TODO! Remove a single feature
    // removeFeatureFromMap()
  };

  return (
    <MapAndLabelContext.Provider
      value={{
        features,
        activeIndex,
        schema,
        mapAndLabelProps: props,
        editFeature,
        formik,
        validateAndSubmitForm,
        copyFeature,
        removeFeature,
        isFeatureInvalid,
        errors: {
          min: minError,
          max: maxError,
        },
      }}
    >
      {children}
    </MapAndLabelContext.Provider>
  );
};

export const useMapAndLabelContext = (): MapAndLabelContextValue => {
  const context = useContext(MapAndLabelContext);
  if (!context) {
    throw new Error(
      "useMapAndLabelContext must be used within a MapAndLabelProvider",
    );
  }
  return context;
};
