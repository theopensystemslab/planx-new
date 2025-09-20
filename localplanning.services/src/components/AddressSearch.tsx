import React, { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";

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

const AddressSearch: React.FC = () => {
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

    try {
      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lpa?lat=${LAT}&lon=${LNG}`);
      const data = await response.json();
      
      setMatchingLpas(data.entities);

      // Case 1: No LPAs found
      if (!data.entities || data.entities.length === 0) {
        setMatchingLpas([])
        return;
      }

      // Case 2: Check if any LPA matches our lookup table
      let matchFound = false;
      for (const entity of data.entities) {
        if (entity.reference in lpaReferenceLookup) {
          const matchingLpaRoute = lpaReferenceLookup[entity.reference];
          navigate(`/${matchingLpaRoute}`);
          matchFound = true;
          break; // Exit after first match
        }
      }

      // Case 3: LPAs found but none match our lookup table
      if (!matchFound) {
        // Use the first LPA name, or combine multiple if needed
        const lpaName = data.entities[0].name;
        const encodedLpaName = encodeURIComponent(lpaName);
        const route = action 
          ? `/lpa-not-supported?lpa=${encodedLpaName}&action=${action}` 
          : `/lpa-not-supported?lpa=${encodedLpaName}`;
        navigate(route);
      }

    } catch (error) {
      console.error('Error fetching LPA data:', error);
      const route = action ? `/lpa-not-found?action=${action}` : '/lpa-not-found';
      navigate(route);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 items-start">
        <div className="max-w-3xl w-full">
          {/* @ts-ignore-error */}
          <geocode-autocomplete
            ref={addressSearchRef}
            label="Enter an address to search"
            osProxyEndpoint={
              `${PUBLIC_PLANX_REST_API_URL}/proxy/ordnance-survey`
            }
          />
        </div>
        <button type="submit" className="button button--primary button--medium button-focus-style">
          Find the local planning authority
        </button>
        {matchingLpas?.length === 0 && (
          <p className="mt-2">We couldn't find a local planning authority for this address. At present we support only local planning authorities in England.</p>
        )}
      </div>
    </form>
  );
};

export default AddressSearch;
