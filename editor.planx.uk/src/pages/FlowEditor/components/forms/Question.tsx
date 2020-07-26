import React from "react";

const Question: React.FC<{ handleSubmit: any }> = ({ handleSubmit }) => {
  return (
    <form id="modal" onSubmit={handleSubmit}>
      New Question
    </form>
  );
};

export default Question;
