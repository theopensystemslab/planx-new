import React, { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import type { Action } from "@content/actions";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";

interface Props {
  action: Action | undefined;
}

interface Address {
  LPI: {
    LAT: number;
    LNG: number;
  };
}

interface AddressSelectionEventDetail {
  address: Address;
}

interface LocalPlanningAuthorityFeature {
  name: string;
  reference: string;
  entity: number;
}

// storing this here for now, but perhaps this should be elsewhere..?
const lpaReferenceLookup: Record<string, string> = {
  E60000203: "barnet",
  E60000331: "buckinghamshire",
  E60000188: "camden",
  E60000065: "doncaster",
  E60000271: "epsom-and-ewell",
  E60000008: "gateshead",
  E60000311: "gloucester",
  E60000195: "lambeth",
  E60000224: "medway",
  E60000009: "newcastle",
  E60000198: "southwark",
  E60000171: "st-albans",
  E60000313: "tewkesbury",
  E60000230: "west-berkshire",
};

// @ts-expect-error
interface AddressSearchElement extends HTMLElement {
  addEventListener(
    type: "addressSelection",
    listener: (event: CustomEvent<AddressSelectionEventDetail>) => void
  ): void;
  removeEventListener(
    type: "addressSelection",
    listener: (event: CustomEvent<AddressSelectionEventDetail>) => void
  ): void;
}

const AddressSearch: React.FC<Props> = ({ action }) => {
  const addressSearchRef = useRef<AddressSearchElement>(null);

  const [address, setAddress] = useState<Address | null>(null);

  const [matchingLpas, setMatchingLpas] = useState<
    LocalPlanningAuthorityFeature[] | null
  >(null);

  useEffect(() => {
    const inputElement = addressSearchRef.current;

    if (!inputElement) {
      console.warn(
        "<geocode-autocomplete> element not found for event listener."
      );
      return;
    }

    const handleAddressSelection = (
      event: CustomEvent<AddressSelectionEventDetail>
    ) => {
      const { detail } = event;
      console.debug("Address selected:", detail);
      setAddress(detail.address);
      setMatchingLpas(null);
    };

    inputElement.addEventListener("addressSelection", handleAddressSelection);

    return () => {
      inputElement.removeEventListener(
        "addressSelection",
        handleAddressSelection
      );
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // address coords => LPA lookup
    if (!address) {
      return;
    }

    const { LAT, LNG } = address.LPI;

    // remove in favor of some better way.. just not sure what that is
    await fetch(`${PUBLIC_PLANX_REST_API_URL}/lpa?lat=${LAT}&lon=${LNG}`)
      .then((res) => res.json())
      .then((data) => {
        setMatchingLpas(data.entities);

        // sometimes there are multiple intersecting LPAs..
        // do we need more sophisticated match logic here?
        for (const entity of data.entities) {
          if (entity.reference in lpaReferenceLookup) {
            const matchingLpaRoute = lpaReferenceLookup[entity.reference];
            action
              ? navigate(`/${matchingLpaRoute}?action=${action}`)
              : navigate(`/${matchingLpaRoute}`);
          }
        }
      });
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
      {matchingLpas?.length === 0 && (
        <p>We couldn't find a local planning authority for this address.</p>
      )}
      {matchingLpas && matchingLpas?.length > 0 && (
        <p>
          Your local planning authorities are:{" "}
          {matchingLpas?.map((e) => e.name)}
        </p>
      )}
    </form>
  );
};

export default AddressSearch;
