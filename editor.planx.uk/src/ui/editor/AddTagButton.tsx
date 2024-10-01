import { BaseNodeData } from "@planx/components/shared";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import { useFormik } from "formik";
import React from "react";

interface Props<T extends BaseNodeData> {
  formik: ReturnType<typeof useFormik<T>>;
}

export const AddTagButton = <T extends BaseNodeData>({ formik }: Props<T>) => {
  const hasPlaceholderTag = Boolean(
    formik.values.tags?.includes("placeholder"),
  );

  const onClick = () => {
    hasPlaceholderTag
      ? formik.setFieldValue("tags", undefined)
      : formik.setFieldValue("tags", ["placeholder"]);
  };

  return (
    <ButtonBase selected={hasPlaceholderTag} onClick={onClick}>
      Add Placeholder tag
    </ButtonBase>
  );
};
