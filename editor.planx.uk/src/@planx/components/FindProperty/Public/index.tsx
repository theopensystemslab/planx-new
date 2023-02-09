import { gql } from "@apollo/client";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";
import { fetchCurrentTeam } from "utils";

import type { FindProperty, SiteAddress } from "../model";
import { DEFAULT_TITLE } from "../model";
import PickOSAddress from "./Autocomplete";

// these queries are exported because tests require them
export const FETCH_BLPU_CODES = gql`
  {
    blpu_codes {
      code
      description
      value
    }
  }
`;

type Props = PublicProps<FindProperty>;

export default Component;

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const [address, setAddress] = useState<SiteAddress | undefined>(
    previouslySubmittedData?._address
  );
  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();
  const team = fetchCurrentTeam();

  // Fetch supplemental address info via Digital Land
  let options = new URLSearchParams({
    entries: "all", // includes historic
    geometry: `POINT(${address?.longitude} ${address?.latitude})`,
    geometry_relation: "intersects",
    limit: "100",
  });
  options.append("dataset", "local-authority-district");
  options.append("dataset", "region");

  // https://www.planning.data.gov.uk/docs#/Search%20entity
  const root = `https://www.planning.data.gov.uk/entity.json?`;
  const digitalLandEndpoint = root + options;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, error, mutate, isValidating } = useSWR(
    () =>
      address?.latitude && address?.longitude ? digitalLandEndpoint : null,
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  useEffect(() => {
    if (address && data?.count > 0) {
      const lads: string[] = [];
      const regions: string[] = [];
      data.entities.forEach((entity: any) => {
        if (entity.dataset === "local-authority-district") {
          lads.push(entity.name);
        } else if (entity.dataset === "region") {
          regions.push(entity.name);
        }
      });
      setLocalAuthorityDistricts([...new Set(lads)]);
      setRegions([...new Set(regions)]);
    }
  }, [data, address]);

  return (
    <Card
      isValid={Boolean(address) && !isValidating}
      handleSubmit={() => {
        if (address) {
          const newPassportData: any = {};
          newPassportData["_address"] = address;
          if (address?.planx_value) {
            newPassportData["property.type"] = [address.planx_value];
          }

          if (localAuthorityDistricts) {
            newPassportData["property.localAuthorityDistrict"] =
              localAuthorityDistricts;
          }
          if (regions) {
            newPassportData["property.region"] = regions;
          }

          props.handleSubmit?.({ data: { ...newPassportData } });
        }
      }}
    >
      <QuestionHeader
        title={props.title || DEFAULT_TITLE}
        description={props.description || ""}
      />
      <PickOSAddress
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
        id={props.id}
        description={props.description || ""}
      />
      <ExternalPlanningSiteDialog purpose={DialogPurpose.MissingAddress} />
    </Card>
  );
}
