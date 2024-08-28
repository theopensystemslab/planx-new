import {
  useCurrentRoute as originalUseCurrentRoute,
  useNavigation as originalUseNavigation,
} from "react-navi";

import type { Decorator } from "@storybook/react";

export const reactNaviDecorator: Decorator = (storyFn, context) => {
  const { parameters } = context;

  const useCurrentRoute =
    parameters?.reactNavi?.useCurrentRoute || originalUseCurrentRoute;
  const useNavigation =
    parameters?.reactNavi?.useNavigation || originalUseNavigation;

  return storyFn({ useCurrentRoute, useNavigation });
};
