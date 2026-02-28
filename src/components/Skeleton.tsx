import clsx from "clsx";

/**
 * This component is used to create a placeholder UI element for other components while pages are
 * loading. This allows us to confidently measure elements when pages are loading, keeps the layout
 * stable in case something goes wrong (such as internet going down), prevent UI jumps, and reduces 
 * the need for special error handling inside the layout.
 * 
 * Keeping this component trivial allows us to confidently use it on page loading without fear of 
 * it crashing.
 * 
 * "export function Skeleton({ className }: { className?: string }) {" is equivalent to
 * 
 * "type SkeletonProps = {
 *      className?: string;
 *  };
 *
 *  export function Skeleton(props: SkeletonProps) {
 *      const className = props.className;
 *      ...
 *  }""
 *
 * For smaller components like this, it reduces the code while remaining readable.
 * 
 * @param {object} props 
 *     @param {string} [props.className] - Class(es) to dictate the shape of the skeleton
 *     @returns {JSX.Element} - Trivial div component matching the shape of a UI component dictated by className. 
 */
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={clsx(
                "animate-pulse rounded-md bg-neutral-800/60",
                className
            )}
        />
    );
}