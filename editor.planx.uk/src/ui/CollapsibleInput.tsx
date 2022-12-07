import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import Input from "ui/Input";

export interface Props {
  children: JSX.Element[] | JSX.Element;
  handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  name: string;
}

const CollapsibleInput: React.FC<Props> = (props: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Link
        component="button"
        onClick={() => setExpanded((x) => !x)}
        sx={{ marginBottom: 2 }}
      >
        {props.children}
      </Link>
      <Collapse in={expanded}>
        <Box py={0.5}>
          <Input
            multiline
            bordered
            value={props.value}
            name={props.name}
            onChange={props.handleChange}
          />
        </Box>
      </Collapse>
    </>
  );
};

export default CollapsibleInput;
