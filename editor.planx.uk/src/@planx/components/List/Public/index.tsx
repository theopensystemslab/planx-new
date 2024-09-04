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
import { SiteAddress } from "@planx/components/FindProperty/model";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import { SchemaFields } from "@planx/components/shared/Schema/SchemaFields";
import { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import type { List } from "../model";
import { formatSchemaDisplayValue } from "../utils";
import { ListProvider, useListContext } from "./Context";

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

const ActiveListCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const {
    schema,
    saveItem,
    cancelEditItem,
    errors,
    isPageComponent,
    formik,
    activeIndex,
  } = useListContext();

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const isInitialCard =
    activeIndex === 0 && formik.values?.schemaData?.length === 1;

  return (
    <ErrorWrapper
      error={errors.unsavedItem ? "Please save in order to continue" : ""}
    >
      <ListCard data-testid={`list-card-${i}`} ref={ref}>
        <Typography component="h2" variant="h3">
          {schema.type}
          {!isPageComponent && ` ${i + 1}`}
        </Typography>
        <SchemaFields
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          })}
          schema={schema}
          activeIndex={activeIndex}
          formik={formik}
        />
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            data-testid="save-item-button"
            onClick={async () => await saveItem()}
          >
            Save
          </Button>
          {!isPageComponent && !isInitialCard && (
            <Button
              data-testid="cancel-edit-item-button"
              onClick={cancelEditItem}
            >
              Cancel
            </Button>
          )}
        </Box>
      </ListCard>
    </ErrorWrapper>
  );
};

const InactiveListCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const { schema, formik, removeItem, editItem, isPageComponent } =
    useListContext();

  return (
    <ListCard data-testid={`list-card-${i}`}>
      <Typography component="h2" variant="h3">
        {schema.type}
        {!isPageComponent && ` ${i + 1}`}
      </Typography>
      <Table>
        <TableBody>
          {schema.fields.map((field, j) => (
            <TableRow key={`tableRow-${j}`}>
              <TableCell
                sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, maxWidth: "100px" }}
              >
                {field.data.title}
              </TableCell>
              <TableCell>
                {formatSchemaDisplayValue(
                  formik.values.schemaData[i][field.data.fn],
                  schema.fields[j],
                )}
              </TableCell>
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

  const { title, description, info, policyRef, howMeasured, handleSubmit } =
    listProps;

  const rootError: string =
    (errors.min && `You must provide at least ${schema.min} response(s)`) ||
    (errors.max && `You can provide at most ${schema.max} response(s)`) ||
    "";

  // Hide the "+ Add another" button if the schema has a max length of 1, unless the only item has been cancelled/removed (schemaData = [])
  const shouldShowAddAnotherButton =
    schema.max !== 1 || formik.values.schemaData.length < 1;

  // If the selected schema has a "map" field, ensure there's a FindProperty component preceding it (eg address data in state to position map view)
  const hasMapField = schema.fields.some((field) => field.type === "map");
  const { longitude, latitude } = useStore(
    (state) =>
      (state.computePassport()?.data?.["_address"] as SiteAddress) || {},
  );

  if (hasMapField && (!longitude || !latitude)) {
    return (
      <Card handleSubmit={handleSubmit} isValid>
        <CardHeader title={title} description={description} />
        <ErrorSummaryContainer
          role="status"
          data-testid="error-summary-invalid-graph"
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Invalid graph
          </Typography>
          <Typography variant="body2">
            Edit this flow so that "List" is positioned after "FindProperty"; an
            address is required for schemas that include a "map" field.
          </Typography>
        </ErrorSummaryContainer>
      </Card>
    );
  }

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
          {formik.values.schemaData.map((_, i) =>
            i === activeIndex ? (
              <ActiveListCard key={`card-${i}`} index={i} />
            ) : (
              <InactiveListCard key={`card-${i}`} index={i} />
            ),
          )}
          {shouldShowAddAnotherButton && (
            <ErrorWrapper
              error={
                errors.addItem
                  ? `Please save all responses before adding another ${schema.type.toLowerCase()}`
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
                + Add another {schema.type.toLowerCase()}
              </Button>
            </ErrorWrapper>
          )}
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
