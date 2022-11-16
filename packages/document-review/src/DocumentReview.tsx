import React from "react";
import "./style.css";

type Props = any;

const DocumentReview = (props: Props) => (
  <>
    <h1>{"Document Review"}</h1>
    <div className="data">
      <pre>DATA: {JSON.stringify(props, null, 2)}</pre>
    </div>
  </>
);

export default DocumentReview;
