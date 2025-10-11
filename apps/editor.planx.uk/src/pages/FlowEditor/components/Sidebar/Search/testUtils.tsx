import React, { PropsWithChildren } from "react";
import { VirtuosoMockContext } from "react-virtuoso";

/**
 * Wrap test components within a Virtuoso wrapper
 * Docs: https://virtuoso.dev/mocking-in-tests/
 */
export const VirtuosoWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <VirtuosoMockContext.Provider
    value={{ viewportHeight: 300, itemHeight: 100 }}
  >
    {children}
  </VirtuosoMockContext.Provider>
);
