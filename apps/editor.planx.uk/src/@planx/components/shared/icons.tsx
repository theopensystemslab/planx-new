import AltRoute from "@mui/icons-material/AltRoute";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Article from "@mui/icons-material/Article";
import CallSplit from "@mui/icons-material/CallSplit";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import CloudUpload from "@mui/icons-material/CloudUpload";
import ContactPage from "@mui/icons-material/ContactPage";
import Create from "@mui/icons-material/Create";
import CurrencyPound from "@mui/icons-material/CurrencyPound";
import Event from "@mui/icons-material/Event";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import Folder from "@mui/icons-material/Folder";
import FunctionsIcon from "@mui/icons-material/Functions";
import Home from "@mui/icons-material/Home";
import List from "@mui/icons-material/List";
import ListAlt from "@mui/icons-material/ListAlt";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import Map from "@mui/icons-material/Map";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import Pin from "@mui/icons-material/Pin";
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheck from "@mui/icons-material/PlaylistAddCheck";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import Send from "@mui/icons-material/Send";
import ShapeLine from "@mui/icons-material/ShapeLine";
import SquareFoot from "@mui/icons-material/SquareFoot";
import TextFields from "@mui/icons-material/TextFields";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconProps, SvgIconTypeMap } from "@mui/material/SvgIcon";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import * as React from "react";
import EditorIcon from "ui/icons/Editor";

// XXX: We define the Icon type in terms of one of the Icons so as not to have to repeat ourselves
type MuiIcon = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
  muiName: string;
};
type CustomIcon = React.ComponentType<SvgIconProps>;
type Icon = MuiIcon | CustomIcon;

export const ICONS: {
  [key in TYPES]: Icon | undefined;
} = {
  [TYPES.AddressInput]: Home,
  [TYPES.Calculate]: FunctionsIcon,
  [TYPES.Checklist]: CheckBoxOutlined,
  [TYPES.ContactInput]: ContactPage,
  [TYPES.Content]: TextFields,
  [TYPES.Confirmation]: TextFields,
  [TYPES.DateInput]: Event,
  [TYPES.DrawBoundary]: SquareFoot,
  [TYPES.ExternalPortal]: EditorIcon,
  [TYPES.FileUpload]: CloudUpload,
  [TYPES.FileUploadAndLabel]: CloudUpload,
  [TYPES.Filter]: FilterAltOutlined,
  [TYPES.FindProperty]: SearchOutlined,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: Folder,
  [TYPES.List]: ListAlt,
  [TYPES.MapAndLabel]: ShapeLine,
  [TYPES.Notice]: ReportProblemOutlined,
  [TYPES.NextSteps]: ArrowForwardIcon,
  [TYPES.NumberInput]: Pin,
  [TYPES.Page]: Article,
  [TYPES.Pay]: PaymentOutlined,
  [TYPES.PlanningConstraints]: Map,
  [TYPES.PropertyInformation]: LocationOnOutlined,
  [TYPES.Answer]: undefined,
  [TYPES.ResponsiveChecklist]: CheckBoxOutlined,
  [TYPES.ResponsiveQuestion]: AltRoute,
  [TYPES.Result]: PlaylistAddCheck,
  [TYPES.Review]: RateReviewOutlined,
  [TYPES.Section]: List,
  [TYPES.Send]: Send,
  [TYPES.SetFee]: CurrencyPound,
  [TYPES.SetValue]: PlaylistAdd,
  [TYPES.Question]: CallSplit,
  [TYPES.TaskList]: List,
  [TYPES.TextInput]: Create,
  [TYPES.Feedback]: RateReviewIcon,
} as const;
