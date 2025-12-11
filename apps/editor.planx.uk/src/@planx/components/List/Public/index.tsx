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
import { formatTitle } from "@planx/components/shared/Schema/InputFields";
import { isMapFieldResponse } from "@planx/components/shared/Schema/model";
import { SchemaFields } from "@planx/components/shared/Schema/SchemaFields";
import { PublicProps } from "@planx/components/shared/types";
import React, { useEffect, useRef } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import type { List } from "../model";
import { formatSchemaDisplayValue } from "../utils";
import { ListProvider, useListContext } from "./Context";

export type Props = PublicProps<List>;

const ListCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.border.main}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2),
  "& label, & table": {
    maxWidth: theme.breakpoints.values.formWrap,
  },
}));

const CardButton = styled(Button)(({ theme }) => ({
  gap: theme.spacing(1),
  background: theme.palette.common.white,
}));

const AddListItemButton = styled(Button)(({ theme }) => ({
  minWidth: "100%",
  boxShadow: "none",
  padding: theme.spacing(5, 3),
  background: theme.palette.background.paper,
  color: theme.palette.prompt.main,
  border: `2px dotted ${theme.palette.prompt.main}`,
  textAlign: "left",
  justifyContent: "flex-start",
  "&:hover": {
    boxShadow: "none",
    borderStyle: "solid",
    borderColor: theme.palette.border.input,
  },
}));

const InactiveListCardLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

const ActiveListCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const { schema, saveItem, cancelEditItem, errors, formik, activeIndex } =
    useListContext();

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
          {`${schema.type} ${i + 1}`}
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
            color="prompt"
            data-testid="save-item-button"
            onClick={async () => await saveItem()}
          >
            Save
          </Button>
          {!isInitialCard && (
            <CardButton
              data-testid="cancel-edit-item-button"
              onClick={cancelEditItem}
            >
              Cancel
            </CardButton>
          )}
        </Box>
      </ListCard>
    </ErrorWrapper>
  );
};

const InactiveListCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const { schema, formik, removeItem, editItem } = useListContext();

  const formattedMapResponse = (() => {
    const mapField = schema.fields.find((field) => field.type === "map");
    if (!mapField) return null;

    const mapResponse = formik.values.schemaData[i][mapField.data.fn];
    if (!mapResponse) return null;

    return isMapFieldResponse(mapResponse)
      ? formatSchemaDisplayValue(mapResponse, mapField)
      : null;
  })();

  return (
    <ListCard data-testid={`list-card-${i}`}>
      <Typography component="h2" variant="h3">
        {`${schema.type} ${i + 1}`}
      </Typography>
      <InactiveListCardLayout>
        {formattedMapResponse && (
          <Box sx={{ flexBasis: "50%" }}>{formattedMapResponse}</Box>
        )}
        <Table>
          <TableBody>
            {schema.fields.map(
              (field, j) =>
                field.type !== "map" && (
                  <TableRow key={`tableRow-${j}`} sx={{ verticalAlign: "top" }}>
                    <TableCell
                      sx={{
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        maxWidth: "160px",
                      }}
                    >
                      {formatTitle(field)}
                    </TableCell>
                    <TableCell>
                      {formatSchemaDisplayValue(
                        formik.values.schemaData[i][field.data.fn],
                        schema.fields[j],
                      )}
                    </TableCell>
                  </TableRow>
                ),
            )}
          </TableBody>
        </Table>
      </InactiveListCardLayout>
      <Box display="flex" gap={2}>
        <CardButton onClick={() => removeItem(i)}>
          <DeleteIcon color="warning" fontSize="medium" />
          Remove
        </CardButton>
        <CardButton onClick={() => editItem(i)}>
          <EditIcon fontSize="medium" />
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

  // Hide the "+ Add another" button if the schema has a max length of 1, unless the only item has been cancelled/removed (schemaData = [])
  const shouldShowAddAnotherButton =
    schema.max !== 1 || formik.values.schemaData.length < 1;

  const hasMapField = schema.fields.some((field) => field.type === "map");

  const listContent = (
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
            <AddListItemButton
              onClick={addNewItem}
              data-testid="list-add-button"
              size="large"
            >
              + Add another {schema.type.toLowerCase()}
            </AddListItemButton>
          </ErrorWrapper>
        )}
      </>
    </ErrorWrapper>
  );

  return (
    <Card handleSubmit={validateAndSubmitForm} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
      {hasMapField ? (
        <FullWidthWrapper>{listContent}</FullWidthWrapper>
      ) : (
        listContent
      )}
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
