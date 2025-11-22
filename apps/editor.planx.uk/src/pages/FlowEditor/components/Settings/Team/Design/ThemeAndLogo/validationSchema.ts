import { getContrastRatio } from "@mui/material/styles";
import { DEFAULT_CONTRAST_THRESHOLD } from "theme";
import { object, string } from "yup";

export const validationSchema = object({
  primaryColour: string().required(),
  logo: string().defined().nullable(),
}).test({
  name: "isContrastThresholdMet",
  test: function (values) {
    if (!values.primaryColour) return true;

    const isContrastThresholdMet =
      getContrastRatio("#FFF", values.primaryColour) >
      DEFAULT_CONTRAST_THRESHOLD;

    if (isContrastThresholdMet) return true;

    return this.createError({
      path: "primaryColour",
      message:
        "Theme colour does not meet accessibility contrast requirements (3:1)",
    });
  },
});
