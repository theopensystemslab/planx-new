import {
  CallSplit,
  CheckBoxOutlined,
  Create,
  List,
  LocationOnOutlined,
  ReportProblemOutlined,
  SearchOutlined,
  TextFields,
} from "@material-ui/icons";
import React from "react";

import { TYPES } from "../data/types";

export const nodeIcon = (type: TYPES): React.FC | undefined => {
  switch (type) {
    case TYPES.Checklist:
      return CheckBoxOutlined;
    case TYPES.Content:
      return TextFields;
    case TYPES.Statement:
      return CallSplit;
    case TYPES.FindProperty:
      return SearchOutlined;
    case TYPES.PropertyInformation:
      return LocationOnOutlined;
    case TYPES.Notice:
      return ReportProblemOutlined;
    case TYPES.TextInput:
      return Create;
    case TYPES.TaskList:
      return List;
    default:
      return undefined;
  }
};
