import type { PublicProps } from "@planx/components/shared/types";
import { makeData } from "@planx/components/shared/utils";
import { useEffect } from "react";

import type { PublicResponsiveQuestion } from "./model";

export type Props = PublicProps<PublicResponsiveQuestion>;

export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      ...makeData(props, ["todo"], props.fn),
      auto: true,
    });
  }, []);

  return null;
}
