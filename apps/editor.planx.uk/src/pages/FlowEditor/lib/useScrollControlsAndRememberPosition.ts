import { useParams } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { fromEvent, merge } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  switchMapTo,
  takeUntil,
  throttleTime,
} from "rxjs/operators";

const useScrollControlsAndRememberPosition = (
  scrollContainerRef: React.RefObject<HTMLDivElement> | null,
) => {
  const { flow: currentPath } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const storageKey = ["scrollPos", currentPath].join(":");

    const existingScrollPosition = sessionStorage.getItem(storageKey);
    if (existingScrollPosition) {
      const [x, y] = existingScrollPosition.split(",").map(Number);
      container.scrollTo(x, y);
    }

    const mouseMove$ = fromEvent<MouseEvent>(container, "mousemove");

    const mouseDown$ = fromEvent<MouseEvent>(container, "mousedown");

    const mouseUp$ = merge(
      fromEvent<FocusEvent>(document, "blur"),
      fromEvent<MouseEvent>(document, "mouseup"),
      fromEvent<MouseEvent>(document, "mouseenter").pipe(
        filter((e) => e.which === 0),
      ),
    );

    const wheelDown$ = mouseDown$.pipe(filter((ev) => ev.which === 2));

    // instead of this variable, we could also reset scan after mouseUp$
    let accumulator = { scrollPos: [0, 0], initialPos: [0, 0], pos: [0, 0] };
    mouseUp$.subscribe(() => accumulator);

    const dragListener = wheelDown$
      // when mousewheel is pressed down
      .pipe(
        switchMapTo(
          // start tracking mouse movement
          mouseMove$.pipe(
            // hold on to the starting mouse and scroll position
            // continuously update the current mouse position
            scan((acc, curr) => {
              acc.scrollPos = accumulator.scrollPos || [
                container.scrollLeft,
                container.scrollTop,
              ];
              acc.initialPos = accumulator.initialPos || [
                curr.pageX,
                curr.pageY,
              ];

              accumulator = acc;

              acc.pos = [curr.pageX, curr.pageY];

              return acc;
            }, accumulator),
            // stop listening once the wheel button is released
            takeUntil(mouseUp$),
          ),
        ),
      )
      .subscribe(({ initialPos, pos, scrollPos }) => {
        // pan the flow
        container.scrollTo(
          scrollPos[0] + initialPos[0] - pos[0],
          scrollPos[1] + initialPos[1] - pos[1],
        );
      });

    const scrollListener = fromEvent(container, "scroll", { passive: true })
      .pipe(
        // check scroll position max 4x a second
        throttleTime(250, undefined, { trailing: true }),
        // extract the [x,y] scroll position as a string
        map(() => [container.scrollLeft, container.scrollTop].join(",")),
        // only continue if the [x,y] position has changed (scrolled)
        distinctUntilChanged(),
      )
      .subscribe((scrollPosition) => {
        sessionStorage.setItem(storageKey, scrollPosition);
      });

    return () => {
      scrollListener?.unsubscribe();
      dragListener?.unsubscribe();
    };
  }, [scrollContainerRef, currentPath]);
};

export default useScrollControlsAndRememberPosition;
