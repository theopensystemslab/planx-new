import { makeData } from "@planx/components/shared/utils";
import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { Calculate } from "../model";
import { evaluate } from "../model";

export type Props = PublicProps<Calculate>;

export default function Component(props: Props) {
  const passport = useStore((state) => state.computePassport().data);

  useEffect(() => {
    props.handleSubmit?.({
      ...makeData(
        props,
        evaluate(props.formula, passport, props.defaults),
        props.output,
      ),
      // don't show this component to the user, auto=true required
      // for back button to skip past this component when going back
      auto: true,
    });
  }, []);

  return null;
}
