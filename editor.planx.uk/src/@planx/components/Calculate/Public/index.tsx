import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useState } from "react";

import type { Calculate } from "../model";
import { evaluatePassport } from "../model";

export type Props = PublicProps<Calculate>;

const useClasses = makeStyles((theme) => ({}));

export default function Component(props: Props) {
  const [mutatePassport] = useStore((state) => [state.mutatePassport]);
  useEffect(() => {
    if (props.output && props.defaults && props.formula) {
      mutatePassport((draft) => {
        draft.data[props.output] = {
          value: [evaluatePassport(props.formula, draft, props.defaults)],
        };
      });
      (props.handleSubmit as handleSubmit)([]);
    }
  }, []);

  return (
    <>
      <p>Calculating…</p>
    </>
  );
}
