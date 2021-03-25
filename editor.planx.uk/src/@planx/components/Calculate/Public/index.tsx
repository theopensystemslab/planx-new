import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect } from "react";

import type { Calculate } from "../model";
import { evaluatePassport } from "../model";

export type Props = PublicProps<Calculate>;

export default function Component(props: Props) {
  const [mutatePassport] = useStore((state) => [state.mutatePassport]);
  useEffect(() => {
    mutatePassport((draft) => {
      draft.data[props.output] = {
        value: [evaluatePassport(props.formula, draft, props.defaults)],
      };
    });
    (props.handleSubmit as handleSubmit)([]);
  }, []);

  return (
    <>
      <p>Calculating…</p>
    </>
  );
}
