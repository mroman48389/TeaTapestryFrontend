import useSWR from "swr";

import useFetch from "@/hooks/useFetch";
// import {log} from "./../utils/log-utils";
import { TeaProfilesResponse } from "@/types/serverResponses";

export default function TeaProfilesPage() {
    const { get } = useFetch(import.meta.env.VITE_API_URL);
    /* Note that SWR triggers multiple state transitions, so you will get multiple renders. */
    const { data, isLoading, error } = useSWR<TeaProfilesResponse>("/api/v1/tea_profiles", get);

    // return (<></>);
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    console.log("Tea profiles response:", data);
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}