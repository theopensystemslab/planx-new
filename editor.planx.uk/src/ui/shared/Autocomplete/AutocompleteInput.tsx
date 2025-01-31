import FormControl from "@mui/material/FormControl";
import React from "react";

import { RenderDataFieldInput, RenderTextFieldInput } from "./RenderComponents";
import { StyledAutocomplete } from "./styles";
import { WithLabel, WithPlaceholder } from "./types";

type Props<T> = WithLabel<T> | WithPlaceholder<T>;

export default function AutocompleteInput<T>({
  useDataFieldInput,
  ...restProps
}: Props<T>) {
  const isSelectEmpty = !restProps.value;
  const placeholder = isSelectEmpty ? restProps.placeholder : undefined;

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete<T, false, false, true, "div">
        role="status"
        aria-atomic={true}
        aria-live="polite"
        forcePopupIcon={false}
        renderInput={(params) =>
          useDataFieldInput ? (
            <RenderDataFieldInput
              params={params}
              label={restProps.label}
              required={restProps.required}
              placeholder={placeholder}
            />
          ) : (
            <RenderTextFieldInput
              params={params}
              label={restProps.label}
              required={restProps.required}
              placeholder={placeholder}
            />
          )
        }
        componentsProps={{
          popupIndicator: {
            disableRipple: true,
          },
          popper: {
            sx: {
              boxShadow: 10,
            },
          },
        }}
        {...restProps}
      />
    </FormControl>
  );
}
