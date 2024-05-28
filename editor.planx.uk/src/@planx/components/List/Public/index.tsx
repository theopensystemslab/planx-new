import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import InputRow from "ui/shared/InputRow";

import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import type { Field, List } from "../model";
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

function ListComponent({
  info,
  policyRef,
  howMeasured,
  schema,
  handleSubmit,
  title,
  description,
}: Props) {
  // TODO: Track user state, allow items to be added and removed
  // TODO: Track "active" index
  // TODO: Validate min / max
  // TODO: Validate user input against schema fields, track errors
  // TODO: On submit generate a payload

  return (
    <Card handleSubmit={handleSubmit} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
      <ListCard>
        <Typography component="h2" variant="h3">
          {schema.type} index
        </Typography>
        {schema.fields.map((field, i) => (
          <InputRow key={i}>
            <InputField {...field} index={i} />
          </InputRow>
        ))}
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary">
            Save
          </Button>
          <Button>Cancel</Button>
        </Box>
      </ListCard>
      <Button variant="contained" color="secondary">
        + Add a new {schema.type.toLowerCase()} type
      </Button>
    </Card>
  );
}

export default ListComponent;
