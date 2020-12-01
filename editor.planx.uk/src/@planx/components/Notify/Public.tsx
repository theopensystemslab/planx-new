import axios from "axios";
import React from "react";
import ReactMarkdown from "react-markdown";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
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
      <h1>{props.title}</h1>
      <ReactMarkdown source={props.description} />
    </Card>
  );
};

export default NotifyComponent;
