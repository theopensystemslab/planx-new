import { FLAG_SETS, FlagSet } from "@opensystemslab/planx-core/types";
import { richText } from "lib/yupExtensions";
import { mapValues } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";
import { Response } from "pages/FlowEditor/lib/store/preview";
import type { HandleSubmit } from "pages/Preview/Node";
import type { TextContent } from "types";
import { boolean, lazy, mixed, object, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema } from "../shared";

export interface FlagDisplayText {
  heading?: string;
  description?: string;
  resetButton?: boolean;
}

export interface Result extends BaseNodeData {
  flagSet: FlagSet;
  overrides?: { [flagId: string]: FlagDisplayText };
  resetButton?: boolean;
}

export interface PresentationalProps {
  allowChanges?: boolean;
  handleSubmit?: HandleSubmit;
  headingColor: {
    text: string;
    background: string;
  };
  headingTitle?: string;
  description?: string;
  reasonsTitle?: string;
  responses: Array<Response>;
  disclaimer?: TextContent;
  previouslySubmittedData?: Store.UserData;
  resetButton?: boolean;
  resetPreview?: () => void;
}

const overridesSchema = lazy((obj) =>
  object(
    mapValues(obj, () =>
      object({
        heading: string(),
        description: richText(),
        resetButton: boolean().optional(),
      }),
    ),
  ),
);

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    flagSet: mixed().oneOf([...FLAG_SETS]),
    overrides: overridesSchema,
    resetButton: boolean().optional(),
  }),
);
