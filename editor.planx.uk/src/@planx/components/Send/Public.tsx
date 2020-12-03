import axios from "axios";
import React from "react";
import ReactMarkdown from "react-markdown";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = (props) => {
  return (
    <Card
      handleSubmit={async () => {
        try {
          const { data } = await axios.get(
            "https://raw.githubusercontent.com/unboxed/bops-schemas/ae89456ab861b22c21d60c959fce00986cc276c8/minimum-request.json"
          );
          await axios.post(props.url, data);
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

export default SendComponent;
