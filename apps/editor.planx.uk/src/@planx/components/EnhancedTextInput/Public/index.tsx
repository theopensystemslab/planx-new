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
  const [step, setStep] = useState<"input" | "task">("input");
  const [submittedInput, setSubmittedInput] = useState("");

  const TaskComponent = taskComponents[props.task];
  if (!TaskComponent) return null;

  return (
    <>
      {step === "input" && (
        <InitialUserInput
          {...props}
          initialValue={submittedInput}
          onSubmit={(value) => {
            setSubmittedInput(value);
            setStep("task");
          }}
        />
      )}
      {step === "task" && (
        <TaskComponent
          {...props}
          userInput={submittedInput}
          // onBack={() => setStep("input")}
        />
      )}
    </>
  );
};

export default EnhancedTextInputComponent;