# Lazy Loading

> Lazy loading defers the loading of a component's code until it is rendered for the first time.
> It splits the code into smaller chunks (which you can see in dist\assets) that are fetched 
> when needed rather than including everything in the initial JavaScript bundles. It boosts 
> Time to Interaction (TTI) and First Contentful Paint (FCP), which are critical for Search
> Engine Optimization (SEO) and user retention. Common lazy loading strategies are route-based
> splitting (entire pages) so users only download code for specific pages they visit and 
> component-based splitting that defers heavy, non-critical components until users have specific
> interactions.

## 1. When To Lazy Load a Component

> Lazy load components that are 
>
>    1. Not needed on first paint.
>    2. Intensive.
>    3. Below the fold (visible to the user immediately on load).
>    4. Not required for the user to see something meaningful immediately. As long as there is 
>       something else on the screen for the user to gain something immediately, complex
>       components that appear above the fold can still be good candidates for lazy loading (such
>       as the AromaWheel). 
>    5. Used after interactions (like modals, charts, dialogs).
>    6. Not critical to preserving initial layout.
>
> Do not lazy load everything, since lazy loading everything would
> 
>    1. Increase network requests.
>    2. Increase latency.
>    3. Cause strange behavior.
>    4. Delay interactions.
>    5. Make the app feel slower.

## 2. Lazy Loading Benefits Beyond Lighthouse Scores

> Lazy loading may still have benefits even if it does not directly impact Lighthouse 
> scores. Lighthouse scores are only affected if the component renders during the initial load,
> as Lighthouse does not "click around" the app. HOWEVER, lazy loading heavy components still
>
>    1. Shrinks initial JS bundle size.
>    2. Decreases total blocking time (TBT) when user interactions cause the components to render.
>    3. Prevent delaying hydration.

## 3. Gating Lazy Loaded Components

> Gating delays running code while lazy loading delays downloading code. They work together to keep
> UI running smoothly. Gating improves user experience even when it does not improve Lifehouse scores, 
> as it gives users what they need precisely when they need it. This spreads out CPU work so UI 
> doesn't stutter. Examples of gating are rendering a component 
> 
>    1. After a user interaction.
>    2. After a scroll.
>    3. After it becomes visible (via IntersectionObserver).
>    4. After requestIdleCallback.
>
> There are different types of gating.
>
>    1. Conditional rendering: The component does not render until a condition is true. It looks like
> 
>           condition ? <Component/> : null
>
>       If the Component is lazy loaded, it will at least not be downloaded until the condition is true.
>       However, as soon as condition is true, Component is immediately downloaded. This blocks the main
>       thread, which the user may visibly perceive as a UI hiccup.
>
>    2. Interaction-deferred: The component does not render until an interaction occurs. This spreads CPU
>       work out so the UI doesn't stutter. It might look something like:      
>   
>           useEffect(() => {
>               if (condition) {
>                   requestIdleCallback(() => setShowComponent(true))
>               }
>           }, [condition])
>
>       This is better for lighter components
>
>    3. Visibility-based: THe component does not render unless it is visible. Uses IntersectionObserver.
>       This gate keeping type is best for components that are heavy, not immediately visible, require
>       scrolling to fully view, appear somewhere the user does not immediately look, could cause a CPU
>       spike, and are triggered by user interactions.