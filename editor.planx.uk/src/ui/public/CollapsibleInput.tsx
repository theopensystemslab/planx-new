import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import React, { useState } from "react";
import Input from "ui/shared/Input";

export interface Props {
  children: JSX.Element[] | JSX.Element;
  handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  name: string;
  ariaLabel: string;
}

const CollapsibleInput: React.FC<Props> = (props: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Link component="button" onClick={() => setExpanded((x) => !x)}>
        {props.children}
      </Link>
      <Collapse in={expanded}>
        <Input
          multiline
          bordered
          value={props.value}
          name={props.name}
          onChange={props.handleChange}
          id={props.name}
          inputProps={{ "aria-label": props.ariaLabel }}
        />
      </Collapse>
    </>
  );
};

export default CollapsibleInput;
