import { ReactElement, memo, ComponentType } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, RouterProvider, createMemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore, Reducer } from "@reduxjs/toolkit";

import { TeaProfile } from "@/schemas/teaProfiles";

interface RouterOptions {
    route?: string;
    routes?: { path: string; element: React.ReactNode }[];
}

export function renderWithRouter(
    ui: ReactElement,
    { route = "/", routes }: RouterOptions = {}
) {
    const testRoutes =
        routes ??
        [
            { path: "/", element: ui },
            { path: "/about", element: <div>About Page</div> },
        ];

    const router = createMemoryRouter(testRoutes, {
        initialEntries: [route],
    });

    return {
        ...render(<RouterProvider router={router} />),
        router,
    };
}

/* Keys are slice names, values are slice reducers. */
type ReducerMap = Record<string, Reducer>;

/* Builds a test store with the provided reducer and
   an optional preloaded state. */
/* Builds a test store with the provided reducer map and optional preloaded state. */
export function createTestStore({
    reducer,
    preloadedState,
}: {
    reducer: ReducerMap;
    preloadedState?: object;
}) {
    return configureStore({
        reducer,
        preloadedState,
    });
}

/* Provides a fresh, isolated Redux store for every test with
   optional preloaded state. */
export function renderWithStore(
    ui: ReactElement,
    {
        reducer,
        preloadedState,
    }: {
        reducer: ReducerMap;
        preloadedState?: object;
    }
) {
    const store = createTestStore({ reducer, preloadedState });

    return render(<Provider store={store}>{ui}</Provider>);
}

/** 
    * Creates a memoized version of a component with a spy to track renders.
    * @param Component - The component to memoize and spy on
    * @param options - Optional configuration
    * @param options.withRouter - Whether to wrap the component in a MemoryRouter
    * @param options.displayName - Custom display name for the memoized component
    * @returns An object with the memoized component and the spy function
    * 
    * extends JSX.IntrinsicAttributes is needed to tell TypeScript that TProps
    * includes key, ref, and other metadata.
    * 
    * Record<string, unknown> tells TypeScript that the type is an object with string keys and any values.
*/
export function createMemoizedComponentWithSpy<TProps extends JSX.IntrinsicAttributes & Record<string, unknown>>(
    Component: React.ComponentType<TProps>,
    options: { 
        withRouter?: boolean; 
        displayName?: string 
    } = {}
) {
    const spy = jest.fn();
    const { withRouter = false, displayName } = options;

    const MemoizedWrapper: ComponentType<TProps> = (props) => {
        spy();
        const element = <Component {...props}/>;
        return withRouter ? <MemoryRouter>{element}</MemoryRouter> : element;
    };

    /* Declare type for components that might have displayName. Takes any React component that accepts TProps. */
    type ComponentWithDisplayName = React.ComponentType<TProps> & {
        displayName?: string;
        name?: string;
    };

    let componentName = "Component"; // Default fallback
    /* Gain access to displayName and name for Component while avoiding TypeScript errors. */
    const typedComponent = Component as ComponentWithDisplayName;
    
    /* If the display name was passed into the function, use that. */
    if (displayName) {
        componentName = displayName;
    } 
    /* Otherwise, if a displayName was set on the Component, use that. */
    else if (typedComponent.displayName) {
        componentName = typedComponent.displayName;
    } 
    /* Otherwise, if Component is a functional Component and not and not an anonymous arrow function, use the Component name. */
    else if (typeof Component === "function" && typedComponent.name) {
        componentName = typedComponent.name;
    }

    MemoizedWrapper.displayName = `Memoized(${componentName})`;

    const Memoized = memo(MemoizedWrapper);
    Memoized.displayName = componentName;

    return { Memoized, spy };
}

/* Fully functional mock for window.matchMedia that supports listener registration and manual triggering. Needed for 
   components that rely on media query changes (e.g., responsive behavior in useEffect). */
export const setUpMatchMediaMock = (initialMatches: boolean) => {
    /* Create a listenery registry that is a set of functions that take an event object, e and return nothing. */
    let listeners = new Set<(e: { matches: boolean }) => void>();

    /* Mimics the shape of MediaQueryList. */
    const mockMediaQueryList = {
        matches: initialMatches,
        media: "(min-width: 768px)",
        onchange: null,
        
        /* Deprecated. */
        addListener: (handler: (e: { matches: boolean }) => void) => listeners.add(handler),
        removeListener: (handler: (e: { matches: boolean }) => void) => listeners.delete(handler),
        
        /* Modern versions of deprecated listeners. */
        addEventListener: (type: string, handler: (e: { matches: boolean }) => void) => {
            if (type === 'change') {
                listeners.add(handler);
            }
        },
        removeEventListener: (type: string, handler: (e: { matches: boolean }) => void) => {
            if (type === 'change') {
                listeners.delete(handler);
            }
        },

        dispatchEvent: jest.fn(),
    };

    /* Override the global window.matchMedia with the mock, returning the mock object is the query matches and a 
       fallback object otherwise. */
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn((query) => {
            return query === mockMediaQueryList.media ? mockMediaQueryList : { matches: false, media: query };
        }),
    });

    /* Return manual trigger to simulate screen size change. */
    return {
        triggerChange: (newMatches: boolean) => {
            /* Update matches. */
            mockMediaQueryList.matches = newMatches;

            /* Call all registered listeners with new state. */
            for (const listener of listeners) {
                listener({ matches: newMatches });
            }
        },
    };
};

export function getSampleTeaProfile(): TeaProfile {
    return {
        id: 1,
        name: "Long Jing",
        alternative_names: ["Dragon Well"],
        country_of_origin: "China",
        subregions: ["Hangzhou"],
        cultural_significance: "Top 10 tea of China",
        cultural_significance_source: "Sources",
        tea_type: "Green",
        oxidation_level: "Low",
        cultivars: ["Longjing #43"],
        processing: "Pan-fired",
        dry_leaf_appearance: ["Flat", "Green"],
        dry_leaf_aroma: ["Nutty"],
        liquor_appearance: ["Yellow"],
        liquor_aroma: ["Chestnut"],
        liquor_taste: ["Sweet"],
        liquor_body_mouthfeel: ["Light"],
        body_effect: ["Calming"],
        wet_leaf_appearance: ["Bright, yellow-green leaves"],
        wet_leaf_aroma: ["Nutty"],
    };
}