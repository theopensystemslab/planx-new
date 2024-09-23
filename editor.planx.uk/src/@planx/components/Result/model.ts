import { FlagSet } from "@opensystemslab/planx-core/types";
import { Store } from "pages/FlowEditor/lib/store";
import { Response } from "pages/FlowEditor/lib/store/preview";
import type { HandleSubmit } from "pages/Preview/Node";
import type { TextContent } from "types";

export interface FlagDisplayText {
  heading?: string;
  description?: string;
}

export interface Result {
  flagSet: FlagSet;
  overrides?: { [flagId: string]: FlagDisplayText };
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
}
