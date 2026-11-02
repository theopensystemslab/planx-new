import { getContrastRatio } from "@mui/material/styles";
import type { TeamTheme } from "@opensystemslab/planx-core/types";
import {
  DEFAULT_CONTRAST_THRESHOLD,
  DEFAULT_PRIMARY_COLOR,
  defaultTheme,
} from "theme";
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
          "Colour does not meet accessibility contrast requirements (4.5:1)",
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
          "Theme colour does not meet accessibility contrast requirements (4.5:1)",
      });
    },
  });

export const defaultValues: TeamTheme = {
  primaryColour: DEFAULT_PRIMARY_COLOR,
  logo: null,
  favicon: null,
  linkColour: DEFAULT_PRIMARY_COLOR,
  actionColour: DEFAULT_PRIMARY_COLOR,
};

const isContrastThresholdMet = (color: string) =>
  getContrastRatio(defaultTheme.palette.background.paper, color) >
  DEFAULT_CONTRAST_THRESHOLD;
