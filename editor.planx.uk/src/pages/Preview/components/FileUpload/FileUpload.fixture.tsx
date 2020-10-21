import React from "react";
import FileUpload from "./FileUpload";

export default (props) => {
  return (
    <FileUpload
      title="License for Coding"
      description="Please upload document(s) that prove you're allowed to write code"
      handleSubmit={console.log}
    />
  );
};
