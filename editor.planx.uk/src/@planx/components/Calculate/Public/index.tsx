import { makeData } from "@planx/components/shared/utils";
import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import type { Calculate } from "../model";
import { evaluate } from "../model";

export type Props = PublicProps<Calculate>;

export default function Component(props: Props) {
  // convert passport.data = {[key]: {value: data}} into data = {[key]: data}
  const data = useStore((state) =>
    Object.entries(state.computePassport().data || {}).reduce(
      (acc, [key, { value }]) => ({
        ...acc,
        [key]: value,
      }),
      {}
    )
  );

  useEffect(() => {
    props.handleSubmit?.(
      makeData(props, evaluate(props.formula, data, props.defaults))
    );
  }, []);

  return <p>Calculating…</p>;
}
