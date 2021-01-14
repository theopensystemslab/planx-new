import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

interface File {
  filename: string;
  tags?: string;
}

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

const minimumPayload = {
  application_type: "lawfulness_certificate",
  site: {
    uprn: "",
    address_1: "",
    address_2: "",
    town: "",
    postcode: "",
  },
};

const fullPayload = {
  ...minimumPayload,

  // "ward": "",
  // "work_status": "",

  description: "",

  applicant_first_name: "",
  applicant_last_name: "",
  applicant_email: "",
  applicant_phone: "",

  agent_first_name: "",
  agent_last_name: "",
  agent_phone: "",
  agent_email: "",

  payment_reference: "JG669323", // hardcoded demo value

  questions: {},
  constraints: {},
  files: [] as Array<File>,
};

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport, replay] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.passport,
    state.replay,
  ]);

  useEffect(() => {
    async function send() {
      try {
        const data = fullPayload;

        data.site.uprn = passport.info.UPRN.toString();

        data.site.address_1 = [
          passport.info.sao,
          passport.info.pao,
          passport.info.street,
        ]
          .filter(Boolean)
          .join(" ");

        data.site.postcode = passport.info.postcode;

        // TODO: shape this into the object described in
        // https://southwark.preview.bops.services/api-docs/index.html
        data.questions = { flow: replay() };

        data.constraints = (
          passport.data["property.constraints.planning"] || []
        ).reduce((acc: Record<string, boolean>, curr: string) => {
          acc[curr] = true;
          return acc;
        }, {});

        const files = [] as Array<File>;

        Object.values(breadcrumbs).forEach(({ answers = [] }) => {
          answers.forEach((x: any) => {
            if (x.filename && x.url) {
              files.push({
                filename: x.url,
                // tags: x.filename,
              });
            }
          });
        });

        const answer = (key: string): string => {
          const id = Object.keys(flow).find((id) => flow[id].data?.fn === key);
          return id ? breadcrumbs[id].answers[0] : "";
        };

        const fields: Array<keyof typeof data> = [
          "agent_email",
          "agent_first_name",
          "agent_last_name",
          "agent_phone",
          "applicant_email",
          "applicant_first_name",
          "applicant_last_name",
          "applicant_phone",
          "description",
        ];
        fields.forEach((field) => {
          data[field] = answer(field) as any;
        });

        data.files = files;

        await axios.post(props.url, data);

        if (props.handleSubmit) props.handleSubmit();
      } catch (err) {
        alert("There was an error sending the data");
        console.error(err);
      }
    }

    send();
  }, []);

  return <Card>Sending data</Card>;
};

export default SendComponent;
