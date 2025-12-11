import { getContrastRatio } from "@mui/material/styles";
import type { TeamTheme } from "@opensystemslab/planx-core/types";
import { DEFAULT_CONTRAST_THRESHOLD } from "theme";
import { object, string } from "yup";

export const validationSchema = object({
  actionColour: string().required(),
  favicon: string().defined().nullable(),
  linkColour: string().required(),
  primaryColour: string().required(),
  logo: string().defined().nullable(),
})
  .test({
    name: "isLinkContrastThresholdMet",
    test: function (values) {
      if (!values.linkColour) return true;

      if (isContrastThresholdMet(values.linkColour)) return true;

      return this.createError({
        path: "linkColour",
        message:
          "Colour does not meet accessibility contrast requirements (3:1)",
      });
    },
  })
  .test({
    name: "isPrimaryContrastThresholdMet",
    test: function (values) {
      if (!values.primaryColour) return true;

      if (isContrastThresholdMet(values.primaryColour)) return true;

      return this.createError({
        path: "primaryColour",
        message:
          "Theme colour does not meet accessibility contrast requirements (3:1)",
      });
    },
  });

export const defaultValues: TeamTheme = {
  primaryColour: "#0010A4",
  logo: null,
  favicon: null,
  linkColour: "#0010A4",
  actionColour: "#0010A4",
};

const isContrastThresholdMet = (color: string) =>
  getContrastRatio("#FFF", color) > DEFAULT_CONTRAST_THRESHOLD;
