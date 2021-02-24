import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import { bopsDictionary, fullPayload, makePayload } from "./bops";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.passport,
  ]);

  useEffect(() => {
    async function send() {
      try {
        const data = fullPayload;

        // 1. address

        if (passport.info) {
          data.site.uprn = String(passport.info.uprn);

          try {
            data.site.address_1 = [
              passport.info.sao,
              passport.info.pao,
              passport.info.street,
            ]
              .filter(Boolean)
              .join(" ");

            data.site.town = passport.info.town;
            data.site.postcode = passport.info.postcode;

            // TODO: add address_2 and ward
          } catch (err) {
            console.error(err);
          }
        }

        // 2. files

        Object.values(breadcrumbs).forEach(({ answers = [] }) => {
          answers.forEach((x: any) => {
            if (x.filename && x.url) {
              data.files ||= [];

              data.files.push({
                filename: String(x.url),
                tags: [],
                // TODO: replace tags with passport field
              });
            }
          });
        });

        // 3. constraints

        data.constraints = (
          passport.data["property.constraints.planning"]?.value || []
        ).reduce((acc: Record<string, boolean>, curr: string) => {
          // TODO: calculate application_type and payment_reference
          acc[curr] = true;
          return acc;
        }, {});

        // 4. work status

        if (
          passport?.data["property.constraints.planning"] === "ldc.existing"
        ) {
          data.work_status = "existing";
        }

        // 5. keys

        const keys = Object.keys(flow);

        const bopsData = Object.entries(bopsDictionary).reduce(
          (acc, [bopsField, planxField]) => {
            const id = keys.find((id) => flow[id].data?.fn === planxField);
            if (id) {
              const value = breadcrumbs[id].answers[0];
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

        // 7. submit

        await axios.post(props.url, { ...data, ...bopsData });
      } catch (err) {
        console.error(err);
      } finally {
        if (props.handleSubmit) props.handleSubmit([]);
      }
    }

    send();
  }, []);

  return <Card>Sending data</Card>;
};

export default SendComponent;
