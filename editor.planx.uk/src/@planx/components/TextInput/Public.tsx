import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { TextInput, UserData } from "@planx/components/TextInput/model";
import { PublicProps } from "@planx/components/ui";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useMemo, useState } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import RichTextInput from "ui/RichTextInput";

export type Props = PublicProps<TextInput, UserData>;

const isValidEmail = (str: string) => {
  // eslint-disable-next-line
  let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(str);
};

const TextInputComponent: React.FC<Props> = (props) => {
  const page = useStore((state) => state.page);
  const [value, setValue] = useState<string>("");
  const isValid = useMemo(() => {
    if (props.type === "email") {
      return isValidEmail(value);
    }
    return !!value;
  }, [value, props.type]);

  const handleSubmit =
    page === ROOT_NODE_KEY
      ? () => props.handleSubmit && props.handleSubmit(value)
      : undefined;

  return (
    <Card handleSubmit={handleSubmit} isValid={isValid}>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputRow>
        {props.type === "long" ? (
          <RichTextInput
            value={value}
            placeholder={props.placeholder || "Type your answer"}
            bordered
            onChange={(ev) => {
              setValue(ev.target.value);
              if (isValid) {
                props.handleSubmit && props.handleSubmit(value);
              }
            }}
          />
        ) : (
          <Input
            type={props.type === "email" ? "email" : "text"}
            value={value}
            placeholder={props.placeholder || "Type your answer"}
            bordered
            onChange={(ev) => {
              setValue(ev.target.value);
              if (isValid) {
                props.handleSubmit && props.handleSubmit(value);
              }
            }}
          />
        )}
      </InputRow>
    </Card>
  );
};

export default TextInputComponent;
