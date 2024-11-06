import { useEffect } from "react";

import { PublicProps } from "../shared/types";
import type { Props as Filter } from "./Editor";

export type Props = PublicProps<Filter>;

// Filters are always auto-answered and never seen by a user, but should still leave a breadcrumb
export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      answers: props.autoAnswers,
      auto: true,
    });
  }, []);

  return null;
}
