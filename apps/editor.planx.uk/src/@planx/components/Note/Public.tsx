import type { PublicProps } from "@planx/components/shared/types";
import { useEffect } from "react";

import type { Note } from "./model";

export type Props = PublicProps<Note>;

// Notes are never seen by users and always auto-answered
export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      auto: true,
    });
  }, []);

  return null;
}
