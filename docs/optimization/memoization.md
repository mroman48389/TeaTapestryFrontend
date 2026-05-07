# Memoization

> Memoization allows us to skip re-rendering a component if props have not changed so we
> don't rerender if we don't need to. Normally, React re-renders all children when a 
> parent component re-renders. Memoization caches the result of the components last render.
> React does a shallow compare of new vs old props on memoized components when deciding if
> it should re-render. If the props are the same, it uses the cached component instead of
> re-rendering. For React 19+, React Compiler can automate many memoizations (for pure
> components).

## 1. When To Memoize a Component

> Since memoization has a performance cost due to the comparison React needs to do, we have
> to evaluate each component to determine if memoization is worth it. 
>
> If any of these are not true, DO NOT memoize the component, as memoization will be pointless:
>    1. It is a pure component. No internal state or effects like useState, useEffect, useMemo, useCallback.
>    2. Has stable props. Even something like an onClick handler can be an unstable prop. However, if the parent
>       can wrap the callback in useCallback, memoization may still be worth it. We do not want to risk
>       stale props. Note that if we're using React Query and a prop is cached, we can consider it stable.
>    3. It does not use router hooks such as useLocation, useNavigate, or useParams, as these return new
>       values for every navigation.
>    4. It does not risk breaking animations or dynamic behavior. Framer Motion animations, random IDs, DOM
>       measurements, dynamic SVGs, layout effects are all flags.
>
> At least one of these should be true about the component when considering memoization.
>    1. It is expensive to render (it handles large amounts of data or has complex UI; large
>       DOM tree, multiple images, Tailwind class merging, string joins, conditionals,
>       background images, layout calcs).
>    2. It renders frequently, and with the same values for props.
>
> React DevTools Profilter can help determine if a component is a a performance bottleneck and memoization should
> be considered.

## 2. Ways to Memoize a Component

> Memoization can be done via
>
>    1. React.memo: Higher-order component (HOC) for functional components.
>    2. React.PureComponent: Base class for class components that automatically handles 
>       shallow prop and state comparison.
>    3. useMemo / useCallback: Hooks used in parent components to ensure that objects, arrays, and
>       functions passed as props keep the same memory reference so that React.memo can work as
>       intended.