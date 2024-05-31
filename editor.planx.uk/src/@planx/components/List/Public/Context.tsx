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

  const setAllFieldsTouched = () => {
    Object.keys(formik.values.userData[activeIndex]).forEach((key) => {
      formik.setFieldTouched(formik.values.userData[activeIndex][key], true);
    });
  };

  const addNewItem = async () => {
    // Do not allow a new item to be added if there's still an active item
    // TODO: show error to explain this
    if (activeIndex !== -1) return;
    await formik.validateForm();
    if (!formik.isValid) {
      console.log({ errors: formik.errors });
    }
    // Add new item, and set to active
    formik.values.userData.push(generateInitialValues(schema));
    setActiveIndex(formik.values.userData.length - 1);
  };

  const saveItem = async () => {
    // setAllFieldsTouched(activeIndex);
    await formik.validateForm();
    if (formik.isValid) {
      setActiveIndex(-1);
    }
  };

  const removeItem = (index: number) => {
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
    if (activeIndex !== -1) {
      // TODO: Display error for this
      console.log("Please save all list items to proceed");
      return;
    }

    formik.handleSubmit();
  };

  const cancelEditItem = () => setActiveIndex(-1);
  const editItem = (index: number) => setActiveIndex(index);

  const formik = useFormik<UserData>({
    initialValues: { userData: [generateInitialValues(schema)] },
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
