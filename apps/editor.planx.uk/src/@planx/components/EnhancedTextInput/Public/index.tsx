import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import {
  getPreviouslySubmittedData,
  makeData,
} from "@planx/components/shared/utils";
import { Formik } from "formik";
import React from "react";

import { validationSchema } from "../model";
import type { BreadcrumbData, EnhancedTextInput, TaskComponentMap } from "../types";
import ProjectDescription from "./Tasks/ProjectDescription";

type Props = PublicProps<EnhancedTextInput>;

const taskComponents: TaskComponentMap = {
  projectDescription: ProjectDescription,
};

const EnhancedTextInputComponent = (props: Props) => {
  const initialValues = getPreviouslySubmittedData(props);
  const TaskComponent = taskComponents[props.task];

  if (!TaskComponent) return null;

  return (
    <Formik<BreadcrumbData>
      initialValues={initialValues}
      onSubmit={(values) => props.handleSubmit?.(makeData(props, values))}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Card handleSubmit={formik.handleSubmit}>
          <CardHeader
            title={props.title}
            description={props.description}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
          />
          <TaskComponent {...props} />
        </Card>
      )}
    </Formik>
  );
};

export default EnhancedTextInputComponent;