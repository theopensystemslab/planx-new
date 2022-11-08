import React from "react";

const DocView = (data: any) => (
  <>
    <h1>{"Doc View"}</h1>
    <div className="data">
      <pre>DATA: {JSON.stringify(data, null, 2)}</pre>
    </div>
  </>
);

export default DocView;
