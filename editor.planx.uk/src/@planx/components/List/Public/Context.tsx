import { useSchema } from "@planx/components/shared/Schema/hook";
import {
  Schema,
  UserData,
  UserResponse,
} from "@planx/components/shared/Schema/model"
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

import { List } from "../model";
import {
  flatten,
  sumIdenticalUnits,
  sumIdenticalUnitsByDevelopmentType,
} from "../utils";

interface ListContextValue {
  schema: Schema;
  activeIndex: number;
  addNewItem: () => void;
  saveItem: () => Promise<void>;
  removeItem: (index: number) => void;
  editItem: (index: number) => void;
  cancelEditItem: () => void;
  formik: FormikProps<UserData>;
  validateAndSubmitForm: () => void;
  listProps: PublicProps<List>;
  /**
   * @deprecated
   * @description
   * Hide features if the schema is temporarily mocking a "Page" component
   * @todo
   * Refactor and allow a single-item "Page" component to properly manage this
   */
  isPageComponent: boolean;
  errors: {
    addItem: boolean;
    unsavedItem: boolean;
    min: boolean;
    max: boolean;
  };
}

type ListProviderProps = PropsWithChildren<PublicProps<List>>;

const ListContext = createContext<ListContextValue | undefined>(undefined);

export const ListProvider: React.FC<ListProviderProps> = (props) => {
  const { schema, children, handleSubmit } = props;
  const { formikConfig, initialValues } = useSchema({
    schema,
    previousValues: getPreviouslySubmittedData(props),
  });

  const formik = useFormik<UserData>({
    ...formikConfig,
    onSubmit: (values) => {
      // defaultPassportData (array) is used when coming "back"
      const defaultPassportData = makeData(props, values.userData)?.["data"];

      // flattenedPassportData makes individual list items compatible with Calculate components
      const flattenedPassportData = flatten(defaultPassportData, { depth: 2 });

      // basic example of general summary stats we can add onSubmit:
      //   1. count of items/responses
      //   2. if the schema includes a field that sets fn = "identicalUnits", sum of total units
      //   3. if the schema includes a field that sets fn = "development" & fn = "identicalUnits", sum of total units by development "val"
      const totalUnits = sumIdenticalUnits(props.fn, defaultPassportData);
      const totalUnitsByDevelopmentType = sumIdenticalUnitsByDevelopmentType(
        props.fn,
        defaultPassportData,
      );

      const summaries = {
        [`${props.fn}.total.listItems`]:
          defaultPassportData[`${props.fn}`].length,
        ...(totalUnits > 0 && {
          [`${props.fn}.total.units`]: totalUnits,
        }),
        ...(totalUnits > 0 &&
          Object.keys(totalUnitsByDevelopmentType).length > 0 &&
          totalUnitsByDevelopmentType),
      };

      handleSubmit?.({
        data: {
          ...defaultPassportData,
          ...flattenedPassportData,
          ...summaries,
        },
      });
    },
  })

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
    formik.values.userData.push(initialValues);
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

  const exitEditMode = () => setActiveIndex(-1);

  const resetItemToPreviousState = () =>
    formik.setFieldValue(`userData[${activeIndex}]`, activeItemInitialState);

  const isPageComponent = schema.max === 1;

  return (
    <ListContext.Provider
      value={{
        activeIndex,
        addNewItem,
        saveItem,
        schema,
        listProps: props,
        editItem,
        removeItem,
        cancelEditItem,
        formik,
        validateAndSubmitForm,
        isPageComponent,
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
