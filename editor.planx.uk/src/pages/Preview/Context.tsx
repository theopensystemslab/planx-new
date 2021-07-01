import React from "react";

import type { AirtableStatus, Flow } from "../../types";

export type GlobalContent = {
  [key: string]: {
    slug: string;
    status: AirtableStatus;
    name: string;
    heading: string;
    content: string;
  };
};

export const PreviewContext = React.createContext<
  { flow: Flow; globalContent?: GlobalContent } | undefined
>(undefined);
