import React, { useEffect } from "react";
import { fromEvent, merge, Subscription } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  switchMapTo,
  takeUntil,
  throttleTime,
} from "rxjs/operators";

import { rootFlowPath } from "../../../routes/utils";

const useScrollControlsAndRememberPosition = (
  scrollContainerRef: React.RefObject<HTMLDivElement>,
) => {
  useEffect(() => {
    let scrollListener: Subscription;
    let dragListener: Subscription;

    const storageKey = ["scrollPos", rootFlowPath(true)].join(":");

    const container = scrollContainerRef.current;

    if (container) {
      const existingScrollPosition = sessionStorage.getItem(storageKey);
      if (existingScrollPosition) {
        const [x, y] = existingScrollPosition.split(",").map(Number);
        container.scrollTo(x, y);
      }

      const mouseMove$ = fromEvent(container, "mousemove");

      const mouseDown$ = fromEvent(container, "mousedown");

      const mouseUp$ = merge(
        fromEvent(document, "blur"),
        fromEvent(document, "mouseup"),
        fromEvent(document, "mouseenter").pipe(
          filter((e: any) => e.which === 0),
        ),
      );

      const wheelDown$ = mouseDown$.pipe(filter((ev: any) => ev.which === 2));

      // instead of this variable, we could also reset scan after mouseUp$
      let accumulator = {} as any;
      mouseUp$.subscribe(() => (accumulator = {}));

      dragListener = wheelDown$
        // when mousewheel is pressed down
        .pipe(
          switchMapTo(
            // start tracking mouse movement
            mouseMove$.pipe(
              // hold on to the starting mouse and scroll position
              // continuously update the current mouse position
              scan((acc, curr: any) => {
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
        .subscribe(({ initialPos, pos, scrollPos }: any) => {
          // pan the flow
          container.scrollTo(
            scrollPos[0] + initialPos[0] - pos[0],
            scrollPos[1] + initialPos[1] - pos[1],
          );
        });

      scrollListener = fromEvent(container, "scroll", { passive: true })
        .pipe(
          // check scroll position max 4x a second
          throttleTime(250, undefined, { trailing: true }),
          // extract the [x,y] scroll position as a string
          map((evt: any) =>
            [evt.target.scrollLeft, evt.target.scrollTop].join(","),
          ),
          // only continue if the [x,y] position has changed (scrolled)
          distinctUntilChanged(),
        )
        .subscribe((scrollPosition: string) => {
          sessionStorage.setItem(storageKey, scrollPosition);
        });
    }

    return () => {
      scrollListener?.unsubscribe();
      dragListener?.unsubscribe();
    };
  }, [scrollContainerRef]);
};

export default useScrollControlsAndRememberPosition;
