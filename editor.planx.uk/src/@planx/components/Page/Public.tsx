import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { useSchema } from "../shared/Schema/hook";
import { SchemaFields } from "../shared/Schema/SchemaFields";
import { getPreviouslySubmittedData } from "../shared/utils";
import { Page } from "./model";

type Props = PublicProps<Page>;

function PageComponent(props: Props) {
  const { formikConfig } = useSchema({
    schema: props.schema,
    previousValues: getPreviouslySubmittedData(props),
  });

  const formik = useFormik({
    ...formikConfig,
    onSubmit: (data) => console.log({ data }),
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <CardHeader {...props} />
      <SchemaFields
        formik={formik}
        schema={props.schema}
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        })}
      />
    </Card>
  );
}

export default PageComponent;
