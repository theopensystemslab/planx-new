import { useSchema } from "@planx/components/shared/Schema/hook";
import { Schema, SchemaUserData } from "@planx/components/shared/Schema/model";
import {
  getPreviouslySubmittedData,
  makeData,
} from "@planx/components/shared/utils";
import { FormikProps, useFormik } from "formik";
import { get } from "lodash";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

import { PresentationalProps } from ".";

interface MapAndLabelContextValue {
  schema: Schema;
  activeIndex: number;
  editFeature: (index: number) => void;
  formik: FormikProps<SchemaUserData>;
  validateAndSubmitForm: () => void;
  isFeatureInvalid: (index: number) => boolean;
  addFeature: () => void;
  copyFeature: (sourceIndex: number, destinationIndex: number) => void;
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

  const [activeIndex, setActiveIndex] = useState<number>(
    props.previouslySubmittedData ? -1 : 0,
  );

  const [minError, setMinError] = useState<boolean>(false);
  const [maxError, setMaxError] = useState<boolean>(false);

  const resetErrors = () => {
    setMinError(false);
    setMaxError(false);
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

  const addFeature = () => {
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

  return (
    <MapAndLabelContext.Provider
      value={{
        activeIndex,
        schema,
        mapAndLabelProps: props,
        editFeature,
        formik,
        validateAndSubmitForm,
        addFeature,
        copyFeature,
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
