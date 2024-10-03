import { useSchema } from "@planx/components/shared/Schema/hook";
import {
  Schema,
  SchemaUserData,
  SchemaUserResponse,
} from "@planx/components/shared/Schema/model";
import {
  getPreviouslySubmittedData,
  makeData,
} from "@planx/components/shared/utils";
import { FormikProps, useFormik } from "formik";
import { Feature, FeatureCollection } from "geojson";
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
  updateMapKey: number;
  activeIndex: number;
  formik: FormikProps<SchemaUserData>;
  validateAndSubmitForm: () => void;
  isFeatureInvalid: (index: number) => boolean;
  addInitialFeaturesToMap: (features: Feature[]) => void;
  editFeatureInForm: (index: number) => void;
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
  const { schema, children, handleSubmit, previouslySubmittedData, fn } = props;
  const { formikConfig, initialValues } = useSchema({
    schema,
    previousValues: getPreviouslySubmittedData(props),
  });

  // Deconstruct GeoJSON saved to passport back into form data and map data
  const previousGeojson = previouslySubmittedData?.data?.[
    fn
  ] as FeatureCollection;
  const previousFormData = previousGeojson?.features.map(
    (feature) => feature.properties,
  ) as SchemaUserResponse[];
  const _previousMapData = previousGeojson?.features;

  const formik = useFormik<SchemaUserData>({
    ...formikConfig,
    // The user interactions are map driven - start with no values added
    initialValues: {
      schemaData: previousFormData || [],
    },
    onSubmit: (values) => {
      const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      features?.forEach((feature, i) => {
        // Store user inputs as GeoJSON properties
        const mergedProperties = {
          ...feature.properties,
          ...values.schemaData[i],
        };
        feature["properties"] = mergedProperties;
        geojson.features.push(feature);
      });

      const defaultPassportData = makeData(props, geojson)?.["data"];

      handleSubmit?.({
        data: {
          ...defaultPassportData,
        },
      });
    },
  });

  const [activeIndex, setActiveIndex] = useState<number>(
    previousFormData?.length - 1 || -1,
  );

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

    if (event.detail) {
      // If the user added a feature to the map, the dispatched event will contain more features than form state
      const userAddedFeature =
        event.detail["EPSG:3857"].features.length >
        formik.values.schemaData.length;

      if (userAddedFeature) {
        addFeatureToMap(event.detail);
        addFeatureToForm();
      } else {
        const modifiedFeatures = event.detail["EPSG:3857"].features;
        setFeatures(modifiedFeatures);

        // If the user is editing an existing feature on the map, the modified feature aka active tab should be last item in features
        const lastModifiedFeature =
          event.detail["EPSG:3857"].features.slice(-1)[0];
        const lastModifiedLabel = lastModifiedFeature?.properties?.label;
        setActiveIndex(parseInt(lastModifiedLabel) - 1);
      }
    }
  };

  const [features, setFeatures] = useGeoJSONChange(MAP_ID, handleGeoJSONChange);

  const [updateMapKey, setUpdateMapKey] = useState<number>(0);

  const resetErrors = () => {
    setMinError(false);
    setMaxError(false);
    formik.setErrors({});
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

  const editFeatureInForm = (index: number) => {
    setActiveIndex(index);
  };

  const isFeatureInvalid = (index: number) =>
    Boolean(get(formik.errors, ["schemaData", index]));

  const addFeatureToMap = (geojson: GeoJSONChange) => {
    resetErrors();

    const newFeatures = geojson["EPSG:3857"].features;
    setFeatures(newFeatures);

    setActiveIndex(newFeatures.length - 1);
  };

  const addInitialFeaturesToMap = (features: Feature[]) => {
    setFeatures(features);
  };

  const addFeatureToForm = () => {
    resetErrors();

    const currentFeatures = formik.values.schemaData;
    const updatedFeatures = [...currentFeatures, initialValues];
    formik.setFieldValue("schemaData", updatedFeatures);

    // TODO: Handle more gracefully - stop user from adding new feature to map?
    if (schema.max && updatedFeatures.length > schema.max) {
      setMaxError(true);
    }
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

  const removeFeatureFromMap = (index: number) => {
    // Order of features can vary by change/modification, filter on label not array position
    const label = `${index + 1}`;
    const filteredFeatures = features?.filter(
      (f) => f.properties?.label !== label,
    );

    // Shift any feature labels that are larger than the removed feature label so they remain incremental
    filteredFeatures?.map((f) => {
      if (f.properties && Number(f.properties?.label) > Number(label)) {
        const newLabel = Number(f.properties.label) - 1;
        Object.assign(f, { properties: { label: `${newLabel}` } });
      }
    });
    setFeatures(filteredFeatures);

    // `updateMapKey` is set as a unique `key` prop on the map container to force a re-render of its children (aka <my-map />) on change
    setUpdateMapKey(updateMapKey + 1);
  };

  const removeFeature = (index: number) => {
    resetErrors();
    removeFeatureFromForm(index);
    removeFeatureFromMap(index);

    // Set active index as highest tab after removal, so that when you "add" a new feature the tabs increment correctly
    setActiveIndex((features && features.length - 2) || 0);
  };

  return (
    <MapAndLabelContext.Provider
      value={{
        features,
        updateMapKey,
        activeIndex,
        schema,
        mapAndLabelProps: props,
        formik,
        validateAndSubmitForm,
        addInitialFeaturesToMap,
        editFeatureInForm,
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
