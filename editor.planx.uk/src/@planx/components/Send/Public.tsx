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

const SendComponent: React.FC<Props> = (props) => {
  const [replay, passport] = useStore((state) => [
    state.replay,
    state.passport,
  ]);

  useEffect(() => {
    async function send() {
      try {
        await axios.post(props.url, {
          passport,
          replay: replay(),
        });
        props.handleSubmit && props.handleSubmit();
      } catch (err) {
        alert("There was an error sending the data");
        console.error(err);
      }
    }

    send();
  }, []);

  return <Card>Sending data...</Card>;
};

export default SendComponent;
