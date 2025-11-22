import { getContrastRatio } from "@mui/material/styles";
import { DEFAULT_CONTRAST_THRESHOLD } from "theme";
import { object, string } from "yup";

export const validationSchema = object({
  linkColour: string().required(),
}).test({
  name: "isContrastThresholdMet",
  test: function (values) {
    if (!values.linkColour) return true;

    const isContrastThresholdMet =
      getContrastRatio("#FFF", values.linkColour) > DEFAULT_CONTRAST_THRESHOLD;

    if (isContrastThresholdMet) return true;

    return this.createError({
      path: "linkColour",
      message: "Colour does not meet accessibility contrast requirements (3:1)",
    });
  },
});
