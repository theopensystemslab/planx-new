import CheckBoxOutlinedIcon from "@material-ui/icons/CheckBoxOutlined";
import React from "react";
import { TYPES } from "../../lib/flow";
import { GeneralQuestion } from "./Question";

const Checklist = (props) => (
  <GeneralQuestion
    {...props}
    headerTextField="Checklist"
    Icon={CheckBoxOutlinedIcon}
    $t={TYPES.Checklist}
  />
);

export default Checklist;
