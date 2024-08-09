import {
  generateInitialValues,
  generateValidationSchema,
  Schema,
  UserData,
  UserResponse,
} from "@planx/components/List/model";
import {
  getPreviouslySubmittedData,
  makeData,
} from "@planx/components/shared/utils";
import { PublicProps } from "@planx/components/ui";
import { FormikProps, useFormik } from "formik";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

import { MapAndLabel } from "../model";

interface MapAndLabelContextValue {
  schema: Schema;
  activeIndex: number;
  addNewItem: () => void;
  saveItem: () => Promise<void>;
  removeItem: (index: number) => void;
  editItem: (index: number) => void;
  cancelEditItem: () => void;
  formik: FormikProps<UserData>;
  validateAndSubmitForm: () => void;
  mapAndLabelProps: PublicProps<MapAndLabel>;
  errors: {
    addItem: boolean;
    unsavedItem: boolean;
    min: boolean;
    max: boolean;
  };
}

type MapAndLabelProviderProps = PropsWithChildren<PublicProps<MapAndLabel>>;

const MapAndLabelContext = createContext<MapAndLabelContextValue | undefined>(
  undefined,
);

export const MapAndLabelProvider: React.FC<MapAndLabelProviderProps> = (
  props,
) => {
  const { schema, children, handleSubmit } = props;
  const [activeIndex, setActiveIndex] = useState<number>(
    props.previouslySubmittedData ? -1 : 0,
  );

  const [activeItemInitialState, setActiveItemInitialState] = useState<
    UserResponse | undefined
  >(undefined);

  const [addItemError, setAddItemError] = useState<boolean>(false);
  const [unsavedItemError, setUnsavedItemError] = useState<boolean>(false);
  const [minError, setMinError] = useState<boolean>(false);
  const [maxError, setMaxError] = useState<boolean>(false);

  const resetErrors = () => {
    setMinError(false);
    setMaxError(false);
    setUnsavedItemError(false);
  };

  const addNewItem = async () => {
    resetErrors();

    // Do not allow a new item to be added if there's still an active item
    if (activeIndex !== -1) return setAddItemError(true);

    // Do not allow new item to be added if it will exceed max
    if (schema.max && formik.values.userData.length === schema.max) {
      return setMaxError(true);
    }

    // Add new item, and set to active
    setAddItemError(false);
    formik.values.userData.push(generateInitialValues(schema));
    setActiveIndex(formik.values.userData.length - 1);
  };

  const saveItem = async () => {
    resetErrors();

    const errors = await formik.validateForm();
    const isValid = !errors.userData?.length;
    if (isValid) {
      exitEditMode();
      setAddItemError(false);
    }
  };

  const removeItem = (index: number) => {
    resetErrors();

    // If item is before currently active card, retain active card
    if (activeIndex && index < activeIndex) {
      setActiveIndex((prev) => (prev === -1 ? 0 : prev - 1));
    }

    // Remove item from userData
    formik.setFieldValue(
      "userData",
      formik.values.userData.filter((_, i) => i !== index),
    );
  };

  const validateAndSubmitForm = () => {
    // Do not allow submissions with an unsaved item
    if (activeIndex !== -1) return setUnsavedItemError(true);

    // Manually validate minimum number of items
    if (formik.values.userData.length < schema.min) {
      return setMinError(true);
    }

    formik.handleSubmit();
  };

  const cancelEditItem = () => {
    activeItemInitialState
      ? resetItemToPreviousState()
      : removeItem(activeIndex);

    setActiveItemInitialState(undefined);

    exitEditMode();
  };

  const editItem = (index: number) => {
    setActiveItemInitialState(formik.values.userData[index]);
    setActiveIndex(index);
  };

  const getInitialValues = () => {
    const previousValues = getPreviouslySubmittedData(props);
    if (previousValues) return previousValues;

    return schema.min ? [generateInitialValues(schema)] : [];
  };

  const exitEditMode = () => setActiveIndex(-1);

  const resetItemToPreviousState = () =>
    formik.setFieldValue(`userData[${activeIndex}]`, activeItemInitialState);

  const formik = useFormik<UserData>({
    initialValues: {
      userData: getInitialValues(),
    },
    onSubmit: (values) => {
      // defaultPassportData (array) is used when coming "back"
      const defaultPassportData = makeData(props, values.userData)?.["data"];

      handleSubmit?.({
        data: {
          ...defaultPassportData,
        },
      });
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: generateValidationSchema(schema),
  });

  return (
    <MapAndLabelContext.Provider
      value={{
        activeIndex,
        addNewItem,
        saveItem,
        schema,
        mapAndLabelProps: props,
        editItem,
        removeItem,
        cancelEditItem,
        formik,
        validateAndSubmitForm,
        errors: {
          addItem: addItemError,
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
