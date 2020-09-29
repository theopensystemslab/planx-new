import { Button } from "@material-ui/core";
import { CheckBoxOutlined } from "@material-ui/icons";
import arrayMove from "array-move";
import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import { FormikHookReturn } from "../../../../types";
import {
  ImgInput,
  Input,
  OptionButton,
  InputGroup,
  InputRow,
  InputRowItem,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  MoreInformation,
  RichTextInput,
} from "../../../../ui";
import { TYPES, Checklist } from "../../data/types";
import { PermissionSelect } from "./shared";

interface ChecklistProps extends Checklist {
  handleSubmit?: Function;
  node?: any;
}

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
      <>
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

                <PermissionSelect
                  name={`options[${index}].flag`}
                  value={option.flag || ""}
                  onChange={formik.handleChange}
                />
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
        <Button onClick={addRow} color="primary" variant="contained">
          Add option
        </Button>
      </>
    </ModalSectionContent>
  );
};

export const ChecklistComponent: React.FC<ChecklistProps> = ({
  fn = "",
  howMeasured = "",
  description = "",
  text = "",
  notes = "",
  policyRef = "",
  info = "",
  options = [],
  handleSubmit,
  img = "",
  definitionImg = "",
  allRequired = false,
}) => {
  const $t = TYPES.Checklist;

  const formik = useFormik<Checklist>({
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
      allRequired,
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
        <ModalSectionContent title="Checklist" Icon={CheckBoxOutlined}>
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

            <OptionButton
              selected={formik.values.allRequired}
              onClick={() => {
                formik.setFieldValue("allRequired", !formik.values.allRequired);
              }}
            >
              All required
            </OptionButton>
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

export default ChecklistComponent;
