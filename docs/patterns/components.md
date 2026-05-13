
# Component Patterns Used in Tea Tapestry. 

## 1. Domain Widgets

> A domain widget is a reusable component whose behavior is defined by a specific domain concept (ex: teas). It's is a self-contained, interactive module that functions like a mini app. 
>
> An example can be found in AromaWheel.tsx. In this case, the domain-specific concept is tea aromas and categories button:HTML::AromaWheel:TeaTapestry. 

> Domain widgets
>
>    1. have their own APIs (ex: onAromaClick, data, gapAngleRad).
>    2. have internal logic or geometry.
>    3. have custom event semantics (ex: hovering over a category). 
>    4. are not tied to, or extensions of, single HTML elements.
>    5. accept domain-specific props like "interactive" rather than arbitrary HTML 
>       props like onScroll, tabIndex. 
>    6. coordinate multiple input methods such as mouse, touch, and keyboard.
>    7. are not tied to a single HTML element and do not simply wrap native props like UI primitives do.

## 2. UI Primitives

> UI primitives are essentially wrappers for single HTML elements. These 
>
>    1. wrap particular HTML elements like `<button>` and `<nav>` and extend their functionality.  
>    2. are typically smaller.
>    3. accept all native props for the element they are wrapping.
>    4. do not have domain logic or custom events.
>    5. do not have special geometry or visualization logic.

> Examples in Tea Tapestry are TopNavbar and NavSidebarToggle.

## 3. Route Components

> Route components are components that orchestrate data and layout. They
>
>    1. are not meant for reuse.
>    2. are not based on UI primitives.
>    3. are areas to orchestrate data fetching, layouts, and child components.

> An example is TeaProfilesPage. 

## 4. UI Interaction Components

> UI interaction components provide a reusable interaction pattern that is independent of domain data. While they share similarities with domain widgets, they express a behavioral concept rather than domain-specific data. These
>
>    1. have behavior that is independent of domain concepts.
>    2. coordinate multiple input methods such as mouse, touch, and keyboard.
>    3. accept arbitrary child content through render props or composition rather than rendering domain‑specific UI.
>    4. are not tied to a single HTML element and do not simply wrap native props like UI primitives do.
>    5. often expose an imperative API (e.g., next/prev/goTo) for parent components to control behavior.

> An example of this component pattern is Carousel.tsx.
    
# Declarative vs Imperative Components

> There are two approaches you can used based on direction of control.

## 1. Declarative Components

> A declarative component emits events upward but is never directly commanded by its parent. This is the standard React pattern for components. Events flow upward from component to parent and simply notify the parent that something happened inside the component. The parent can then react to the event. 

> Declarative components
>
>    1. provide callbacks to parent components.
>    2. do not provide ref-based control.
>    3. have behavior fully driven by props and internal state.

> They are similar to elements like `<button>`. An example in TeaTapestry is the AromaWheel. Use declarative components when the parent only needs to react to what happens inside the component and does not need to trigger actions on it.
>
>Flow diagram:
>    - (via events) parent --> props --> component --> callbacks --> parent

## 2. Imperative Components

> An imperative component gives its parent direct control via commands. Commands flow downward from parent to component and allow the parent to control the behavior of the component. Imperative components may also provide the events that declarative components use.

> Imperative components
>
>    1. expose an imperative API.
>    2. use useImperativeHandle with forwardRef.

> They are common for dialogs, sliders, video players, etc. An example in TeaTapestry is Carousel. Use imperative components when the parent needs to trigger behavior of the component programmatically, controlling it rather than merely reacting to it.
>
>Flow diagram (two paths because imperative components can use both events AND commands):
>    - (via events) parent --> props --> component --> callbacks --> parent
>    - (via commands) parent --> ref --> component

# Choosing a Component Signature Pattern

> Different components patterns suggest different prop shapes depending on their purpose, level of reusability, and relationship to the DOM. This section documents the four patterns used in Tea Tapestry, why each exists, and how to choose the right one.

## 1. Generic UI Components (with `<T>`)

> For reusable UI primitives that must work with any data type. These components are not tied to domain models and must remain flexible and type‑safe.

> Use this pattern when:
>
>    1. the component is a UI primitive
>    2. the component must accept arbitrary data shapes
>    3. the caller controls how items are labeled or compared
>    4. the component must remain domain‑agnostic

> Ex:

     interface SelectProps<T> {
         items: T[];
         selected: T | null;
         onSelect: (item: T) => void;
         getLabel: (item: T) => string;
     }
 
     export function Select<T>({ items, selected, onSelect, getLabel }: SelectProps<T>) {
         // ...
     }

> An example in TeaTapestry is ComboBox.

## 2. Components Extending Native Elements

> Used when a component is essentially a styled wrapper around a native HTML element and should accept all of that element’s props (Ex: className, id, aria-*, event handlers).

> Use this pattern when:
> 
>    1. the component semantically is a native element
>    2. you want to pass through all native props
>    3. you want to add a small number of custom props
>    4. the component is layout‑ or structure‑oriented

> Ex:

     type NavBarProps = {
         collapsed: boolean;
     } & React.ComponentPropsWithoutRef<"nav">;
 
     export function NavBar({ collapsed, ...rest }: NavBarProps) {
         return <nav {...rest}>...</nav>;
     }

> An example in TeaTapestry is Footer, which is essentially a slightly more involved `<nav>`.

## 3. Inline Props for Small, Self‑Contained Components

> Used when a component is simple, its props are not reused elsewhere, and defining a separate interface would add noise rather than clarity.

> Use this pattern when:
> 
>    1. the component is small and self‑contained
>    2. the props are simple and unlikely to grow
>    3. the props are not reused by other components
>    4. an interface would make the file more verbose without adding clarity

> Ex:

    export function LoadingState({
        loading,
        children,
    }: {
        loading: boolean;
        children: React.ReactNode;
    }) {
        return loading ? "Loading…" : children;
    }

> An example in TeaTapestry is LoadableArea, which gracefully displays UI when a component is loading and handles errors on failure.

## 4. Domain Components with a Props Interface

> Used for components that represent domain concepts and have stable, meaningful props. An interface makes the contract explicit and easier to evolve.

> Use this pattern when:
> 
>    1. the component expresses a domain concept
>    2. the props are stable and descriptive
>    3. the component is not meant to be generic
>    4. the props may grow over time

> Ex:

    interface ProductCardProps {
        product: Product;
        highlighted: boolean;
        onClick?: () => void;
    }

    export function ProductCard({ product, highlighted, onClick }: ProductCardProps) {
        // ...
    }

> An example in TeaTapestry is TeaProfileCard, which is a domain-specific card that displays key fields of the tea profile data.