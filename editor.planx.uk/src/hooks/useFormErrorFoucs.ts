import type { FormikErrors } from "formik";
import { useRef, useEffect, useCallback } from "react";

interface UseFormErrorFocusProps<T> {
  errors: FormikErrors<T>;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  onErrorInTab?: (tabIndex: number) => void;
  tabErrorMapping?: { tabIndex: number; fieldPath: string }[];
  activeTabIndex?: number;
}

type ErrorObject = FormikErrors<unknown> | string | undefined;
/**
 * Hook to focus on the input field associated with the first error in a form after submission.
 * For tabbed interfaces, can automatically switch to the tab containing the first error.
 */
export function useFormErrorFocus<T>({
  errors,
  isSubmitting,
  isValidating,
  submitCount,
  onErrorInTab,
  tabErrorMapping,
  activeTabIndex,
}: UseFormErrorFocusProps<T>) {
  const previousSubmitCount = useRef(0);
  const previousErrors = useRef<FormikErrors<T>>({} as FormikErrors<T>);

  const currentErrorKeys = Object.keys(errors).join(",");

  const findTabWithFirstError = useCallback(() => {
    if (!tabErrorMapping || !onErrorInTab) return null;

    for (const mapping of tabErrorMapping) {
      const pathSegments = mapping.fieldPath.split(".");
      let currentObj: any = errors;
      let hasError = true;
      console.log("Segment:", pathSegments);
      console.log("currentObj", currentObj);
      for (const segment of pathSegments) {
        const arrayMatch = segment.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch) {
          const [_, arrayName, indexStr] = arrayMatch;
          const index = parseInt(indexStr);
          currentObj = currentObj[arrayName]?.[index];
        } else {
          currentObj = currentObj[segment];
        }

        if (currentObj === undefined) {
          hasError = false;
          break;
        }
      }

      if (hasError) {
        return mapping.tabIndex;
      }
    }

    return null;
  }, [errors, tabErrorMapping, onErrorInTab]);

  const focusFirstErrorInput = useCallback(() => {
    const alertElements = Array.from(
      document.querySelectorAll('[role="alert"]'),
    ).filter((el) => {
      return el.textContent && el.textContent.trim() !== "";
    }) as HTMLElement[];

    if (alertElements.length > 0) {
      const errorEl = alertElements[0];
      const errorWrapper = errorEl.closest('[data-testid="error-wrapper"]');
      let inputToFocus: HTMLElement | null = null;

      if (errorWrapper) {
        inputToFocus = errorWrapper.querySelector(
          "input, textarea, select",
        ) as HTMLElement;

        if (inputToFocus) {
          setTimeout(() => {
            inputToFocus?.focus();
            inputToFocus?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 50);
          return true;
        }
      }

      // If no input found, focus the error message itself
      errorEl.setAttribute("tabindex", "-1");
      setTimeout(() => {
        errorEl.focus();
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return true;
    }

    return false;
  }, []);

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
      // For tabbed interfaces, find and switch to tab with first error
      if (tabErrorMapping && onErrorInTab) {
        const tabWithError = findTabWithFirstError();

        if (tabWithError !== null && tabWithError !== activeTabIndex) {
          onErrorInTab(tabWithError);
          focusFirstErrorInput();
          previousSubmitCount.current = submitCount;
          previousErrors.current = { ...errors };
          return;
        }
      }
      focusFirstErrorInput();
    }

    if (!isSubmitting) {
      previousSubmitCount.current = submitCount;
      previousErrors.current = { ...errors };
    }
  }, [
    submitCount,
    isValidating,
    isSubmitting,
    currentErrorKeys,
    focusFirstErrorInput,
    findTabWithFirstError,
    onErrorInTab,
    activeTabIndex,
    tabErrorMapping,
    errors,
  ]);
}
