import { Page } from "@planx/components/Page/types";
import { PublicProps } from "@planx/components/ui";
import React from "react";

export type Props = PublicProps<Page>;

const PageComponent: React.FC<Props> = (props) => {
  return (
    <>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <pre>{JSON.stringify(props)}</pre>
    </>
  );
};

export default PageComponent;
