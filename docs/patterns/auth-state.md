# Authentication State and Endpoint Handling

> This document outlines the architectural patterns for authentication state management and endpoint interactions in Tea Tapestry.

> Authentication endpoints are called using either
> 
>   1. Redux's Async Thunks (calls to `me`, `login`, `logout`, etc. endpoints made from our `authSlice.ts`).
>   2. apiRequest (a fetch wrapper inside of our `apiClient.ts`)

## 1. Why Use Redux's AsyncThunk Over Direct API Calls (via `apiRequest`)

> Pros
>
>    1. Encapsulates endpoint details. UI components dispatch named thunks without knowing URL endpoints, HTTP methods, or payload structures. 
>       Incorporates our `apiRequest` that we would otherwise call directly. 
>    2. Centralizes logic in `authSlice.ts`, including state transitions (`pending`, `fulfilled`, `rejected`) and loading / error flags.
>    3. Consistent error handling: UI components can utilize `.unwrap()` in `try/catch` blocks for local messages, leaving Redux to handle global state cleanup.
>    4. Resilience: Guaranteed client-side cleanup during logouts or session expirations even if network calls fail.

> Cons
>
>    1. None, really. Just some thunk boilerplate (`extraReducers`, payload typing) within `authSlice.ts`.
>
> Exceptions
>
>    1. One time we don't use the AsyncThunk approach is with the `refresh` endpoint. This token refresh endpoint is managed 
>       directly by `apiClient.ts` via `callRefresh()` within the 401 logic, because it is an automated background network process.
>
> Example
> 
>    Here is an example of how Tea Tapestry handles an auth thunk.
>
```typescript
export const checkSessionThunk = createAsyncThunk<
    UserResponse,           
    void,                   
    { rejectValue: ApiError }
>("auth/checkSessionAction", async (_, thunkAPI) => {
    try {
        const data = await apiRequest<UserResponse>("/auth/me");
        return validateOrReject(data, UserResponseSchema, thunkAPI);
    } 
    catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});
```
>
> The signature is as follows:
>
```typescript
export declare function createAsyncThunk<
  Returned,
  ThunkArg = void,
  ThunkApiConfig extends AsyncThunkConfig = {}
>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
  options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>
```
> 
> Generic type parameters:
>    1. `Returned`: A generic type representing the value returned by `payloadCreator` when the thunk resolves successfully on `fulfilled`. So, 
>        `checkSessionThunk` will return a `UserResponse` when `fulfilled`.
>    2. `ThunkArg`: The argument type expected when dispatching the thunk. `void` if no arugments are required (ex: `dispatch(checkSessionThunk())`) and 
>        an object shape otherwise (ex: `dispatch(loginThunk(credentials))`).
>    3. `ThunkApiConfig`: A configuration object defining the options available on `thunkAPI` (which include `rejectValue`, `state`, `dispatch`, `extra`, etc.)
>       
> Generic type arguments:
>    1. `typePrefix`: Generates action type for each stage of the async lifecycle. So, `auth/checkSessionAction` generates 
>       `auth/checkSessionAction/pending`, `auth/checkSessionAction/fulfilled`, and `auth/checkSessionAction/rejected`.
>    2. `payloadCreator`: The async function that executes our logic.
>    3. `options`: Optional configuration object for customizing how the thunk executes or dispatches.
>
> Writing new thunks:
>
>    1. Determine what the endpoint receives (the request payload) and returns. If the backend has a schema for the endpoint (likely in `src/api/schemas`),
>       create a file in `src/schemas` for the response schema. Use the same / similar schema name and the same types that the backend schema uses. 
>       Use Zod to create the schema.
>    2. Create a corresponding response type in `src/types/serverResponses.ts`.
>    3. `Returned` and the `apiRequest` generic should be the response type created in the previous step. The `schema` param passed to `validateOrReject` should be
>       the response schema type from the first step.
>    4. `ThunkArg` should be what the endpoint needs passed in when called. `void` if it needs nothing. If the thunk should accept arguments of any kind, you should >       make a corresponding XRequest interface in `serverRequests.ts`. This is the case if the server has a payload such as `payload: SignupSchema` or a 
>       path parameter like `/terminate_session/{session_id}`. The latter would suggest a `TerminateSessionRequest` request with a `session_id: string` field.
>    5. Determine what the endpoint is actually trying to do. Things to look our for in `authSlice`, for example: 
>       Is it issuing cookies, logging a user in, returning a user, creating a session? This will determine whether you should add extraReducers cases that affect
>       the state managed by the slice.
>    6. The `payloadCreator`'s first parameter becomes what was passed for the `ThunkArg`. So, if you pass `Record<string, unknown>` as `ThunkArg` and 
>       `credentials` as the first parameter of `payloadCreator`, `credentials` will be a record. If `void` was passed, use `_`. 
>    7. The options object passed to apiRequest should match the endpoint's method (ex: `@router.post` --> `method: "POST"` and 
>       `payload: SignupSchema` --> `body: JSON.stringify(credentials)`, where the `body` will contain the `email`, `password`, and `display_name` 
>       specified in the `SignupSchema`).
>    8. If the endpoint accepts primitive parameters like `token: str` rather than a Pydantic payload model, determine whether thye are path or query parameters and
>       construct the `url` parameter for `apiRequest` appropriately.