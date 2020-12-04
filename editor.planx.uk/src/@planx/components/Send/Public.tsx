import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

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
        props.handleSubmit();
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
