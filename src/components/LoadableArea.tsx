/**
 * Use this component to display any component that should alternatively display a 
 * Skeleton during loading. Displays an error message on failure. Prevents us from
 * needing branching logic every time we want to display such a component.
 * 
 * Only components whose rendered content depend on async data should be wrapped by this
 * component. Async data is any data the component does not immediately have at render time.
 *
 * @param {object} props
 *     @param {boolean} props.isLoading - Whether data is still loading.
 * 
 *     @param {Error | null} props.error - Error object from SWR or fetch.
 * 
 *     @param {React.ReactNode} props.skeleton - Placeholder UI shape to render while loading.
 * 
 *     @param {React.ReactNode} props.children - The actual UI component to render once ready.
 * 
 * @returns {JSX.Element}
 * 
 */
export function LoadableArea({
    isLoading,
    error,
    skeleton,
    children,
}: {
    isLoading: boolean;
    error: unknown;
    skeleton: React.ReactNode;
    children: React.ReactNode;
}) {
    if (isLoading) return <>{skeleton}</>;
    if (error) return <p className="text-red-400">Error loading content</p>;
    return <>{children}</>;
}
