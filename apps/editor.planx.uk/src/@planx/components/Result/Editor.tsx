import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  Flag,
  FlagSet,
  flatFlags,
  getNoResultFlag,
} from "@opensystemslab/planx-core/types";
import { Form, Formik, useFormikContext } from "formik";
import groupBy from "lodash/groupBy";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { FlagDisplayText, Result, validationSchema } from "./model";

type FlagWithValue = Flag & { value: NonNullable<Flag["value"]> };

const flagsWithValues = flatFlags.filter((flag): flag is FlagWithValue =>
  Boolean(flag.value),
);
const flags = groupBy(flagsWithValues, (f) => f.category);

const FlagEditor: React.FC<{
  flag: Flag;
  existingOverrides?: FlagDisplayText;
  onChange: (newValues: any) => any;
  disabled?: boolean;
  children?: React.ReactNode;
}> = (props) => {
  const { flag, existingOverrides } = props;
  const { errors } = useFormikContext<Result>();

  return (
    <Box px={1.5} py={2} bgcolor={flag.bgColor} color={flag.color} mt={1}>
      <Box>
        <Typography variant="h4">{flag.text}</Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <InputLabel label="Heading">
          <Input
            multiline
            value={existingOverrides?.heading ?? ""}
            onChange={(ev) =>
              props.onChange({ ...existingOverrides, heading: ev.target.value })
            }
            disabled={props.disabled}
          />
        </InputLabel>
        <InputLabel label="Description" htmlFor="description">
          <RichTextInput
            name="description"
            id="description"
            value={existingOverrides?.description ?? ""}
            onChange={(ev) =>
              props.onChange({
                ...existingOverrides,
                description: ev.target.value,
              })
            }
            disabled={props.disabled}
            // @ts-expect-error - Incorrect type for FormikErrors and getIn()
            errorMessage={errors.overrides?.[flag.value!]?.description}
          />
        </InputLabel>
      </Box>
      <Box mt={2}>{props.children}</Box>
    </Box>
  );
};

type Props = EditorProps<TYPES.Result, Result>;

const ResultComponent: React.FC<Props> = (props) => {
  const allFlagsForSet = (flagSet: FlagSet): FlagWithValue[] => [
    ...(flags[flagSet] ?? []),
    getNoResultFlag(flagSet) as FlagWithValue,
  ];

  return (
    <Formik<Result>
      innerRef={props.formikRef}
      initialValues={{
        flagSet: props.node?.data?.flagSet || Object.keys(flags)[0],
        overrides: props.node?.data?.overrides || {},
      }}
      onSubmit={(newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Result, data: newValues });
        }
      }}
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {(formik) => (
        <Form name="modal" id="modal">
          <TemplatedNodeInstructions
            isTemplatedNode={formik.values.isTemplatedNode}
            templatedNodeInstructions={formik.values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={
              formik.values.areTemplatedNodeInstructionsRequired
            }
          />
          <ModalSection>
            <ModalSectionContent title="Result" Icon={ICONS[TYPES.Result]}>
              <InputRow>
                <Typography variant="h5" component="h6">
                  <label htmlFor="result-flagSet">Flag set</label>
                </Typography>
                <select
                  id="result-flagSet"
                  name="flagSet"
                  value={formik.values.flagSet}
                  onChange={formik.handleChange}
                  required
                  disabled={props.disabled}
                >
                  {Object.keys(flags).map((flagSet) => (
                    <option key={flagSet} value={flagSet}>
                      {flagSet}
                    </option>
                  ))}
                </select>
              </InputRow>

              <Box mt={2}>
                <Typography variant="h5" component="h6">
                  Flag text overrides (optional)
                </Typography>
                <Typography variant="body2">
                  The overrides you set here will change what is displayed to
                  the user upon arriving at this result. If you provide no
                  overrides, the flag title will be used.
                </Typography>
                <Box mt={2}>
                  {allFlagsForSet(formik.values.flagSet).map((flag) => {
                    const override =
                      formik.values.overrides?.[flag.value] || {};
                    return (
                      <FlagEditor
                        key={flag.value}
                        flag={flag}
                        existingOverrides={override}
                        onChange={(newValues) => {
                          formik.setFieldValue("overrides", {
                            ...formik.values.overrides,
                            [flag.value]: newValues,
                          });
                        }}
                        disabled={props.disabled}
                      >
                        <Switch
                          checked={Boolean(override.resetButton)}
                          onChange={() =>
                            formik.setFieldValue("overrides", {
                              ...formik.values.overrides,
                              [flag.value]: {
                                ...override,
                                resetButton: !override.resetButton,
                              },
                            })
                          }
                          label="Reset to start of service"
                        />
                      </FlagEditor>
                    );
                  })}
                </Box>
              </Box>
            </ModalSectionContent>
          </ModalSection>
          <ModalFooter
            formik={formik}
            showMoreInformation={false}
            disabled={props.disabled}
          />
        </Form>
      )}
    </Formik>
  );
};

export default ResultComponent;
