import React, { ChangeEvent, useState } from "react";
import FixtureContainer from "./FixtureContainer";
import ListManager from "../ListManager";
import Input from "../Input";

const Editor = (props: {
  value: string;
  onChange: (newVal: string) => void;
}) => (
  <Input
    required
    value={props.value}
    onChange={(ev: ChangeEvent<HTMLInputElement>) => {
      props.onChange(ev.target.value);
    }}
    placeholder="Title"
  />
);

const Fixture = () => {
  const [tasks, setTasks] = useState<Array<string>>([]);
  return (
    <FixtureContainer>
      <ListManager
        values={tasks}
        onChange={setTasks}
        Editor={Editor}
        newValue={() => "abcd"}
      />
    </FixtureContainer>
  );
};

export default Fixture;
