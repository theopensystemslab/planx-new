import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ERROR_MESSAGE } from "@planx/components/shared/constants";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import type { ReactElement } from "react";
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export interface Props {
  error?: string;
  children?: ReactElement;
  id?: string;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "error",
})<BoxProps & { error: Props["error"] }>(({ theme, error }) => ({
  width: "100%",
  ...(error && {
    paddingLeft: theme.spacing(1.5),
    borderLeft: `5px solid ${theme.palette.error.main}`,
    display: "flex",
    flexDirection: "column",
    // Only apply padding to child when visible to ensure no blank space
    "& > p": {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
  }),
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  margin: 0,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const PUBLIC_ROOT_SELECTOR = '[data-testid="document-start"]';
const ACTIVE_ERROR_SELECTOR =
  '[data-testid="error-wrapper"][data-error="true"]';
const FOCUSABLE_SELECTOR = [
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Controls which support aria-invalid
 * Radios don't (the attribute belongs on their radiogroup), and hidden/aria-hidden
 * inputs (e.g. the native input behind an MUI Select) aren't exposed to assistive tech
 */
const INVALIDATABLE_SELECTOR = [
  "input:not([type='hidden']):not([type='radio']):not([aria-hidden='true'])",
  "select",
  "textarea",
  "[role='combobox']",
  "[role='listbox']",
  "[role='radiogroup']",
  "[role='textbox']",
  "[contenteditable='true']",
].join(",");

/**
 * Get controls owned by this ErrorWrapper, excluding those within a nested ErrorWrapper
 * Nested wrappers manage the validity of their own controls
 */
const getOwnedControls = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(INVALIDATABLE_SELECTOR)).filter(
    (el) => el.parentElement?.closest('[data-testid="error-wrapper"]') === root,
  );

const getDescribedByIds = (el: HTMLElement): string[] =>
  (el.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);

/** Append an id to aria-describedby, preserving existing ids (e.g. hint text) */
const addDescribedBy = (el: HTMLElement, id: string) => {
  const ids = getDescribedByIds(el);
  if (ids.includes(id)) return;
  el.setAttribute("aria-describedby", [...ids, id].join(" "));
};

const removeDescribedBy = (el: HTMLElement, id: string) => {
  const ids = getDescribedByIds(el).filter((existing) => existing !== id);
  if (ids.length) {
    el.setAttribute("aria-describedby", ids.join(" "));
  } else {
    el.removeAttribute("aria-describedby");
  }
};

let isFocusScheduled = false;

/**
 * Move focus to the first error on the page (in DOM order)
 *
 * Multiple ErrorWrappers can render errors in a single commit (e.g. on form submission),
 * so focus is deferred until all effects have run and is only applied once.
 */
const scheduleFocusOnFirstError = () => {
  if (isFocusScheduled) return;
  isFocusScheduled = true;

  queueMicrotask(() => {
    isFocusScheduled = false;

    const publicRoot = document.querySelector(PUBLIC_ROOT_SELECTOR);
    if (!publicRoot) return;

    // Don't steal focus from a user already interacting with an errored field
    const active = document.activeElement;
    if (active?.closest(ACTIVE_ERROR_SELECTOR)) return;

    const firstError = publicRoot.querySelector<HTMLElement>(
      ACTIVE_ERROR_SELECTOR,
    );
    if (!firstError) return;

    // Prefer the associated input - it references the error message via aria-describedby
    const focusTarget =
      firstError.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusTarget) {
      focusTarget.focus();
      return;
    }

    // Fallback to the error message itself
    const errorMessage = firstError.querySelector<HTMLElement>(
      '[data-error-message="true"]',
    );
    if (!errorMessage) return;
    errorMessage.setAttribute("tabindex", "-1");
    errorMessage.addEventListener(
      "blur",
      () => errorMessage.removeAttribute("tabindex"),
      { once: true },
    );
    errorMessage.focus();
  });
};

export default function ErrorWrapper({ id, error, children }: Props): FCReturn {
  const inputId = id ? `${ERROR_MESSAGE}-${id}` : undefined;
  // Always give the message an id so it can be referenced by aria-describedby
  const generatedId = useId();
  const errorMessageId = inputId ?? `${ERROR_MESSAGE}-${generatedId}`;
  const { trackEvent } = useAnalyticsTracking();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    error && trackEvent({ event: "inputErrors", metadata: null, error });
  }, [error, trackEvent]);

  // Whilst the error message is present, mark wrapped controls as invalid
  // and associate the message with them via aria-describedby
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!error || !root) return;

    const markInvalid = () =>
      getOwnedControls(root).forEach((el) => {
        if (el.getAttribute("aria-invalid") !== "true") {
          el.setAttribute("aria-invalid", "true");
        }
        addDescribedBy(el, errorMessageId);
      });
    markInvalid();

    // Catch controls rendered after the error appears (e.g. conditional fields),
    // and re-apply if a re-render overwrites aria-describedby
    const observer = new MutationObserver(markInvalid);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-describedby", "aria-invalid"],
    });

    return () => {
      observer.disconnect();
      getOwnedControls(root).forEach((el) => {
        el.removeAttribute("aria-invalid");
        removeDescribedBy(el, errorMessageId);
      });
    };
  }, [error, errorMessageId]);

  // Focus management only applies to the public interface (editor uses formik validation)
  useEffect(() => {
    if (!error) return;
    if (!rootRef.current?.closest(PUBLIC_ROOT_SELECTOR)) return;
    scheduleFocusOnFirstError();
  }, [error]);

  return (
    <Root
      ref={rootRef}
      error={error}
      data-testid="error-wrapper"
      data-error={error ? "true" : undefined}
      aria-label={error ? "error message" : undefined}
    >
      <ErrorText
        id={errorMessageId}
        data-testid={inputId}
        variant="body1"
        role={error ? "alert" : undefined}
        data-error-message={error ? "true" : undefined}
      >
        {error ? `Error: ${error}` : ""}
      </ErrorText>
      {children || null}
    </Root>
  );
}
