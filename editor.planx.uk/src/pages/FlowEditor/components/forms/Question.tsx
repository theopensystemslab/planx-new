import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import arrayMove from "array-move";
import { useFormik } from "formik";
import React from "react";
import { flags } from "../../lib/store";
import { TYPES } from "../../lib/flow";
import FileUpload from "./components/FileUpload";
import Input from "./components/Input";
import InputGroup from "./components/InputGroup";
import InputRow from "./components/InputRow";
import InputRowItem from "./components/InputRowItem";
import InternalNotes from "./components/InternalNotes";
import ModalSection from "./components/ModalSection";
import ModalSectionContent from "./components/ModalSectionContent";
import MoreInformation from "./components/MoreInformation";
import SelectInput from "./components/SelectInput";

interface Option {
  val?: string;
  description?: string;
  id?: string;
  flag?: string;
  text?: string;
  img?: string;
}

interface IQuestion {
  fn?: string;
  howMeasured?: string;
  description?: string;
  handleClose?: Function;
  handleSubmit?: Function;
  headerTextField?: string;
  notes?: string;
  options?: Option[];
  policyRef?: string;
  text?: string;
  type?: string;
  info?: string;
  Icon;
  $t: number;
  img?: string;
}

const renderMenuItem = (category: string) => {
  return flags
    .filter((flag) => flag.category === category)
    .map((flag, index) => (
      <MenuItem key={index} value={flag.value}>
        {flag.text}
      </MenuItem>
    ));
};

const ImgInput: React.FC<{ img?: string }> = ({ img }) => (
  <InputRowItem width={50}>
    {img ? (
      <a target="_blank" rel="noopener noreferrer" href={img}>
        <img src={img} alt="embedded img" />
      </a>
    ) : (
      <FileUpload
        onChange={(img) => {
          console.log(img);
        }}
      />
    )}
  </InputRowItem>
);

const Options: React.FC<{ formik: any }> = ({ formik }) => {
  const addRow = () => {
    formik.setFieldValue("options", [
      ...formik.values.options,
      { text: "", description: "", val: "", flag: "" },
    ]);
  };

  const deleteRow = (index) => {
    formik.setFieldValue(
      "options",
      formik.values.options.filter((option, i) => {
        return i !== index;
      })
    );
  };

  const handleMove = (dragIndex: number, hoverIndex: number): void => {
    formik.setFieldValue(
      "options",
      arrayMove(formik.values.options, dragIndex, hoverIndex)
    );
  };

  return (
    <ModalSectionContent title="Options">
      <React.Fragment>
        {formik.values.options.map((option, index) => {
          return (
            <InputGroup
              deletable
              deleteInputGroup={() => deleteRow(index)}
              draggable
              key={index}
              index={index}
              id={option.id}
              handleMove={handleMove}
            >
              <InputRow>
                <InputRowItem width="50%">
                  {option.id && (
                    <input
                      type="hidden"
                      name={`options[${index}].id`}
                      value={option.id}
                      readOnly
                    />
                  )}

                  <Input
                    // required
                    format="bold"
                    name={`options[${index}].text`}
                    value={option.text || ""}
                    onChange={formik.handleChange}
                    placeholder="Option"
                  />
                </InputRowItem>

                <ImgInput img={option.img} />

                <SelectInput
                  name={`options[${index}].flag`}
                  value={option.flag || ""}
                  onChange={formik.handleChange}
                >
                  {option.flag && <MenuItem value="">Remove Flag</MenuItem>}
                  <MenuItem disabled>Listed Buildings</MenuItem>
                  {renderMenuItem("Listed Buildings")}
                  <MenuItem disabled>Planning Permission</MenuItem>
                  {renderMenuItem("Planning Permission")}
                </SelectInput>
              </InputRow>

              <InputRow>
                <Input
                  // required
                  disabled={!formik.values.fn}
                  format="data"
                  name={`options[${index}].val`}
                  value={option.val || ""}
                  placeholder="Data Value"
                  onChange={formik.handleChange}
                />
              </InputRow>
            </InputGroup>
          );
        })}
        <Button onClick={addRow}>add option</Button>
      </React.Fragment>
    </ModalSectionContent>
  );
};

export const GeneralQuestion: React.FC<IQuestion> = ({
  fn = "",
  howMeasured = "",
  description = "",
  headerTextField = "Question",
  text = "",
  notes = "",
  policyRef = "",
  info = "",
  options = [],
  handleSubmit,
  Icon,
  $t,
  img = "",
}) => {
  const formik = useFormik({
    initialValues: {
      info,
      policyRef,
      howMeasured,
      notes,
      text,
      description,
      fn,
      options,
    },
    onSubmit: ({ options, ...values }) => {
      if (handleSubmit) {
        handleSubmit(
          { $t, ...values },
          options.map((o) => ({ ...o, $t: TYPES.Response }))
        );
      } else {
        alert(JSON.stringify({ $t, ...values, options }, null, 2));
      }
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title={headerTextField} Icon={Icon}>
          <InputGroup deletable={false}>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                autoFocus
              />

              <ImgInput img={img} />
            </InputRow>

            <InputRow>
              <Input
                // required
                name="description"
                value={formik.values.description}
                placeholder="Description"
                onChange={formik.handleChange}
              />
            </InputRow>

            <InputRow>
              <Input
                // required
                format="data"
                name="fn"
                value={formik.values.fn}
                placeholder="Data Field"
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <MoreInformation
        whyName="info"
        policyName="policyRef"
        definitionName="howMeasured"
        changeField={formik.handleChange}
        policyValue={formik.values.policyRef}
        definitionValue={formik.values.howMeasured}
        whyValue={formik.values.info}
      />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
};

const Question = (props) => (
  <GeneralQuestion
    {...props}
    headerTextField="Question"
    Icon={CallSplitIcon}
    $t={TYPES.Statement}
  />
);

export default Question;
