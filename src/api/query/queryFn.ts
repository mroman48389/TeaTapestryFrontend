import { apiRequest } from "@/api/apiClient/apiClient";

/* Small helper for reducing boilerplate in React Query calls. */
export function queryFn<T>(url: string) {
    return async () => {
        const res = await apiRequest<T>(url);
        return res;
    };
}
