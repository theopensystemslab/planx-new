import MoreTimeIcon from "@mui/icons-material/MoreTime";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import BasicRadio from "../shared/Radio/BasicRadio/BasicRadio";
import {
  parseSection,
  Section,
  SECTION_LENGTH,
  SECTION_LENGTH_DESCRIPTIONS,
  SectionLength,
  validationSchema,
} from "./model";

type Props = EditorProps<TYPES.Section, Section>;

export default SectionComponent;

const SectionLengthLabel: React.FC<{ length: SectionLength }> = ({
  length,
}) => (
  <Box>
    <Typography
      sx={{ textTransform: "capitalize", fontWeight: FONT_WEIGHT_SEMI_BOLD }}
    >
      {length}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {SECTION_LENGTH_DESCRIPTIONS[length]}
    </Typography>
  </Box>
);

function SectionComponent(props: Props) {
  const formik = useFormikWithRef<Section>(
    {
      initialValues: parseSection(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: TYPES.Section,
          data: newValues,
        });
      },
      validationSchema,
    },
    props.formikRef,
  );

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("length", target.value);
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Section marker" Icon={ICONS[TYPES.Section]}>
          <InputRow>
            <Input
              required
              format="large"
              name="title"
              placeholder="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Short section description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              variant="paragraphContent"
              errorMessage={formik.errors.description}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Section length" Icon={MoreTimeIcon}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Please estimate the relative length of this section. This will be
            used to calculate a user's progress through your service.
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              defaultValue="medium"
              value={formik.values.length}
              sx={{ gap: 1 }}
            >
              {SECTION_LENGTH.map((length) => (
                <BasicRadio
                  key={length}
                  id={length}
                  label={<SectionLengthLabel length={length} />}
                  variant="compact"
                  value={length}
                  onChange={handleRadioChange}
                  disabled={props.disabled}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
}
