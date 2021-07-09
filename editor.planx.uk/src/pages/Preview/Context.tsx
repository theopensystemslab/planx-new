import React from "react";

import type { Flow, TextContent } from "../../types";

export const PreviewContext = React.createContext<
  { flow: Flow; globalContent?: { [key: string]: TextContent } } | undefined
>(undefined);
