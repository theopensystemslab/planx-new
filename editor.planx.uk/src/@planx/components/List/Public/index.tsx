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
const InputField: React.FC<Field & { index: number }> = (props) => {
  const inputFieldId = `input-${props.type}-${props.index}`;

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
  const { schema, saveItem, cancelEditItem } = useListContext();

  return (
    // TODO: This should be a HTML form
    <ListCard>
      <Typography component="h2" variant="h3">
        {schema.type} {index + 1}
      </Typography>
      {schema.fields.map((field, i) => (
        <InputRow key={i}>
          <InputField {...field} index={i} />
        </InputRow>
      ))}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => saveItem(index, [])}
        >
          Save
        </Button>
        <Button onClick={cancelEditItem}>Cancel</Button>
      </Box>
    </ListCard>
  );
};

const InactiveListCard: React.FC<{
  index: number;
}> = ({ index }) => {
  const { schema, userData, removeItem, editItem } = useListContext();

  return (
    <ListCard>
      <Typography component="h2" variant="h3">
        {schema.type} {index + 1}
      </Typography>
      <Table>
        <TableBody>
          {schema.fields.map((field, i) => (
            <TableRow key={`tableRow-${i}`}>
              <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
                {field.data.title}
              </TableCell>
              <TableCell>{userData[index][i]?.val}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box display="flex" gap={2}>
        <CardButton onClick={() => removeItem(index)}>
          <DeleteIcon color="warning" fontSize="medium" />
          Remove
        </CardButton>
        <CardButton onClick={() => editItem(index)}>
          {/* TODO: Is primary colour really right here? */}
          <EditIcon color="primary" fontSize="medium" />
          Edit
        </CardButton>
      </Box>
    </ListCard>
  );
};

const Root = ({ title, description, info, policyRef, howMeasured }: Props) => {
  const { userData, activeIndex, schema, addNewItem } = useListContext();

  return (
    <Card handleSubmit={() => console.log({ userData })} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
      {userData.map((_, i) =>
        i === activeIndex ? (
          <ActiveListCard key={`card-${i}`} index={i} />
        ) : (
          <InactiveListCard key={`card-${i}`} index={i} />
        ),
      )}
      <Button variant="contained" color="secondary" onClick={addNewItem}>
        + Add a new {schema.type.toLowerCase()} type
      </Button>
    </Card>
  );
};

function ListComponent(props: Props) {
  // TODO: Validate min / max
  // TODO: Validate user input against schema fields, track errors
  // TODO: On submit generate a payload

  return (
    <ListProvider schema={props.schema}>
      <Root {...props} />
    </ListProvider>
  );
}

export default ListComponent;
