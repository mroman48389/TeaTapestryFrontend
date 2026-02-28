import { useState } from "react";

import { log } from "@/utils/log-utils";

/* This custom hook takes a base url such as "https://tea-tapestry.com/" and returns 
   both a reference to both a get and post fetcher function, depending on needs, 
   which can be passed as the second param of the useSWR and useSWRMutation hooks. 
   Recall that useSWRMutation is used to fetch data on events like button clicks. 
   
   State for loading and error can be used if useFetch is used inside useEffect. If
   its returned get or post is used as a fetcher for useSWR or useSWRMutation,
   prefer using SWR's built-in state instead of this function's state.
   
   Note that we can't use this inside our slices, since React hooks like this
   can only be used inside of React components. */
export default function useFetch(baseUrl: string) {
    /* Since we initialize loading to true, TypeScript will infer loading: boolean and
       setLoading: Dispatch<SetStateAction<boolean>>. We could actually do 
       useState<boolean>, but it's unncessary. 
       
       When you initialize state with null, undefined, or a union type, however, you
       should specify the type because TypeScript can't infer it and would 
       implicitly use any. unknown is safer than any. */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    async function get<T>(url: string) {
        setError(null);
        try {
            const response = await fetch(baseUrl + url);

            if (!response.ok) {
                log("useFetch, get, response not ok:", response.status);
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            log("useFetch, get, data:", data);

            /* If data is falsy, throw it as an error. Data's type will depend on what
               the server sends. */
            if (!data) {
                throw data;
            }

            return data as T;
        } 
        catch (error) {
            log("useFetch, get, error:", error);
            setError(error as Error);
            throw error;
        } 
        finally {
            setLoading(false);
        }
    }

    async function post<T>(url: string, body: string) {
        setError(null);

        try {
            /* baseUrl + url --> new URL(url, baseUrl).toString() avoids 
               double slashes. */
            const response = await fetch(new URL(url, baseUrl).toString(), {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                log("useFetch, post, response not ok:", response.status);
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            log("useFetch, post, data:", data);

            /* If data is falsy, throw it as an error. Data's type will depend on what
               the server sends. */
            if (!data) {
                throw data;
            }

            return data as T;
        } 
        catch (error) {
            log("useFetch, post, error:", error);
            setError(error as Error);
            throw error;
        } 
        finally {
            setLoading(false);
        }
    }

    return { get, post, loading, error };
};
