# Types of Testing Covered in Tea Tapestry

## 1. Unit Tests:
        
> Unit tests
> 
>     1. Verify internal logic of a unit of code.
>     2. Test one small piece of code in isolation (ex: single function, class). 
>     3. Are independent of databases, API calls, other classes, etc. Rely on mocks only.
>     4. Tend to be faster and have low cost.

## 2. Integration test:

> Integration tests
> 
>     1. Verify behavior (user data flows, communication) between several units of code.
>     3. Test how multiple pieces of code work together (ex: interactions between components).
>     3. Require dependencies beyond mocks.
>     4. Tend to be slower and have high cost.

# Testing Guidelines

> We want to write high‑value, maintainable, resilient tests. To that end, we aim to
> 
>     1. Test behavior, not implementation details.
> 
>         - Focus on what the user can see, do, or experience. Tests should
>           mimic user interactions as closely as possible.
>         - Avoid testing internal state, derived geometry, or d3 internals.
>         - Assert outcomes through DOM changes and callback invocations.
> 
>     2. Use stable selectors (data-testid) only where necessary.
> 
>         - Use test IDs when there is no reliable, user-facing selector. 
>           Elements with no roles, text, semantic meaning, or visibility are
>           good candidates.
>         - Conversely, do not use test IDs when you can use:
>               1. getByRole
>               2. getByLabelText
>               3. getByText
>               4. getByPlaceholderText
>               5. getByAltText
>               6. getByTitle
>         - SVG structures often lack semantic roles, so test IDs are used 
>           for arcs, labels, and rotation controls.
>         - Overuse of test IDs gets us further away from interacting with
>           the component the way a user would.
> 
>     3. Prefer realistic interactions over manual state manipulation.
> 
>         - Use fireEvent or user-event to simulate hover, click, and keyboard input.
>         - Let the component behave naturally rather than forcing state.
> 
>     4. Cover meaningful user flows.
> 
>         - Hovering aromas and categories
>         - Clicking arcs
>         - Keyboard navigation (Enter, Space, Arrow keys)
>         - Rotation behavior via press-and-hold buttons
>         - Interactive vs non-interactive mode
> 
>     5. NOT test:
> 
>         - Exact SVG path strings (this is d3's responsibility)
>         - Internal math or geometry
>         - React hook implementation details
>         - Visual styling or animation timing
> 
>     6. Keep tests resilient and intention‑focused.
> 
>         - Assert that rotation changes the transform, not the exact angle.
>         - Assert that callbacks fire with the correct domain objects.
>         - Assert that labels render, not their exact pixel positions.

# Steps for Writing Tests.

>     1. Define the component's invariants.
>     
>         -Invariants are the rules that must always hold true for the component to be considered correct. They describe the component's 
>          public contract (the set of behaviors that must remain stable even if the implementation changes). They are comprised of one or
>          more checks (which may be attributes, behaviors, or structural facts).
> 
>         -Types of invariants:
> 
>             a) Interactive: Which elements are interactive, focusable, or clickable.
>             b) Accessibility: Required ARIA attributes, roles, and keyboard behavior.
>             c) Structural: How many elements are rendered under different inputs.
>             d) Visibility: Which elements are hidden, inert, or visually de‑emphasized.
>             e) State: Which element is active, selected, expanded, etc.
> 
>         -Example (Carousel.tsx):
> 
>             a) Interactive: Only the center slide is interactive (role="button", tabIndex="0", aria-current="true").
>                All other slides are inert (tabIndex="-1", no role, no aria-current).
>             b) Accessibility: Silhouette slides should not be accessible. (aria-hidden="true").
>             c) Structural: The total number of slides is predictable based on item count.
> 
>     2. Write tests that assert the invariants.
> 
>         -Once the invariants are known, each test should verify one invariant and nothing more.
>         Tests should assert what must be true, not how the component achieves it.

# React Testing Library

> HTML allows `data-*` attributes on any element. The browser stores them and makes them accessible via `element.dataset.camelCaseName` (ex: `data-active` is accessed as `element.dataset.active`).
> 
> React Testing Library uses `data-testid` by default to locate elements. This can be changed via:
> 
>     configure({ testIdAttribute: 'data-new-name' })
> 
> but we keep the default. Use `getByTestId` to find elements by `data-testid`.
> 
>  You can set other custom attributes in React Testing Library that have no built-in meaning. For example, we use `data-active` to refer to whether or not something is active. To retrieve the value, we can do `getAttribute('data-active')` or `element.dataset.active`. 