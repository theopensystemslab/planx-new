import type { PublicProps } from "@planx/components/shared/types";
import { makeData } from "@planx/components/shared/utils";
import { useEffect } from "react";

import type { SetValue } from "./model";

export type Props = PublicProps<SetValue>;

export default function Component(props: Props) {
  useEffect(() => {
    props.handleSubmit?.({
      ...makeData(props, [props.val], props.fn),
      auto: true,
    });
  }, []);

  return null;
}
