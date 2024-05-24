import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps, ICONS, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import InputGroup from "ui/editor/InputGroup";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

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
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Planning constraints"
          Icon={ICONS[TYPES.PlanningConstraints]}
        >
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={true}
                        disabled={true}
                        inputProps={{
                          "aria-label": "select all constraints",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
                      Constraint
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableDatasets
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map((dataset, i: number) => (
                      <TableRow key={i}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={true}
                            disabled={true}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">
                              {dataset.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              p={0.5}
                              sx={{
                                maxWidth: "fit-content",
                                backgroundColor: "#f0f0f0",
                                color: "#00000061",
                                fontFamily: `"Source Code Pro", monospace;`,
                              }}
                            >
                              {dataset.key}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              color="GrayText"
                              sx={{ fontSize: ".8em" }}
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
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}
