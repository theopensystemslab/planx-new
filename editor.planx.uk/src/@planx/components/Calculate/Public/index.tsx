import type { PublicProps } from "@planx/components/ui";
import React, { useEffect } from "react";

import type { Calculate } from "../model";

export type Props = PublicProps<Calculate>;

export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.();
  }, []);

  return <p>Calculating…</p>;
}
