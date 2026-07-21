import { useEffect } from "react";

import type { PublicProps } from "../shared/types";
import type { FilterData } from "./Editor";

export type Props = PublicProps<FilterData>;

// Filters are always auto-answered and never seen by a user, but should still leave a breadcrumb
export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      answers: props.autoAnswers,
      auto: true,
    });
  }, [props.autoAnswers]);

  return null;
}
