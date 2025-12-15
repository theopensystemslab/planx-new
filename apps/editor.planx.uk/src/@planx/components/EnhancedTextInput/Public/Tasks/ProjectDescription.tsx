import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { getPreviouslySubmittedData, makeData } from "@planx/components/shared/utils";
import { Formik } from "formik";
import React from "react";

import type { BreadcrumbDataForTask, EnhancedTextInputForTask } from "../../types";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>;
type Data = BreadcrumbDataForTask<"projectDescription">;

/**
 * TODO:
 *  - Hit API
 *  - Allow use to select suggested or original
 */
const ProjectDescription: React.FC<Props> = (props) => {
  const initialValues: Data = getPreviouslySubmittedData(props) ?? {
    task: "projectDescription",
    original: "",
    // suggested: "",
    // userAction: "retainedOriginal",
  };

  return (
    <Formik<Data>
      initialValues={initialValues}
      onSubmit={(values) => props.handleSubmit?.(makeData(props, values))}
      validateOnBlur={false}
      validateOnChange={false}
      // TODO: Breadcrumb validation
      // validationSchema={validationSchema}
      >{(formik) => (
        <Card handleSubmit={formik.handleSubmit}>
          <CardHeader
            title={props.revisionTitle}
            description={props.revisionDescription}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
          />
          Enhanced!

        </Card>
      )}
    </Formik>
  )
};

export default ProjectDescription;