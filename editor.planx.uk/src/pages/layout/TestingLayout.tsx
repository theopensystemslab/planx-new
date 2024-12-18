import { TestingPage } from "pages/Preview/TestingPage";
import React, { PropsWithChildren } from "react";

export const TestingLayout = ({ children }: PropsWithChildren) => {
  return <TestingPage>{children}</TestingPage>;
};
