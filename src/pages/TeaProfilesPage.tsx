import { 
    useEffect, 
    useState, 
    useRef, 
    // useCallback 
} from "react";
import useSWR from "swr";
import useFetch from "@/hooks/integration/useFetch";
import { useMeasure } from "@/hooks/integration/useMeasure";
// import {log} from "./../utils/log-utils";
import clsx from "clsx";

import { TeaProfilesResponse } from "@/types/serverResponses";
import { Skeleton } from "@/components/Skeleton";
import { LoadableArea } from "@/components/LoadableArea";
import { AromaWheel } from "@/components/AromaWheel/AromaWheel";
import { Carousel, CarouselHandle } from "@/components/Carousel/Carousel";
import { aromaWheelData } from "@/data/aromaWheelData";

interface Tea {
  id: string;
  name: string;
}

export default function TeaProfilesPage() {
    const { get } = useFetch(import.meta.env.VITE_API_URL);

    /* Note that SWR triggers multiple state transitions, so you will get multiple renders. */
    const { isLoading, error } = useSWR<TeaProfilesResponse>("/api/v1/tea_profiles", get);

    const [interactive, setInteractive] = useState(true);

    const carouselRef = useRef<CarouselHandle | null>(null);
    /* Allows us to fluidly resize the aroma wheel, which derives its internal geometry from
       props passed to it. */
    const [aromaWheelDivRef, aromaWheelDivWidth] = useMeasure();
    /* Allows us to resize the aroma wheel when the carousel meets its minimum width so the
       carousel doesn't get cut off the screen before it needs to be. */
    const [outermostDivRef, outermostDivWidth] = useMeasure();

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 768px)');
        const update = (e: MediaQueryList | MediaQueryListEvent) => {
        setInteractive(!e.matches); // disable interactivity on small screens
        };
        update(mql);
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const teas: Tea[] = [
        { id: "1", name: "1 Long Jing" },
        { id: "2", name: "2 Tie Guan Yin" },
        { id: "3", name: "3 Da Hong Pao" },
        { id: "4", name: "4 Bai Hao Yin Zhen"},
        { id: "5", name: "5 Jasmine Pearls"},
        { id: "6", name: "6 Tai Ping Hou Kui"}
    ];

    const aromaWheelDefaultWidth = 640;
    const carouselMinWidth = 368;
    const componentGap = 32; // equivalent to gap-8;

    /* Determine whether we should switch from a row to a column for the flex div wrapping our aroma wheel
       and carousel. 
       
       Desired behavior:
       
       Assume we're on a desktop with the browser at max width. Start to shrink the screen from the right edge. 
       The contents of the carousel between the two arrows should slowly shrink until the carousel looks like 
       a single card in between two arrows. The carousel will be at its minimum width. Call this point in 
       time "Point A". 
       
       Continue to shrink the screen. The aroma wheel (the dominant feature of the page), should now continue to 
       shrink up until it reaches its minimum width. Call this point in time "Point B". By shrinking the wheel,
       we avoid needing to clip the carousel until the screen becomes small enough to trigger the outermost div
       to use flex col instead of flex row.

       Continue to shrink the screen. Neither the carousel nor the aroma wheel can shrink any further at this
       point. The carousel should immediately jump below the aroma wheel. So, the outermost div should switch to 
       flex col from flex row.

    */
    const showInRow = outermostDivWidth >= aromaWheelDefaultWidth + carouselMinWidth + componentGap;

    const aromaWheel = 
        <div ref={aromaWheelDivRef} className="fade-in-component aspect-square w-full max-w-[640px]">
            <LoadableArea isLoading={isLoading} error={error} skeleton={<Skeleton className="h-full w-full rounded-full"/>} >
                {
                    (aromaWheelDivWidth > 0) && 
                    
                    <AromaWheel
                        data={aromaWheelData}
                        size={Math.min(aromaWheelDivWidth, aromaWheelDefaultWidth)}
                        gapAngleRad={0.02}
                        interactive={interactive}
                        // onAromaClick={(aroma, category) => {
                        //     // zoom-out + tapestry logic here
                        // }}
                    />
                }
            </LoadableArea>
        </div>;

    const teaProfilesCarousel = 
        <div className="fade-in-component flex-1">
            <LoadableArea isLoading={isLoading} error={error} skeleton={<Skeleton className="carousel-shape"/>} >
                <Carousel<Tea>
                    key="carousel"
                    ref={carouselRef}
                    slideContent={teas}
                    ariaLabel="Teas with this aroma"
                    loop
                    onActiveIndexChange={(index) => {
                        console.log("Active index:", index);
                    }}
                    onSlideClick={(tea, index) => {
                        console.log("Clicked tea:", tea, "at index", index);
                    }}
                    renderSlide={({ item, isActive }) => (
                        <div
                            className={clsx(
                                "carousel-shape",
                                "border border-amber-500/60 bg-neutral-900/90 text-neutral-50 shadow-lg",
                                "flex items-center justify-center",
                                isActive ? "ring-2 ring-amber-400" : ""
                            )}
                        >
                            {item.name}
                        </div>
                    )}
                />
            </LoadableArea>
        </div>;

    // console.log("Tea profiles response:", data);
    // return <pre>{JSON.stringify(data, null, 2)}</pre>;

    /* Note that we wrap the aroma wheel and carousel in divs that control the parent layout and not the
       internal geometry of the components. Keep this styling on the outside, as it should remain the page's
       responsibility.
       
       The aroma wheel takes up a fixed amount of horizontal space in its flex row. By default, the carousel’s 
       wrapper does not grow, so flexbox shrinks it down to its minimum width during layout negotiation. 
       Adding flex-1 to the carousel’s wrapper allows it to grow and claim the remaining horizontal space 
       instead of collapsing. */
    return (
        <>
            <h1 className="title--hero">
                Tea profiles
            </h1>

            <div 
                ref={outermostDivRef} 
                className={clsx( "flex items-center gap-[32px]", showInRow ? "flex-row" : "flex-col" )}
            >
                {aromaWheel}
                {teaProfilesCarousel}
            </div>
        </>
    );
}