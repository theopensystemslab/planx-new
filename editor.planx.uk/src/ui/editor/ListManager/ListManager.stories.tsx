import Box from "@mui/material/Box";
import { Meta } from "@storybook/react";
import React, { ChangeEvent, useState } from "react";

import Input from "../../shared/Input/Input";
import ColorPicker from "../ColorPicker/ColorPicker";
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
      label="Colour"
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

export const WithinTemplatedNode = () => {
  const [tasks, setTasks] = useState<Array<Item>>([
    { name: "PlanX primary", color: "#0010A4" },
    { name: "GOV.UK focus", color: "#ffdd00" },
  ]);

  return (
    <ListManager
      values={tasks}
      onChange={setTasks}
      Editor={Editor}
      newValue={() => ({
        name: "",
        color: "#fff",
      })}
      isTemplatedNode={true}
    />
  );
};

export default metadata;
