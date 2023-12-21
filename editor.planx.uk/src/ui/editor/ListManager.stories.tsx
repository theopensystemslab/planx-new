import Box from "@mui/material/Box";
import { Meta } from "@storybook/react";
import React, { ChangeEvent, useState } from "react";

import Input from "../shared/Input";
import ColorPicker from "./ColorPicker";
import ListManager from "./ListManager";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/ListManager",
  component: ListManager,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

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

export const Basic = () => {
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

export default metadata;
