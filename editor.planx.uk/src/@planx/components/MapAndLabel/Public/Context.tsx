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
  saveItem: () => Promise<void>;
  editItem: (index: number) => void;
  cancelEditItem: () => void;
  formik: FormikProps<SchemaUserData>;
  validateAndSubmitForm: () => void;
  addFeature: () => void;
  mapAndLabelProps: PresentationalProps;
  errors: {
    unsavedItem: boolean;
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

  const [activeItemInitialState, setActiveItemInitialState] = useState<
    SchemaUserResponse | undefined
  >(undefined);

  const [unsavedItemError, setUnsavedItemError] = useState<boolean>(false);
  const [minError, setMinError] = useState<boolean>(false);
  const [maxError, setMaxError] = useState<boolean>(false);

  const resetErrors = () => {
    setMinError(false);
    setMaxError(false);
    setUnsavedItemError(false);
  };

  // TODO: Not required?
  const saveItem = async () => {
    resetErrors();

    const errors = await formik.validateForm();
    const isValid = !errors.schemaData?.length;
    if (isValid) {
      exitEditMode();
    }
  };

  const validateAndSubmitForm = () => {
    // Do not allow submissions with an unsaved item
    // if (activeIndex !== -1) return setUnsavedItemError(true);

    // Manually validate minimum number of items
    if (formik.values.schemaData.length < schema.min) {
      return setMinError(true);
    }

    // const errors = await formik.validateForm();
    // console.log({errors})

    formik.handleSubmit();
  };

  const cancelEditItem = () => {
    if (activeItemInitialState) resetItemToPreviousState();

    setActiveItemInitialState(undefined);

    exitEditMode();
  };

  const editItem = (index: number) => {
    setActiveItemInitialState(formik.values.schemaData[index]);
    setActiveIndex(index);
  };

  const exitEditMode = () => setActiveIndex(-1);

  const resetItemToPreviousState = () =>
    formik.setFieldValue(`schemaData[${activeIndex}]`, activeItemInitialState);

  const addFeature = () => {
    const currentFeatures = formik.values.schemaData;
    const updatedFeatures = [...currentFeatures, initialValues];
    formik.setFieldValue("schemaData", updatedFeatures);
  };

  return (
    <MapAndLabelContext.Provider
      value={{
        activeIndex,
        saveItem,
        schema,
        mapAndLabelProps: props,
        editItem,
        cancelEditItem,
        formik,
        validateAndSubmitForm,
        addFeature,
        errors: {
          unsavedItem: unsavedItemError,
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
