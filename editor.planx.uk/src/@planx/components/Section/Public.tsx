import { makeData } from "@planx/components/shared/utils";
import type { PublicProps } from "@planx/components/ui";
import { useEffect } from "react";

import type { Section } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      ...makeData(props, props.title, "currentSection"), // updates 'currentSection' passport key with this section's title; proxy until we have a Navigation store method!
      auto: true, // hides this node when navigating through cards in a flow
    });
  }, []);

  return null;
}
