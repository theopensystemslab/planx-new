import { PublicProps } from "@planx/components/shared/types";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";

import { FileUploadAndLabel as FileUploadAndLabelType } from "../model";
import { FileUploadAndLabel } from "./FileUploadAndLabel";
import { FileUploadAndLabelNew } from "./FileUploadAndLabelNew";

type Props = PublicProps<FileUploadAndLabelType>;

export default function Component(props: Props) {
  if (hasFeatureFlag("UPLOAD_LABEL_REBUILD")) {
    return <FileUploadAndLabelNew {...props} />;
  }
  return <FileUploadAndLabel {...props} />;
}
