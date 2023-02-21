import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { Section } from "./model";

export type Props = PublicProps<Section>;

export default function Component(props: Props) {
  const updateSection = useStore((state) => state.updateSection);
  useEffect(() => {
    updateSection(props.title);
    props.handleSubmit?.({
      auto: true, // hides this node when navigating through cards in a flow
    });
  }, []);

  return null;
}
