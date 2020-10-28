import {
  CallSplit,
  CheckBoxOutlined,
  CloudUpload,
  Create,
  List,
  LocationOnOutlined,
  ReportProblemOutlined,
  SearchOutlined,
  TextFields,
} from "@material-ui/icons";

import { TYPES } from "../data/types";

// XXX: We define the Icon type in terms of one of the Icons so as not to have to repeat ourselves
type Icon = typeof CheckBoxOutlined;

export const ICONS: {
  [key in TYPES]: Icon | undefined;
} = {
  [TYPES.AddressInput]: undefined,
  [TYPES.Checklist]: CheckBoxOutlined,
  [TYPES.Content]: TextFields,
  [TYPES.DateInput]: undefined,
  [TYPES.FileUpload]: CloudUpload,
  [TYPES.FindProperty]: SearchOutlined,
  [TYPES.Flow]: undefined,
  [TYPES.Notice]: ReportProblemOutlined,
  [TYPES.NumberInput]: undefined,
  [TYPES.Portal]: undefined,
  [TYPES.PropertyInformation]: LocationOnOutlined,
  [TYPES.Report]: undefined,
  [TYPES.Response]: undefined,
  [TYPES.Result]: undefined,
  [TYPES.SignIn]: undefined,
  [TYPES.Statement]: CallSplit,
  [TYPES.TaskList]: List,
  [TYPES.TextInput]: Create,
} as const;
