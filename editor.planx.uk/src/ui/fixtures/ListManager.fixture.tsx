import { Box } from "@material-ui/core";
import React, { ChangeEvent, useState } from "react";

import ColorPicker from "../ColorPicker";
import Input from "../Input";
import ListManager from "../ListManager";

interface Item {
  name: string;
  color: string;
}

const Editor = (props: { value: Item; onChange: (newVal: Item) => void }) => (
  <Box>
    <Input
      required
      value={props.value.name}
      onChange={(ev: ChangeEvent<HTMLInputElement>) => {
        props.onChange({
          ...props.value,
          name: ev.target.value,
        });
      }}
      placeholder="Title"
    />
    <ColorPicker
      color={props.value.color}
      onChange={(color) => {
        props.onChange({
          ...props.value,
          color,
        });
      }}
    />
  </Box>
);

const Fixture = () => {
  const [tasks, setTasks] = useState<Array<Item>>([]);
  return (
    <ListManager
      values={tasks}
      onChange={setTasks}
      Editor={Editor}
      newValue={() => ({
        name: "",
        color: "#fff",
      })}
    />
  );
};

export default Fixture;
