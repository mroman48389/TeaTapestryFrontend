import { useLayoutEffect, useRef, useState } from "react";

/*
    ResizeObserver-based hook that measures the width of a DOM element. There are
    battle-tested libraries that can do this, but this hook is small, manageable, and
    avoids overhead.

    Returns:
        - ref: Attach to the element you want to measure.
        - width: The current content width of the element you attach the ref to.
*/
export function useMeasure(): [React.RefObject<HTMLDivElement>, number, number] {
    /* Create reference container that will persist across re-renders for the lifetime of the
       element. We are expecting this ref to point to a HTMLDivElement. */
    const ref = useRef<HTMLDivElement>(null);
    /* This hook was created in the first place to allow us to fluidly resize elements whose 
       internally geometry depends on dimensions passed as props. For the resizing to happen,
       React will need to re-render. This width state will allow us to provoke those re-renders. 
       This is why we can't simply query the DOM and pass in the aforementioned dimensions; doing
       so would not provoke the re-renders we need for the element to resize. */
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    /* While useEffect runs AFTER the browser paints the screen, useLayoutEffect runs BEFORE.
       We use the latter to measure before the user sees anything so we can avoid flicker. 
       This is reflected in the following sequence of events, where step 2 happens with useEffect
       only and step 3 happens with useLayoutEffect only.
       
           1. React renders the element, builds the virtual DOM, and writes updates to the actual DOM.
           --> 2. Browser paints, and the user can see the UI. useEffect runs asynchronously. (if using useEffect)
           --> 3. useLayoutEffect runs. (if using useLayoutEffect)
           4. We measure the element.
           5. We update state.
           6. React re-renders.
           7. Browser paints.

       In general, use useLayoutEffect instead of useEffect when the the effect depends on the
       DOM's layout.
           
    */
    useLayoutEffect(() => {
        /* If there is no current reference to the element, do nothing. */
        const element = ref.current;
        if (!element) {
            return;
        }

        /* The element may have no width when the observer begins observing. Force the observer to 
           fire once after mount to ensure our hook returns a non-zero width. */
        const rect = element.getBoundingClientRect();
        setWidth(rect.width);
        setWidth(rect.height);

        /* Otherwise, create a new ResizeObserver instance. ResizeObserver is a browser API that watches
           DOM elements and notifies you when their size changes. */
        const observer = new ResizeObserver((entries) => {
            /* We can always just access the first element, since we only observe one element below. */
            const entry = entries[0];

            /* Set the element's new width. */
            if (entry) {
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });

        /* Have the observer track the element so we know when its size changes.  */
        observer.observe(element);

        /* Clean up the ResizeObserver when the element unmounts (or the effect re-runs, but that
           won't happen as long as we pass in the [] dependency array like we are doing below). If we 
           don't disconnect it, it will keep holding references to DOM nodes and can cause memory leaks. 
           It would keep running even after the element unmounts. disconnect tells the ResizeObserver
           to stop observing, release all references, and shut down cleanly. */
        return () => {
            observer.disconnect();
        };
    }, []);

    return [ref, width, height];
}
