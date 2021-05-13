import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import Card from "../shared/Preview/Card";
import { makeData } from "../shared/utils";
import { TYPES } from "../types";
import { PublicProps } from "../ui";
import {
  bopsDictionary,
  BOPSFullPayload,
  fullPayload,
  makePayload,
} from "./bops";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
  ]);

  const request = useAsync(async () => axios.post(props.url, getParams()));

  useEffect(() => {
    if (
      !request.loading &&
      !request.error &&
      request.value &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.data.application.id, "bopsId")
      );
    }
  }, [request.loading, request.error, request.value]);

  if (request.loading) {
    return <Card>Sending data…</Card>;
  } else if (request.error) {
    // Throw error so that they're caught by our error boundaries and our error logging tool
    throw request.error;
  } else {
    return <Card>Finalising…</Card>;
  }

  function getParams() {
    const data = fullPayload;

    // 1a. address

    const address = passport.data?._address;
    if (address) {
      data.site.uprn = String(address.uprn);

      data.site.address_1 = [address.sao, address.pao, address.street]
        .filter(Boolean)
        .join(" ");

      data.site.town = address.town;
      data.site.postcode = address.postcode;

      // TODO: add address_2 and ward
    }

    // 1b. property boundary

    try {
      // find the first draw boundary component breadcrumb
      const boundaryBreadcrumb = Object.entries(breadcrumbs).find(
        ([questionId]) => flow[questionId]?.type === TYPES.DrawBoundary
      );
      if (boundaryBreadcrumb) {
        const [, { data }] = boundaryBreadcrumb;
        if (data) {
          // scan the breadcrumb's data object (what got saved to passport)
          // and extract the first instance of any geojson that's found
          const geojson = Object.values(data).find(
            (v) => v?.type === "Feature"
          );
          if (geojson) data.boundary_geojson = geojson;
        }
      }
    } catch (err) {
      console.error({ boundary_geojson: err });
    }

    // 2. files

    Object.entries(passport.data || {})
      .filter(([, v]: any) => v?.[0]?.url)
      .forEach(([key, arr]) => {
        (arr as any[]).forEach(({ url }) => {
          try {
            data.files = data.files || [];
            data.files.push({
              filename: url,
              tags: [], // should be [key], but BOPS will reject unless it's a specific string
            });
          } catch (err) {}
        });
      });

    // 3. constraints

    data.constraints = (
      passport.data?.["property.constraints.planning"] || []
    ).reduce((acc: Record<string, boolean>, curr: string) => {
      // TODO: calculate application_type and payment_reference
      acc[curr] = true;
      return acc;
    }, {});

    // 4. work status

    if (passport?.data?.["property.constraints.planning"] === "ldc.existing") {
      data.work_status = "existing";
    }

    // 5. keys

    const bopsData = Object.entries(bopsDictionary).reduce(
      (acc, [bopsField, planxField]) => {
        const value = passport.data?.[planxField];
        if (value !== undefined && value !== null) {
          acc[bopsField as keyof BOPSFullPayload] = value;
        }
        return acc;
      },
      {} as Partial<BOPSFullPayload>
    );

    // 6. questions+answers array

    data.proposal_details = makePayload(flow, breadcrumbs);

    const paymentReference =
      passport?.data?.["application.fee.reference.govPay"];

    return {
      ...data,
      ...bopsData,
      ...(paymentReference ? { payment_reference: paymentReference } : {}),
    };
  }
};

export default SendComponent;
