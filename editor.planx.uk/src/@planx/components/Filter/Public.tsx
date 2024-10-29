import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { Props as Filter } from "./Editor";

export type Props = PublicProps<Filter>;

// Filters are always auto-answered and never seen by a user, but should still leave a breadcrumb
export default function Component(props: Props) {
  const autoAnswerableFlag = useStore(
    (state) => state.autoAnswerableFlag,
  );

  let idThatCanBeAutoAnswered: string | undefined;
  if (props.id) idThatCanBeAutoAnswered = autoAnswerableFlag(props.id);

  useEffect(() => {
    props.handleSubmit?.({
      answers: [idThatCanBeAutoAnswered],
      auto: true,
    });
  }, []);

  return null;
}
