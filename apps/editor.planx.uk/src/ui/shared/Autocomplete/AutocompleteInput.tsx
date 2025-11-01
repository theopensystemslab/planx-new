import FormControl from "@mui/material/FormControl";
import React from "react";

import {
  RenderDataFieldInput,
  RenderTextFieldInput,
} from "./components/RenderFieldInputs";
import { StyledAutocomplete } from "./styles";
import { WithLabel, WithPlaceholder } from "./types";

type Props<T> = WithLabel<T> | WithPlaceholder<T>;

export default function AutocompleteInput<T>({
  useDataFieldInput,
  value,
  ...restProps
}: Props<T>) {
  const isSelectEmpty = !value;
  const placeholder = isSelectEmpty ? restProps.placeholder : undefined;

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete<T, false, false, boolean, "div">
        value={value || null}
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
              minWidth: 495, // input-row width
            },
            placement: "bottom-start",
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 4],
                },
              },
            ],
          },
        }}
        {...restProps}
      />
    </FormControl>
  );
}
