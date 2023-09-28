import { getCookie } from "lib/cookie";
import { redirect } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { View } from "react-navi";

import AuthenticatedLayout from "../../pages/layout/AuthenticatedLayout";

/**
 * View wrapper for all authenticated routes
 * Parses JWT and inits user store
 */
export const authenticatedView = async () => {
  const jwt = getCookie("jwt");
  if (!jwt) return redirect("/login");

  await useStore.getState().initUserStore(jwt);

  return (
    <AuthenticatedLayout>
      <View />
    </AuthenticatedLayout>
  );
};
