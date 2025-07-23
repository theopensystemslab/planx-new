import React, { useEffect, useRef } from "react";
import { navigate } from "astro:transitions/client";
import type { Action } from "@content/actions";

interface Props { 
  action: Action | undefined;
};

interface PostcodeChangeEventDetail {
  postcode: string;
  isValid: boolean;
}

// @ts-expect-error
interface PostcodeSearchElement extends HTMLElement {
  addEventListener(
    type: "postcodeChange",
    listener: (event: CustomEvent<PostcodeChangeEventDetail>) => void,
  ): void;
  removeEventListener(
    type: "postcodeChange",
    listener: (event: CustomEvent<PostcodeChangeEventDetail>) => void,
  ): void;
}

const PostcodeSearch: React.FC<Props> = ({ action }) => {
  const postcodeSearchRef = useRef<PostcodeSearchElement>(null);

  useEffect(() => {
    const inputElement = postcodeSearchRef.current;

    if (!inputElement) {
      console.warn("<postcode-search> element ref not found for event listener.");
      return;
    }

    const handlePostcodeChange = (event: CustomEvent<PostcodeChangeEventDetail>) => {
      const { detail } = event;
      console.debug("Postcode Change:", detail);
    };

    inputElement.addEventListener("postcodeChange", handlePostcodeChange);

    return () => {
      inputElement.removeEventListener("postcodeChange", handlePostcodeChange);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Postcode lookup
    // Hardcoded to Bucks for now
    action 
      ? await navigate(`/barnet?action=${action}`)
      : await navigate("/barnet")
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* @ts-ignore-error */}
      <postcode-search
        ref={postcodeSearchRef}
        label="Enter a postcode"
        hintText="For example, NW3 7PH"
      />
      <button type="submit" className="button button--primary button--medium">
        Find the local planning authority
      </button>
    </form>
  );
};

export default PostcodeSearch;
