import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  Flag,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import groupBy from "lodash/groupBy";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../sharedTypes";
import { FlagDisplayText, Result } from "./model";

type FlagWithValue = Flag & { value: NonNullable<Flag["value"]> };

const flagsWithValues = flatFlags.filter((flag): flag is FlagWithValue =>
  Boolean(flag.value),
);
const flags = groupBy(flagsWithValues, (f) => f.category);

const FlagEditor: React.FC<{
  flag: Flag;
  existingOverrides?: FlagDisplayText;
  onChange: (newValues: any) => any;
}> = (props) => {
  const { flag, existingOverrides } = props;

  return (
    <Box px={1.5} py={2} bgcolor={flag.bgColor} color={flag.color} mt={1}>
      <Box>
        <Typography variant="h4">{flag.text}</Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <InputLabel label="Heading">
          <Input
            value={existingOverrides?.heading ?? ""}
            onChange={(ev) =>
              props.onChange({ ...existingOverrides, heading: ev.target.value })
            }
          />
        </InputLabel>
        <InputLabel label="Description">
          <Input
            multiline
            value={existingOverrides?.description ?? ""}
            onChange={(ev) =>
              props.onChange({
                ...existingOverrides,
                description: ev.target.value,
              })
            }
          />
        </InputLabel>
      </Box>
    </Box>
  );
};

type Props = EditorProps<TYPES.Result, Result>;

const ResultComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Result>({
    initialValues: {
      flagSet: props.node?.data?.flagSet || Object.keys(flags)[0],
      overrides: props.node?.data?.overrides || {},
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Result, data: newValues });
      }
    },
    validate: () => {},
  });

  const allFlagsForSet = flags[formik.values.flagSet];

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
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
              Flag Text Overrides (optional)
            </Typography>
            <Typography variant="body2">
              The overrides you set here will change what is displayed to the
              user upon arriving at this result. If you provide no overrides,
              the flag title will be used.
            </Typography>
            <Box mt={2}>
              {allFlagsForSet.map((flag) => {
                return (
                  <FlagEditor
                    key={flag.value}
                    flag={flag}
                    existingOverrides={
                      formik.values.overrides &&
                      formik.values.overrides[flag.value]
                    }
                    onChange={(newValues: FlagDisplayText) => {
                      formik.setFieldValue("overrides", {
                        ...formik.values.overrides,
                        ...{ [flag.value]: newValues },
                      });
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default ResultComponent;
