import React, { createContext, ReactNode, useContext, useState } from "react";

import { generateNewItem, Schema, UserData } from "../model";

interface ListContextValue {
  schema: Schema;
  activeIndex: number | undefined;
  userData: UserData;
  addNewItem: () => void;
  saveItem: (index: number, updatedItem: UserData[0]) => void;
  removeItem: (index: number) => void;
  editItem: (index: number) => void;
  cancelEditItem: () => void;
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
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);
  const [userData, setUserData] = useState<UserData>(
    schema.min === 0 ? [] : [generateNewItem(schema)],
  );

  const addNewItem = () => {
    setUserData([...userData, generateNewItem(schema)]);
    setActiveIndex((prev) => (prev === undefined ? 0 : prev + 1));
  };

  const saveItem = (index: number, updatedItem: UserData[0]) => {
    setUserData((prev) =>
      prev.map((item, i) => (i === index ? updatedItem : item)),
    );
  };

  const editItem = (index: number) => setActiveIndex(index);

  const removeItem = (index: number) => {
    if (activeIndex && index < activeIndex) {
      // If item is before currently active card, retain active card
      setActiveIndex((prev) => (prev === undefined ? 0 : prev - 1));
    } else if (index === activeIndex || index === 0) {
      // If item is currently in Edit mode, exit Edit mode
      cancelEditItem();
    }

    // Remove item from userData
    setUserData((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelEditItem = () => setActiveIndex(undefined);

  return (
    <ListContext.Provider
      value={{
        activeIndex,
        userData,
        addNewItem,
        saveItem,
        schema,
        editItem,
        removeItem,
        cancelEditItem,
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
