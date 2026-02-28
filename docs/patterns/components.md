
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

>Examples in Tea Tapestry are TopNavbar and NavSidebarToggle.

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

