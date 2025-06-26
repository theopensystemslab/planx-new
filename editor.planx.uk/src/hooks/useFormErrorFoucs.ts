import type { FormikErrors } from "formik";
import { useEffect, useRef } from "react";

interface UseFormErrorFocusProps<T> {
  errors: FormikErrors<T>;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  idPrefix?: string;
}

/**
 * Hook to focus on the input field associated with the first error in a form after submission
 */
export function useFormErrorFocus<T>({
  errors,
  isSubmitting,
  isValidating,
  submitCount,
}: UseFormErrorFocusProps<T>) {
  const previousSubmitCount = useRef(0);
  const previousErrors = useRef<FormikErrors<T>>({} as FormikErrors<T>);

  const currentErrorKeys = Object.keys(errors).join(",");

  const focusFirstErrorInput = () => {
    const alertElements = document.querySelectorAll('[role="alert"]');

    if (alertElements.length > 0) {
      for (let i = 0; i < alertElements.length; i++) {
        const errorEl = alertElements[i] as HTMLElement;

        if (errorEl.textContent && errorEl.offsetParent !== null) {
          const errorWrapper = errorEl.closest('[data-testid="error-wrapper"]');
          if (errorWrapper) {
            const input = errorWrapper.querySelector("input, textarea, select");
            if (input) {
              console.log("Found input in error wrapper, focusing:", input);
              (input as HTMLElement).focus();
              (input as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              return true;
            }
          }
          //Fall back to announcing the error if input not found
          errorEl.setAttribute("tabindex", "-1");
          errorEl.focus();
          errorEl.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const isNewSubmit = submitCount > previousSubmitCount.current;
    const hasErrors = Object.keys(errors).length > 0;
    const errorsChanged =
      currentErrorKeys !== Object.keys(previousErrors.current).join(",");

    if (
      !isValidating &&
      !isSubmitting &&
      hasErrors &&
      (isNewSubmit || errorsChanged)
    ) {
      setTimeout(() => {
        focusFirstErrorInput();
      }, 10);
    }

    if (!isSubmitting) {
      previousSubmitCount.current = submitCount;
      previousErrors.current = { ...errors };
    }
  }, [submitCount, isValidating, isSubmitting, currentErrorKeys, errors]);
}
