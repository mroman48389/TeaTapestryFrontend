# Data Fetching and State Management 

> This document explains the major approaches to data fetching and state management used in Tea Tapestry. It explains when and why to use 
> each. There are three, but Tea Tapestry no longer uses SWR, as React Query is superior in all cases.
>
>    1. SWR
>    2. Redux
>    3. React Query

> We have two major types of state to manage.
> 
>   1. UI / Client: State that exists only in the browser. It is ephemeral and local. Ex: whether a sidebar opened, which tea profile is 
>      selected, visibility, theme, filters, form inputs, and local state.
>   2. Server: State that comes from the backend. Ex: tea profiles, user profiles.

## 1. SWR

> Server state. This is a lightweight fetching library based on a "stale-while-revalidate" pattern.
>

> Pros
>
>    1. Simplest of the three approaches.
>    2. Offers auto caching and revalidation.
>    3. Good for component-level fetching.

> Cons
>
>    1. Lacks global cache invalidation, built-in retries, built-in pagination or infinite queries, devtools, query cancellation, dependent 
>       queries, mutation helpers, fine-grain control over cache
>    2. Hard to coordinate across multiple components.

> Uses
> 
>    1. Small apps.
>    2. Simple pages.
>    3. One-off fetches.

## 2. Redux (with createAsyncThunk)

> Client state. Advanced state management that is best for complex UI state. While it can be used for server state, React Query handles server state better in every way.

> Pros
>
>    1. Centralized store.
>    2. Predictable updating.
>    3. Time-travel debugging.
>    4. Good for UI state and flags.

> Cons
>
>    1. For server state, Redux lacks aching, deduping, stale-while-revalidate, retries, background refreshing.
>       queries, mutation helpers, fine-grain control over cache.
>    2. More complex to code (slice, thunk, reducers, manual loading/error handling and invalidation as well as pagination logic).

> Uses
> 
>    1. More involved UI state.

## 3. React Query (TanStack Query)

> Server state. Advanced, powerful state management for server state with many batteries-included-type features. All server state should use this.

> Pros
>
>    1. Feature rich: Caching, deduping, state-while-revalidate, background refresh, retries, query cancellation, prefetching, optimistic 
>       updates infinite queries, pagination, devtools, fine-grain cache control, automatic garbage collection, automatic refetch on 
>       reconnect, automatic and configurable refetch on window focus.
>    2. Easy to implement, little code.
>    3. Reduces network calls.
>    4. Makes UI feel instant.
>    5. Works well with FastAPI caching.
>    6. Improves performance.

> Cons
>
>    1. None, really.

> Uses
> 
>    1. Any and all data we need to fetch from the backend.

## 4. Switching from Redux to React Query for Tea Profiles.

> This actual example will explain why we want to use React Query for all server state
> and NOT Redux.
> 
> We no longer need to fetch the tea profiles in App.tsx and keep them in the Redux store 
> for app-wide usage now that we have React Query. Redux does not have caching, so it 
> forced us to save tea profiles when the app launched. React Query caches, so we can
> grab the tea profiles from anywhere and the app will not regrab them unless the data 
> is deemed stale. This makes the app load faster initially and allows us to prevent 
> refetching within a certain time period. If the data does become stale, React Query 
> freshes it silently. 
> 
> Now, because we no longer store tea profiles in one place at the beginning of the app, 
> we need to have a useQuery call everywhere tea profiles get used. However, this is still 
> superior to using Redux for tea profiles. Even though useQuery may be in multiple places,
> the tea profiles will still only be fetched if they are stale. So other than the useQuery
> code appearing in multiple places, there is no down side to having it all over the place.
> The ONLY advantage of Redux is having the code in one place at the beginning of app launch, 
> and there are many more disadvantages  of using Redux that React Query gives us: fetching 
> only when needed, global cache, cache shared across pages, no duplicate requests, no 
> slow initial app loads, no unnecessary refetches due to stale time, pages feel instant, 
> devtools, auto retries and garbage collection.


