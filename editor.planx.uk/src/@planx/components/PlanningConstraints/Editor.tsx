import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Checkbox from "ui/shared/Checkbox/Checkbox";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { array, object, string } from "yup";

import { ICONS } from "../shared/icons";
import { availableDatasets, parseContent, PlanningConstraints } from "./model";

type Props = EditorProps<TYPES.PlanningConstraints, PlanningConstraints>;

export default PlanningConstraintsComponent;

function PlanningConstraintsComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.PlanningConstraints,
        data: newValues,
      });
    },
    validationSchema: object({
      dataValues: array(string()).min(1, "Select at least one constraint"),
    }),
  });

  const changeSelectAll =
    (vals: string[] | undefined) =>
    (_event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedVals: string[];
      if (vals?.length !== availableDatasets.length) {
        newCheckedVals = availableDatasets.map((d) => d.val);
      } else {
        newCheckedVals = [];
      }
      formik.setFieldValue("dataValues", newCheckedVals);
    };

  const changeDataset =
    (val: string) =>
    (_event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedVals;
      if (formik.values.dataValues?.includes(val)) {
        newCheckedVals = formik.values.dataValues.filter((dv) => dv !== val);
      } else {
        newCheckedVals = formik.values.dataValues
          ? [...formik.values.dataValues, val]
          : [val];
      }
      formik.setFieldValue("dataValues", newCheckedVals);
    };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Planning constraints"
          Icon={ICONS[TYPES.PlanningConstraints]}
        >
          <Typography variant="body2" sx={{ mb: 2 }}>
            Find documentation about{" "}
            <a
              href="https://opensystemslab.notion.site/How-Planning-constraints-work-06b64035fe6b40279387375ef3de49e4?pvs=4"
              target="_blank"
            >
              how constraints work in Plan✕ here
            </a>
            .
          </Typography>
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="title"
                placeholder={formik.values.title}
                value={formik.values.title}
                onChange={formik.handleChange}
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                placeholder="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </InputRow>
            <InputRow>
              <Input
                format="data"
                name="fn"
                placeholder={formik.values.fn}
                value={formik.values.fn}
                disabled
              />
            </InputRow>
          </InputGroup>
          <InputGroup label="Which constraints do you want to check?">
            <ErrorWrapper error={formik.errors.dataValues}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          id={"all-constraints-checkbox"}
                          checked={
                            availableDatasets.length ===
                            formik.values.dataValues?.length
                          }
                          onChange={changeSelectAll(formik.values.dataValues)}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: (theme) => theme.typography.h4 }}
                      >
                        All constraints
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableDatasets
                      .sort((a, b) => a.val.localeCompare(b.val))
                      .map((dataset, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            <Checkbox
                              id={`${dataset.val}-checkbox`}
                              checked={
                                formik.values.dataValues?.includes(
                                  dataset.val,
                                ) || false
                              }
                              onChange={changeDataset(dataset.val)}
                            />
                          </TableCell>
                          <TableCell>
                            <InputGroup>
                              <InputRow>
                                <Input
                                  format="large"
                                  name="text"
                                  value={dataset.text}
                                  disabled
                                />
                              </InputRow>
                              <InputRow>
                                <Input
                                  format="data"
                                  name="val"
                                  value={dataset.val}
                                  disabled
                                />
                              </InputRow>
                            </InputGroup>
                            <Box>
                              <Typography
                                variant="body2"
                                color="GrayText"
                                sx={{ fontSize: ".8em", pb: 1 }}
                              >
                                {`via ${dataset.source}: ${dataset.datasets
                                  .filter(Boolean)
                                  .join(", ")} ${
                                  dataset?.entity
                                    ? `(entity ${dataset.entity})`
                                    : ``
                                }`}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ErrorWrapper>
          </InputGroup>
          <InputGroup label="Planning conditions disclaimer">
            <InputRow>
              <RichTextInput
                name="disclaimer"
                placeholder="Planning conditions disclaimer"
                value={formik.values.disclaimer}
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}
