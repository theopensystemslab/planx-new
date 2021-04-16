import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import type { Calculate } from "../model";
import { evaluate } from "../model";

export type Props = PublicProps<Calculate>;

export default function Component(props: Props) {
  const passport = useStore((state) => state.computePassport());

  useEffect(() => {
    props.handleSubmit?.(undefined, {
      [props.output]: evaluate(props.formula, passport, props.defaults),
    });
  }, []);

  return <p>Calculating…</p>;
}
