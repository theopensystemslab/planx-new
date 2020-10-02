import React from "react";
import { TYPES } from "../data/types";
import {
  CheckBoxOutlined,
  LocationOnOutlined,
  TextFields,
  CallSplit,
  SearchOutlined,
  ReportProblemOutlined,
  List,
} from "@material-ui/icons";

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
    case TYPES.TaskList:
      return List;
    default:
      return undefined;
  }
};
