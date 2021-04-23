import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import { bopsDictionary, fullPayload, makePayload } from "./bops";
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
      props.handleSubmit({
        data: {
          bopsId: request.value.data.application.id,
        },
      });
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

    // 1. address

    const address = passport.data?._address?.value;
    if (address) {
      data.site.uprn = String(address.uprn);

      data.site.address_1 = [address.sao, address.pao, address.street]
        .filter(Boolean)
        .join(" ");

      data.site.town = address.town;
      data.site.postcode = address.postcode;

      // TODO: add address_2 and ward
    }

    // 2. files

    Object.values(breadcrumbs).forEach(({ answers = [] }) => {
      answers.filter(Boolean).forEach((str) => {
        try {
          // data has been JSON.stringify'd temporarily to adhere to answers: string[] type
          const { filename, url } = JSON.parse(str);
          if (filename && url) {
            data.files = data.files || [];

            data.files.push({
              filename: String(url),
              tags: [],
              // TODO: replace tags with passport field
            });
          }
        } catch (err) {}
      });
    });

    // 3. constraints

    data.constraints = (
      passport.data?.["property.constraints.planning"]?.value || []
    ).reduce((acc: Record<string, boolean>, curr: string) => {
      // TODO: calculate application_type and payment_reference
      acc[curr] = true;
      return acc;
    }, {});

    // 4. work status

    if (
      passport?.data?.["property.constraints.planning"].value === "ldc.existing"
    ) {
      data.work_status = "existing";
    }

    // 5. keys

    const keys = Object.keys(flow);

    const bopsData = Object.entries(bopsDictionary).reduce(
      (acc, [bopsField, planxField]) => {
        const id = keys.find((id) => flow[id].data?.fn === planxField);
        if (id) {
          const value = breadcrumbs[id]?.answers![0];
          if (value) {
            acc[bopsField] = value;
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // 6. questions+answers array

    data.proposal_details = makePayload(flow, breadcrumbs);

    const paymentReference =
      passport?.data?.["application.fee.reference.govPay"]?.value?.[0];

    return {
      ...data,
      ...bopsData,
      ...(paymentReference ? { payment_reference: paymentReference } : {}),
    };
  }
};

export default SendComponent;
