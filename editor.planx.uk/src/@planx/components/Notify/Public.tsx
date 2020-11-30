import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import axios from "axios";
import React from "react";

import type { Notify } from "./model";

export type Props = PublicProps<Notify>;

const NotifyComponent: React.FC<Props> = (props) => {
  return (
    <Card
      handleSubmit={async () => {
        try {
          await axios.post(props.url, {
            hello: "world",
          });
          props.handleSubmit();
        } catch (err) {
          alert("There was an error");
          console.error(err);
        }
      }}
      isValid
    >
      <h1>Notify</h1>
    </Card>
  );
};

export default NotifyComponent;
