import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import type { Field, List } from "../model";
import { ListProvider, useListContext } from "./Context";
import {
  NumberFieldInput,
  RadioFieldInput,
  SelectFieldInput,
  TextFieldInput,
} from "./Fields";

export type Props = PublicProps<List>;

const ListCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: "1px solid darkgray",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const CardButton = styled(Button)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  gap: theme.spacing(2),
}));

/**
 * Controller to return correct user input for field in schema
 */
const InputField: React.FC<Field> = (props) => {
  const inputFieldId = `input-${props.type}-${props.data.fn}`;

  switch (props.type) {
    case "text":
      return <TextFieldInput id={inputFieldId} {...props} />;
    case "number":
      return <NumberFieldInput id={inputFieldId} {...props} />;
    case "question":
      if (props.data.options.length === 2) {
        return <RadioFieldInput id={inputFieldId} {...props} />;
      }
      return <SelectFieldInput id={inputFieldId} {...props} />;
  }
};

const ActiveListCard: React.FC<{
  index: number;
}> = ({ index }) => {
  const { schema, saveItem, cancelEditItem, errors } = useListContext();

  return (
    <ErrorWrapper
      error={errors.unsavedItem ? "Please save in order to continue" : ""}
    >
      <ListCard data-testid={`list-card-${index}`}>
        <Typography component="h2" variant="h3">
          {schema.type} {index + 1}
        </Typography>
        {schema.fields.map((field, i) => (
          <InputRow key={i}>
            <InputField {...field} />
          </InputRow>
        ))}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => await saveItem()}
          >
            Save
          </Button>
          <Button onClick={cancelEditItem}>Cancel</Button>
        </Box>
      </ListCard>
    </ErrorWrapper>
  );
};

const InactiveListCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const { schema, formik, removeItem, editItem } = useListContext();

  return (
    <ListCard data-testid={`list-card-${i}`}>
      <Typography component="h2" variant="h3">
        {schema.type} {i + 1}
      </Typography>
      <Table>
        <TableBody>
          {schema.fields.map((field, j) => (
            <TableRow key={`tableRow-${j}`}>
              <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
                {field.data.title}
              </TableCell>
              <TableCell>{formik.values.userData[i][field.data.fn]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box display="flex" gap={2}>
        <CardButton onClick={() => removeItem(i)}>
          <DeleteIcon color="warning" fontSize="medium" />
          Remove
        </CardButton>
        <CardButton onClick={() => editItem(i)}>
          {/* TODO: Is primary colour really right here? */}
          <EditIcon color="primary" fontSize="medium" />
          Edit
        </CardButton>
      </Box>
    </ListCard>
  );
};

const Root = () => {
  const {
    formik,
    validateAndSubmitForm,
    activeIndex,
    schema,
    addNewItem,
    errors,
    listProps,
  } = useListContext();

  const { title, description, info, policyRef, howMeasured } = listProps;

  const rootError: string =
    (errors.min && `You must provide at least ${schema.min} response(s)`) ||
    (errors.max && `You can provide at most ${schema.max} response(s)`) ||
    "";

  return (
    <Card handleSubmit={validateAndSubmitForm} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
      <ErrorWrapper error={rootError}>
        <>
          {formik.values.userData.map((_, i) =>
            i === activeIndex ? (
              <ActiveListCard key={`card-${i}`} index={i} />
            ) : (
              <InactiveListCard key={`card-${i}`} index={i} />
            ),
          )}
          <ErrorWrapper
            error={
              errors.addItem
                ? `Please save all responses before adding a new ${schema.type.toLowerCase()}`
                : ""
            }
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={addNewItem}
              sx={{ width: "100%" }}
              data-testid="list-add-button"
            >
              + Add a new {schema.type.toLowerCase()} description
            </Button>
          </ErrorWrapper>
        </>
      </ErrorWrapper>
    </Card>
  );
};

function ListComponent(props: Props) {
  return (
    <ListProvider {...props}>
      <Root />
    </ListProvider>
  );
}

export default ListComponent;
