import { useEffect, useRef, useState } from "react";

/* This hook tells us when an element is visible or almost visible on screen.
   Useful with lazy loaded components for visibility-based gate keeping. */
export function useVisibility(options?: IntersectionObserverInit) {
    /* Provide ref so we can observe the DOM element whose visibility we
       care about. React will put the DOM node into ref.current. */
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    /* Runs after the component mounts, the DOM node exists, and 
       IntersectionObserverInit options change. */
    useEffect(() => {
        /* If the DOM element isn't mounted yet, there's nothing to observe. */
        if (!ref.current) return;

        /* root: null - Observes visibility relative to the viewport.

           rootMargin: "200px" - Triggers the observer when the element is within
               200px of the viewport, giving the browser time to load the 
               component before the user sees it.

           threshold: 0.01 - Triggers the observer if 1% of the element is visible.
        */
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                /* If the element enters the viewport, set isVisible to true and
                   disconnect the observer, as we no longer need it. */
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // one‑shot
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0.01,
                ...options,
            }
        );

        /* Attach obseerver to the DOM element. */
        observer.observe(ref.current);

        /* Stop observing and clean up when the component unmounts. */
        return () => observer.disconnect();
    }, [options]);

    return { ref, isVisible };
}
