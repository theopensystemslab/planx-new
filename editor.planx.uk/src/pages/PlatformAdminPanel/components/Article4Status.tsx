import React from "react";
import useSWR from "swr";

import { Configured, NotConfigured } from "../../../ui/shared/DataTable/icons";

export const Article4Status = ({ teamSlug }: { teamSlug: string }) => {
  const a4Endpoint = `${
    import.meta.env.VITE_APP_API_URL
  }/gis/${teamSlug}/article4-schema`;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: a4Check, isValidating } = useSWR(
    () => (teamSlug ? a4Endpoint : null),
    fetcher,
  );
  return !isValidating && a4Check?.status ? <Configured /> : <NotConfigured />;
};
