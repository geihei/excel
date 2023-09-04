import React from "react";

export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  element: HTMLElement | Window | null,
  passive: boolean,
  capture = false
) {
  // Create a ref that stores handler
  const savedHandler =
    React.useRef<(this: HTMLElement, ev: HTMLElementEventMap[K]) => any>();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  savedHandler.current = handler;
  React.useEffect(
    () => {
      // Make sure element supports addEventListener
      if (element === null || element.addEventListener === undefined) return;
      const el = element as HTMLElement;

      // Create event listener that calls handler function stored in ref
      const eventListener = (event: HTMLElementEventMap[K]) => {
        savedHandler.current?.call(el, event);
      };

      el.addEventListener(eventName, eventListener, { passive, capture });

      // Remove event listener on cleanup
      return () => {
        el.removeEventListener(eventName, eventListener, { capture });
      };
    },
    [eventName, element, passive, capture] // Re-run if eventName or element changes
  );
}
