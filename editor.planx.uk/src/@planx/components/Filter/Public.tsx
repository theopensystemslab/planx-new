import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { Filter } from "./model";

export type Props = PublicProps<Filter>;

// A Filter is always auto-answered and never seen by a user, but should still leave a breadcrumb
export default function Component(props: Props) {
  const autoAnswerableOptions = useStore(
    (state) => state.autoAnswerableOptions,
  );

  let idsThatCanBeAutoAnswered: string[] | undefined;
  if (props.id) idsThatCanBeAutoAnswered = autoAnswerableOptions(props.id);

  useEffect(() => {
    props.handleSubmit?.({
      answers: idsThatCanBeAutoAnswered,
      auto: true,
    });
  }, []);

  return null;
}
