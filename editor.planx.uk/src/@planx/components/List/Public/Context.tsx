import { FormikProps, useFormik } from "formik";
import React, { createContext, ReactNode, useContext, useState } from "react";

import {
  generateInitialValues,
  generateValidationSchema,
  Schema,
  UserData,
} from "../model";

interface ListContextValue {
  schema: Schema;
  activeIndex: number;
  addNewItem: () => void;
  saveItem: () => Promise<void>;
  removeItem: (index: number) => void;
  editItem: (index: number) => void;
  cancelEditItem: () => void;
  formik: FormikProps<UserData>;
  handleSubmit: () => void;
  errors: {
    addItem: boolean;
    unsavedItem: boolean;
    min: boolean;
    max: boolean;
  };
}

interface ListProviderProps {
  children: ReactNode;
  schema: Schema;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

export const ListProvider: React.FC<ListProviderProps> = ({
  children,
  schema,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

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
      setActiveIndex(-1);
      setAddItemError(false);
    }
  };

  const removeItem = (index: number) => {
    resetErrors();

    if (activeIndex && index < activeIndex) {
      // If item is before currently active card, retain active card
      setActiveIndex((prev) => (prev === -1 ? 0 : prev - 1));
    } else if (index === activeIndex || index === 0) {
      // If item is currently in Edit mode, exit Edit mode
      cancelEditItem();
    }

    // Remove item from userData
    formik.setFieldValue(
      "userData",
      formik.values.userData.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = () => {
    // Do not allow submissions with an unsaved item
    if (activeIndex !== -1) return setUnsavedItemError(true);

    // Manually validate min/max
    if (formik.values.userData.length < schema.min) {
      return setMinError(true);
    }
    if (schema.max && formik.values.userData.length > schema.max) {
      return setMaxError(true);
    }
    formik.handleSubmit();
  };

  const cancelEditItem = () => setActiveIndex(-1);
  const editItem = (index: number) => setActiveIndex(index);

  const formik = useFormik<UserData>({
    initialValues: {
      userData: schema.min ? [generateInitialValues(schema)] : [],
    },
    onSubmit: (values) => {
      console.log("Submit!");
      console.log({ values });
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: generateValidationSchema(schema),
  });

  return (
    <ListContext.Provider
      value={{
        activeIndex,
        addNewItem,
        saveItem,
        schema,
        editItem,
        removeItem,
        cancelEditItem,
        formik,
        handleSubmit,
        errors: {
          addItem: addItemError,
          unsavedItem: unsavedItemError,
          min: minError,
          max: maxError,
        },
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useListContext = (): ListContextValue => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useListContext must be used within a ListProvider");
  }
  return context;
};