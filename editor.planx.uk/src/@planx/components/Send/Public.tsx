import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

const placeholderize = (x: any) => {
  if ((x && typeof x === "string") || x instanceof String) {
    if (new Date(String(x)).toString() === "Invalid Date") {
      return "PLACEHOLDER";
    } else {
      return new Date().toISOString();
    }
  } else if ((x && typeof x === "number") || x instanceof Number) {
    return 0;
  } else if ((x && typeof x === "object") || x instanceof Object) {
    return Object.entries(x).reduce((acc, [k, v]) => {
      acc[k] = placeholderize(v);
      return acc;
    }, x);
  } else {
    return x;
  }
};

interface File {
  filename: string;
  tags?: string;
}

// const date = new Date().toUTCString();

const minimum = {
  application_type: "lawfulness_certificate",
  site: {
    uprn: "",
    address_1: "",
    address_2: "Southwark",
    town: "London",
    postcode: "",
  },
};

const full = {
  ...minimum,

  // "ward": "",

  // "description": "",
  // "work_status": "",

  applicant_first_name: "",
  applicant_last_name: "",
  applicant_email: "",
  // "applicant_phone": "",

  // "agent_first_name": "",
  // "agent_last_name": "",
  // "agent_phone": "",
  // "agent_email": "",

  payment_reference: "JG669323",

  questions: {},
  constraints: {},
  files: [] as Array<File>,
};

const SendComponent: React.FC<Props> = (props) => {
  const [replay, flow, passport, breadcrumbs] = useStore((state) => [
    state.replay,
    state.flow,
    state.passport,
    state.breadcrumbs,
  ]);

  useEffect(() => {
    async function send() {
      try {
        const data = full;

        data.site.uprn = passport.info.UPRN.toString();

        data.site.address_1 = [
          passport.info.sao,
          passport.info.pao,
          passport.info.street,
        ]
          .filter(Boolean)
          .join(" ");

        data.site.postcode = passport.info.postcode;

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

        data.applicant_first_name = answer("firstname");
        data.applicant_last_name = answer("lastname");
        data.applicant_email = answer("email");

        data.files = files;

        // console.log({
        //   data,
        //   flow,
        //   breadcrumbs,
        //   passport,
        // });

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
