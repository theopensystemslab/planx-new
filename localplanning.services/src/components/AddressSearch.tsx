import React, { useEffect, useRef } from "react";
import type { Action } from "@content/actions";

interface Props { 
  action: Action | undefined;
};


interface AddressSelectionEventDetail {
  address: string;
}

// @ts-expect-error
interface AddressSearchElement extends HTMLElement {
  addEventListener(
    type: "addressSelection",
    listener: (event: CustomEvent<AddressSelectionEventDetail>) => void,
  ): void;
  removeEventListener(
    type: "addressSelection",
    listener: (event: CustomEvent<AddressSelectionEventDetail>) => void,
  ): void;
}


const AddressSearch: React.FC<Props> = () => {

  const addressSearchRef = useRef<AddressSearchElement>(null);

  useEffect(() => {
    const inputElement = addressSearchRef.current;

    if (!inputElement) {
      console.warn("<geocode-autocomplete> element not found for event listener.")
      return;
    }

    const handleAddressSelection = (event: CustomEvent<AddressSelectionEventDetail>) => {
      const { detail } = event;
      console.debug("Address selected:", detail)
    }

    inputElement.addEventListener("addressSelection", handleAddressSelection)

    return () => {
      inputElement.removeEventListener("addressSelection", handleAddressSelection)
    }

  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // address coords => LPA lookup

  };

  return (
    <form onSubmit={handleSubmit}>
      {/* @ts-ignore-error */}
      <geocode-autocomplete
        ref={addressSearchRef}
        label="Enter an address"
      />
      <button type="submit" className="button button--primary button--medium">
        Find the local planning authority
      </button>
    </form>
  );
};

export default AddressSearch;