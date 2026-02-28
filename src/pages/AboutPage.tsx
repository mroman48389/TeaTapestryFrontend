import useSWR from "swr";

import useFetch from "@/hooks/integration/useFetch";
// import {log} from "./../utils/log-utils";
import { VersionResponse } from "@/types/serverResponses";

export default function AboutPage() {
    const { get } = useFetch(import.meta.env.VITE_API_URL);
    const { data, isLoading, error } = useSWR<VersionResponse>("/version", get);

    if (isLoading) return <p>Loading version...</p>;
    if (error) return <p>Error loading version.</p>;

    return (
        <>
            <p className="text-5xl text-amber-950">Version: {data?.version}</p>
        </>
    );
}