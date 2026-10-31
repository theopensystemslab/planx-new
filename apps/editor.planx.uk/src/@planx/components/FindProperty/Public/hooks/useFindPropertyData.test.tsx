import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import server from "test/mockServer";

import type { SiteAddress } from "../../model";
import buildingSafetyLevyRatesMock from "../mocks/buildingSafetyLevyRatesMock";
import localAuthorityMock from "../mocks/localAuthorityMock";
import { useFindPropertyData } from "./useFindPropertyData";

const address = {
  latitude: 51.4842536,
  longitude: -0.0764165,
} as SiteAddress;

let findPropertyRequests = 0;

const renderFindPropertyData = (teamSlug: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useFindPropertyData(address, teamSlug), { wrapper });
};

beforeEach(() => {
  findPropertyRequests = 0;
  server.use(
    http.get("https://www.planning.data.gov.uk/entity.geojson", () => {
      findPropertyRequests++;
      return HttpResponse.json(localAuthorityMock);
    }),
    http.get("https://www.planning.data.gov.uk/entity.json", () =>
      HttpResponse.json(buildingSafetyLevyRatesMock),
    ),
  );
});

describe("useFindPropertyData", () => {
  it("fetches local authority data from Planning Data for English teams", async () => {
    const { result } = renderFindPropertyData("southwark");

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(findPropertyRequests).toBe(1);
    expect(result.current.localAuthorityDistricts).toContain("Southwark");
  });

  it("does not query Planning Data for Welsh teams, which it does not cover", async () => {
    const { result } = renderFindPropertyData("bannau-brycheiniog");

    expect(result.current).toEqual({
      localAuthorityDistricts: undefined,
      localPlanningAuthorities: undefined,
      regions: undefined,
      wards: undefined,
      parishes: undefined,
      developmentCorporations: undefined,
      titleBoundary: undefined,
      bslRate: undefined,
      isPending: false,
      error: undefined,
    });
    expect(findPropertyRequests).toBe(0);
  });
});
