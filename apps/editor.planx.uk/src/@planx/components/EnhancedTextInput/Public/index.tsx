import type { PublicProps } from "@planx/components/shared/types";
import React, { useState } from "react";

import type { EnhancedTextInput, TaskComponentMap } from "../types";
import InitialUserInput from "./InitialUserInput";
import ProjectDescription from "./Tasks/ProjectDescription";

type Props = PublicProps<EnhancedTextInput>;

const taskComponents: TaskComponentMap = {
  projectDescription: ProjectDescription,
};

const EnhancedTextInputComponent = (props: Props) => {
  const [userInput, setUserInput] = useState("");
  const TaskComponent = taskComponents[props.task];
  if (!TaskComponent) return null;

  // TODO: handle "back" navigation

  return (
    <>
      {!userInput && <InitialUserInput {...props} setUserInput={setUserInput} /> }
      {userInput && <TaskComponent {...props} userInput={userInput}/> }
    </>
  );
};

export default EnhancedTextInputComponent;