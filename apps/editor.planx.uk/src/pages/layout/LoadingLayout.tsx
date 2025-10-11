import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { useLoadingRoute, View } from "react-navi";

export const loadingView = () => <LoadingLayout />;

export const LoadingLayout = () => {
  const isLoading = useLoadingRoute();
  return isLoading ? <DelayedLoadingIndicator /> : <View />;
};
