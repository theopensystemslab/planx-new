import BorderColorIcon from "@material-ui/icons/BorderColor";
import CallSplit from "@material-ui/icons/CallSplit";
import CheckBoxOutlined from "@material-ui/icons/CheckBoxOutlined";
import CloudUpload from "@material-ui/icons/CloudUpload";
import Create from "@material-ui/icons/Create";
import Description from "@material-ui/icons/Description";
import InfoOutlined from "@material-ui/icons/InfoOutlined";
import List from "@material-ui/icons/List";
import LocationOnOutlined from "@material-ui/icons/LocationOnOutlined";
import PaymentOutlined from "@material-ui/icons/PaymentOutlined";
import ReportProblemOutlined from "@material-ui/icons/ReportProblemOutlined";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import TextFields from "@material-ui/icons/TextFields";
import { TYPES } from "planx-nodes/types";
import React, { ChangeEvent } from "react";
import {
  ImgInput,
  Input,
  InputGroup,
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "ui";

// XXX: We define the Icon type in terms of one of the Icons so as not to have to repeat ourselves
type Icon = typeof CheckBoxOutlined;

export const ICONS: {
  [key in TYPES]: Icon | undefined;
} = {
  [TYPES.AddressInput]: undefined,
  [TYPES.Checklist]: CheckBoxOutlined,
  [TYPES.Content]: TextFields,
  [TYPES.DateInput]: undefined,
  [TYPES.ExternalPortal]: undefined,
  [TYPES.FileUpload]: CloudUpload,
  [TYPES.Filter]: undefined,
  [TYPES.FindProperty]: SearchOutlined,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: undefined,
  [TYPES.Notice]: ReportProblemOutlined,
  [TYPES.NumberInput]: undefined,
  [TYPES.Page]: Description,
  [TYPES.Pay]: PaymentOutlined,
  [TYPES.PropertyInformation]: LocationOnOutlined,
  [TYPES.Report]: undefined,
  [TYPES.Response]: undefined,
  [TYPES.Result]: undefined,
  [TYPES.SignIn]: undefined,
  [TYPES.Statement]: CallSplit,
  [TYPES.TaskList]: List,
  [TYPES.TextInput]: Create,
} as const;

interface MoreInformationProps {
  changeField: (any) => any;
  howMeasured: string;
  policyRef: string;
  info: string;
  definitionImg: string;
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
  value: string;
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
