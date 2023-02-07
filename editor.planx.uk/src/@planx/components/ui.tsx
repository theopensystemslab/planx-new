import BorderColorIcon from "@mui/icons-material/BorderColor";
import CallSplit from "@mui/icons-material/CallSplit";
import CheckBoxOutlined from "@mui/icons-material/CheckBoxOutlined";
import CloudUpload from "@mui/icons-material/CloudUpload";
import ContactPage from "@mui/icons-material/ContactPage";
import CopyAll from "@mui/icons-material/CopyAll";
import Create from "@mui/icons-material/Create";
import Event from "@mui/icons-material/Event";
import FunctionsIcon from "@mui/icons-material/Functions";
import Home from "@mui/icons-material/Home";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import List from "@mui/icons-material/List";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import Map from "@mui/icons-material/Map";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import Pin from "@mui/icons-material/Pin";
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
import PlaylistAddCheck from "@mui/icons-material/PlaylistAddCheck";
import RateReview from "@mui/icons-material/RateReview";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import Send from "@mui/icons-material/Send";
import SquareFoot from "@mui/icons-material/SquareFoot";
import TextFields from "@mui/icons-material/TextFields";
import { TYPES } from "@planx/components/types";
import { Store } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { ChangeEvent } from "react";
import ImgInput from "ui/ImgInput";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

export interface EditorProps<Type, Data> {
  id?: string;
  handleSubmit?: (data: { type: Type; data: Data }) => void;
  node?: any;
}

export type PublicProps<Data, UserData = {}> = Data & {
  id?: string;
  handleSubmit?: handleSubmit;
  resetButton?: boolean;
  resetPreview?: () => void;
  autoFocus?: boolean;
  previouslySubmittedData?: Store.userData;
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
  [TYPES.Filter]: undefined,
  [TYPES.FindProperty]: SearchOutlined,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: undefined,
  [TYPES.Notice]: ReportProblemOutlined,
  [TYPES.NumberInput]: Pin,
  [TYPES.Pay]: PaymentOutlined,
  [TYPES.PlanningConstraints]: Map,
  [TYPES.PropertyInformation]: LocationOnOutlined,
  [TYPES.Response]: undefined,
  [TYPES.Result]: PlaylistAddCheck,
  [TYPES.Review]: RateReview,
  [TYPES.Send]: Send,
  [TYPES.SetValue]: PlaylistAdd,
  [TYPES.Statement]: CallSplit,
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
        <InputGroup label="Why it matters">
          <InputRow>
            <RichTextInput
              multiline
              name="info"
              value={info}
              onChange={changeField}
              placeholder="Why it matters"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Policy source">
          <InputRow>
            <RichTextInput
              multiline
              name="policyRef"
              value={policyRef}
              onChange={changeField}
              placeholder="Policy source"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="How it is defined?">
          <InputRow>
            <RichTextInput
              multiline
              name="howMeasured"
              value={howMeasured}
              onChange={changeField}
              placeholder="How it is defined?"
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
