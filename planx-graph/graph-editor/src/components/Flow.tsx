import React from "react";

const Flow = ({ children }) => {
  return (
    <ol id="flow" data-layout="top-down">
      {children}
    </ol>
  );
};

export default Flow;
