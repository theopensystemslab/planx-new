import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Article from "@mui/icons-material/Article";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import CallSplit from "@mui/icons-material/CallSplit";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import CloudUpload from "@mui/icons-material/CloudUpload";
import ContactPage from "@mui/icons-material/ContactPage";
import CopyAll from "@mui/icons-material/CopyAll";
import Create from "@mui/icons-material/Create";
import DoorFrontOutlined from "@mui/icons-material/DoorFrontOutlined";
import Event from "@mui/icons-material/Event";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import FunctionsIcon from "@mui/icons-material/Functions";
import Home from "@mui/icons-material/Home";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import List from "@mui/icons-material/List";
import ListAlt from "@mui/icons-material/ListAlt";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import Map from "@mui/icons-material/Map";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import Pin from "@mui/icons-material/Pin";
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheck from "@mui/icons-material/PlaylistAddCheck";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import Send from "@mui/icons-material/Send";
import ShapeLine from "@mui/icons-material/ShapeLine";
import SquareFoot from "@mui/icons-material/SquareFoot";
import TextFields from "@mui/icons-material/TextFields";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { Store } from "pages/FlowEditor/lib/store";
import type { HandleSubmit } from "pages/Preview/Node";
import React, { ChangeEvent } from "react";
import ImgInput from "ui/editor/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

export interface EditorProps<Type, Data> {
  id?: string;
  handleSubmit?: (data: { type: Type; data: Data }) => void;
  node?: any;
}

export type PublicProps<Data> = Data & {
  id?: string;
  handleSubmit?: HandleSubmit;
  resetButton?: boolean;
  resetPreview?: () => void;
  autoFocus?: boolean;
  previouslySubmittedData?: Store.UserData;
};

// XXX: We define the Icon type in terms of one of the Icons so as not to have to repeat ourselves
type Icon = typeof CheckBoxOutlined;

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
  [TYPES.ExternalPortal]: CopyAll,
  [TYPES.FileUpload]: CloudUpload,
  [TYPES.FileUploadAndLabel]: CloudUpload,
  [TYPES.Filter]: FilterAltOutlined,
  [TYPES.FindProperty]: SearchOutlined,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: DoorFrontOutlined,
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
  [TYPES.Result]: PlaylistAddCheck,
  [TYPES.Review]: RateReviewOutlined,
  [TYPES.Section]: List,
  [TYPES.Send]: Send,
  [TYPES.SetValue]: PlaylistAdd,
  [TYPES.Question]: CallSplit,
  [TYPES.TaskList]: List,
  [TYPES.TextInput]: Create,
} as const;

interface MoreInformationProps {
  changeField: (changes: any) => any;
  howMeasured?: string;
  policyRef?: string;
  info?: string;
  definitionImg?: string;
}

export const MoreInformation = ({
  changeField,
  definitionImg,
  howMeasured,
  policyRef,
  info,
}: MoreInformationProps) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More Information" Icon={InfoOutlined}>
        <InputGroup flowSpacing>
          <InputLabel label="Why it matters">
            <RichTextInput
              multiline
              name="info"
              value={info}
              onChange={changeField}
            />
          </InputLabel>
          <InputLabel label="Policy source">
            <RichTextInput
              multiline
              name="policyRef"
              value={policyRef}
              onChange={changeField}
            />
          </InputLabel>
          <InputLabel label="How it is defined?" htmlFor="howMeasured">
            <InputRow>
              <RichTextInput
                multiline
                name="howMeasured"
                value={howMeasured}
                onChange={changeField}
              />
              <ImgInput
                img={definitionImg}
                onChange={(newUrl) => {
                  changeField({
                    target: { name: "definitionImg", value: newUrl },
                  });
                }}
              />
            </InputRow>
          </InputLabel>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};

export interface InternalNotesProps {
  name?: string;
  value?: string;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

export const InternalNotes: React.FC<InternalNotesProps> = ({
  name,
  value,
  onChange,
}) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Internal Notes" Icon={BorderColorIcon}>
        <InputRow>
          <Input
            // required
            name={name}
            value={value}
            onChange={onChange}
            multiline
            placeholder="Internal Notes"
            rows={3}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};

export const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? <span className="error">{message}</span> : null;
