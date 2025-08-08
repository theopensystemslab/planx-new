import React, { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import type { Action } from "@content/actions";

interface Props { 
  action: Action | undefined;
};

interface Address {
  LPI: {
    LAT: number;
    LNG: number;
  };
}

interface AddressSelectionEventDetail {
  address: Address
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


const AddressSearch: React.FC<Props> = ({ action }) => {

  const addressSearchRef = useRef<AddressSearchElement>(null);

  const [address, setAddress] = useState<Address|null>(null)

  useEffect(() => {
    const inputElement = addressSearchRef.current;

    if (!inputElement) {
      console.warn("<geocode-autocomplete> element not found for event listener.")
      return;
    }

    const handleAddressSelection = (event: CustomEvent<AddressSelectionEventDetail>) => {
      const { detail } = event;
      console.debug("Address selected:", detail)
      setAddress(detail.address)
    }

    inputElement.addEventListener("addressSelection", handleAddressSelection)

    return () => {
      inputElement.removeEventListener("addressSelection", handleAddressSelection)
    }

  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    // address coords => LPA lookup
    if (!address) {
      return;
    }

    const { LAT, LNG } = address.LPI;

    // remove in favor of some better way.. just not sure what that is
    await fetch(`http://localhost:7002/lpa?lat=${LAT}&lon=${LNG}`)
      .then(res => res.json())
      .then(data => {
        if(data.matchingLpa) {
          navigate(`/${data.matchingLpa}`)
          action 
                ? navigate(`/${data.matchingLpa}?action=${action}`)
                : navigate(`/${data.matchingLpa}`)
        }
        else {
          // TODO: what to display to user?
          console.debug("There was no matching LPA")
        }
      })
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