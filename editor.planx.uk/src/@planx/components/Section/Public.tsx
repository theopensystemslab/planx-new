import type { PublicProps } from "@planx/components/ui";
import { useEffect } from "react";

import type { Section } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      auto: true, // hides this node when navigating through cards in a flow
    });
  }, []);

  return null;
}
