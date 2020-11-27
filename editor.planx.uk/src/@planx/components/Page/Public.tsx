import React from "react";

import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import { Page } from "./model";

export type Props = PublicProps<Page>;

const PageComponent: React.FC<Props> = (props) => {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <h1>{props.title}</h1>
      <p role="description">{props.description}</p>
      <pre>{JSON.stringify(props)}</pre>
    </Card>
  );
};

export default PageComponent;
