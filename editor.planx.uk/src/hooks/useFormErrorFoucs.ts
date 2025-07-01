import type { FormikErrors } from "formik";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface UseFormErrorFocusProps<T> {
  errors: FormikErrors<T>;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  onErrorInTab?: (tabIndex: number) => void;
  tabErrorMapping?: { tabIndex: number; fieldPath: string }[];
  activeTabIndex?: number;
}

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
  const [elementToFocus, setElementToFocus] = useState<HTMLElement | null>(
    null,
  );

  const currentErrorKeys = Object.keys(errors).join(",");

  const findTabWithFirstError = useCallback(() => {
    if (!tabErrorMapping || !onErrorInTab) return null;

    for (const mapping of tabErrorMapping) {
      const pathSegments = mapping.fieldPath.split(".");
      let currentObj: any = errors;
      let hasError = true;

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

  const findFirstErrorElement = useCallback(() => {
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
          return inputToFocus;
        }
      }
      errorEl.setAttribute("tabindex", "-1");
      return errorEl;
    }

    return null;
  }, []);

  useLayoutEffect(() => {
    if (elementToFocus) {
      elementToFocus.focus();

      if (typeof elementToFocus.scrollIntoView === "function") {
        elementToFocus.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      setElementToFocus(null);
    }
  }, [elementToFocus]);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && !isValidating && !isSubmitting) {
      const errorElement = findFirstErrorElement();
      if (errorElement) {
        setElementToFocus(errorElement);
      }
    }
  }, [
    activeTabIndex,
    findFirstErrorElement,
    errors,
    isValidating,
    isSubmitting,
  ]);

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
      if (tabErrorMapping && onErrorInTab) {
        const tabWithError = findTabWithFirstError();

        if (tabWithError !== null && tabWithError !== activeTabIndex) {
          onErrorInTab(tabWithError);

          previousSubmitCount.current = submitCount;
          previousErrors.current = { ...errors };
          return;
        }
      }

      const errorElement = findFirstErrorElement();
      if (errorElement) {
        setElementToFocus(errorElement);
      }
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
    findFirstErrorElement,
    findTabWithFirstError,
    onErrorInTab,
    activeTabIndex,
    tabErrorMapping,
    errors,
  ]);
}
