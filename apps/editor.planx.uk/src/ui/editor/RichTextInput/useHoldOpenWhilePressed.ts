import { type RefObject, useEffect, useState } from "react";

/**
 * The toolbar is shown via :focus-within, and sits above the field in the document flow
 *
 * Pressing on a control outside the field (e.g. a "Save" button below it) moves focus on
 * mousedown, which hides the toolbar and shifts the page up. By mouseup the control has moved
 * out from under the pointer, so no click is fired and the user has to click again.
 *
 * Returns true from a press outside the focused field until that press is released, so that the
 * toolbar can be held open and the layout only changes once the click has landed
 */
export const useHoldOpenWhilePressed = (
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) => {
  const [isHeld, setIsHeld] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let releaseController: AbortController | undefined;
    let releaseTimeout: ReturnType<typeof setTimeout> | undefined;

    const handlePointerDown = (ev: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const isFocused = container.contains(document.activeElement);
      const isOutside = !container.contains(ev.target as Node);
      if (!isFocused || !isOutside) return;

      setIsHeld(true);

      releaseController?.abort();
      releaseController = new AbortController();
      const release = () => {
        releaseController?.abort();
        // Wait until after the click event (dispatched after pointerup) before changing layout
        releaseTimeout = setTimeout(() => setIsHeld(false), 0);
      };
      const options = {
        capture: true,
        once: true,
        signal: releaseController.signal,
      };
      document.addEventListener("pointerup", release, options);
      document.addEventListener("pointercancel", release, options);
    };

    // Capture phase, so this runs before mousedown moves focus out of the field
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      releaseController?.abort();
      clearTimeout(releaseTimeout);
    };
  }, [containerRef, enabled]);

  return isHeld;
};
