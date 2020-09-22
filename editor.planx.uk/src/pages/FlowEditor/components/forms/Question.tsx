import { Button, MenuItem } from "@material-ui/core";
import { CallSplit } from "@material-ui/icons";
import arrayMove from "array-move";
import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import { FormikHookReturn } from "../../../../types";
import {
  ImgInput,
  Input,
  InputGroup,
  InputRow,
  InputRowItem,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  MoreInformation,
  RichTextInput,
  SelectInput,
} from "../../../../ui";
import flags from "../../data/flags";
import { TYPES } from "../../data/types";

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
  definitionImg?: string;
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

const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
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
              draggable={false}
              deleteInputGroup={() => deleteRow(index)}
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

                <ImgInput
                  img={option.img}
                  onChange={(img) => {
                    formik.setFieldValue(`options[${index}].img`, img);
                  }}
                />

                <SelectInput
                  name={`options[${index}].flag`}
                  value={option.flag || ""}
                  onChange={formik.handleChange}
                >
                  {option.flag && <MenuItem value="">Remove Flag</MenuItem>}
                  <MenuItem disabled>Planning permission</MenuItem>
                  {renderMenuItem("Planning permission")}
                  <MenuItem disabled>Listed building consent</MenuItem>
                  {renderMenuItem("Listed building consent")}
                  <MenuItem disabled>Works to trees</MenuItem>
                  {renderMenuItem("Works to trees")}
                  <MenuItem disabled>
                    Demolition in a conservation area
                  </MenuItem>
                  {renderMenuItem("Demolition in a conservation area")}
                  <MenuItem disabled>Planning policy</MenuItem>
                  {renderMenuItem("Planning policy")}
                  <MenuItem disabled>Community infrastructure levy</MenuItem>
                  {renderMenuItem("Community infrastructure levy")}
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
  definitionImg = "",
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
      img,
      definitionImg,
    },
    onSubmit: ({ options, ...values }) => {
      if (handleSubmit) {
        handleSubmit(
          { $t, ...values },
          options
            .filter((o) => o.text)
            .map((o) => ({ ...o, $t: TYPES.Response }))
        );
      } else {
        alert(JSON.stringify({ $t, ...values, options }, null, 2));
      }
    },
    validate: () => {},
  });

  const focusRef = useRef(null);

  // horrible hack to remove focus from Rich Text Editor
  useEffect(() => {
    setTimeout(() => {
      (document.activeElement as any).blur();
      focusRef.current?.focus();
    }, 50);
  }, []);

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
                inputRef={focusRef}
              />

              <ImgInput
                img={formik.values.img}
                onChange={(newUrl) => {
                  formik.setFieldValue("img", newUrl);
                }}
              />
            </InputRow>

            <InputRow>
              <RichTextInput
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
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        definitionName="howMeasured"
        definitionValue={formik.values.howMeasured}
        formik={formik}
        policyName="policyRef"
        policyValue={formik.values.policyRef}
        whyName="info"
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
    Icon={CallSplit}
    $t={TYPES.Statement}
  />
);

export default Question;
