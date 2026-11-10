import { DEFAULT_TITLE } from "components/DowntimeBanner/DowntimeBanner";
import { richText } from "lib/yupExtensions";
import { boolean, object, type SchemaOf, string } from "yup";

import type { DowntimeBannerFormValues } from "./types";

export const TITLE_MAX_LENGTH = 120;

export const validationSchema: SchemaOf<DowntimeBannerFormValues> =
  object().shape({
    isVisible: boolean().required(),
    title: string()
      .trim()
      .max(
        TITLE_MAX_LENGTH,
        `Title must be ${TITLE_MAX_LENGTH} characters or fewer`,
      )
      .when("isVisible", {
        is: true,
        then: string().required("Enter a title to display the banner"),
      })
      .defined(),
    // Optional - richText() transforms empty values to undefined
    description: richText(),
  });

export const defaultValues: DowntimeBannerFormValues = {
  isVisible: false,
  title: DEFAULT_TITLE,
  description: "",
};
