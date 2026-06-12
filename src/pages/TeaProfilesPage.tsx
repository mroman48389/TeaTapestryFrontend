import { 
    useEffect, 
    useState, 
    useRef, 
    useCallback, 
    Suspense,
    lazy 
} from "react";
// import useSWR from "swr";
// import useFetch from "@/hooks/integration/useFetch";
// import { useSelector } from 'react-redux';
// import type { RootState } from '../app/store';
import { useMeasure } from "@/hooks/integration/useMeasure";
import clsx from "clsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion, circOut } from "framer-motion";

import { TeaProfilesResponse } from "@/types/serverResponses";
import { TeaProfilesResponseSchema } from "@/schemas/teaProfiles";
import { TeaProfiles, TeaProfile } from "@/schemas/teaProfiles";
import { TeaProfileCardM } from "@/components/TeaProfileCard";
const TeaProfileGrid = lazy(() =>
    import("@/components/TeaProfileGrid/TeaProfileGrid").then(mod => ({
        default: mod.TeaProfileGrid
    }))
);
import { Skeleton } from "@/components/Skeleton";
import { LoadableArea } from "@/components/LoadableArea";
const AromaWheel = lazy(() =>
    import("@/components/AromaWheel/AromaWheel").then(mod => ({
        default: mod.AromaWheel
    }))
);
import { CarouselHandle, CarouselProps } from "@/components/Carousel/Carousel";
const Carousel = lazy(() =>
    import("@/components/Carousel/Carousel").then(mod => ({
        default: mod.Carousel
    }))
) as <T>(props: CarouselProps<T> & { ref?: React.Ref<CarouselHandle> }) => React.ReactElement;;
import { aromaWheelData } from "@/data/aromaWheelData";
import { Aroma, AromaCategory } from "@/types/aromas";
import EmptyCup from "../assets/teacup mascots/empty-teacup.webp";
import { MATCHING_MODE, MatchingMode } from "@/constants/app";
import { getAromaName, getAromaFromId } from "@/utils/aromaWheelDataUtils";
import { HeroTitle } from "@/components/HeroTitle";
import { Pages, pageIDs } from "@/constants/pages";
import { ComboBox } from "@/components/ComboBox/ComboBox";
import { safeLog } from "@/utils/log-utils";
import { runWhenIdle } from "@/utils/idle";
import { apiRequest } from "@/api/apiClient/apiClient";
import { useVisibility } from "@/hooks/integration/useVisibility";

export default function TeaProfilesPage() {
    /* Was grabbing the tea profiles directly here; now storing it in Redux. */
    // const { get } = useFetch(import.meta.env.VITE_API_URL);

    /* Note that SWR triggers multiple state transitions, so you will get multiple renders. */
    // const { data: teaProfiles, isLoading, error } = useSWR<TeaProfilesResponse>("/api/v1/tea_profiles", 
    //     async (url: string) => {
    //         const json = await get(url); // raw server data
    //         return TeaProfilesResponseSchema.parse(json); // Zod runs here
    //     }
    // );

    // console.log(teaProfiles);

    /* UPDATE: Switched to */
    // const teaProfiles = useSelector((state: RootState) => state.teaProfiles.data);
    // const isLoading = useSelector((state: RootState) => state.teaProfiles.loading);
    // const error = useSelector((state: RootState) => state.teaProfiles.error);

    // throw new Error("Test crash");

    const { data:teaProfiles, isLoading, error } = useQuery({
        queryKey: ['teaProfiles'],
        
        queryFn: async () => {
            /* This test should NOT trigger the ErrorBoundary. */
            // const res = await apiRequest<TeaProfilesResponse>("/api/v1/BAD_URL_TEST");
            const res = await apiRequest<TeaProfilesResponse>("/api/v1/tea_profiles");
            return TeaProfilesResponseSchema.parse(res);
        },
    });

    const [showAromaWheel, setShowAromaWheel] = useState(false);
    const [showAromaComboBox, setShowAromaComboBox] = useState(false);
    const [isAromaWheelInteractive, setIsAromaWheelInteractive] = useState(true);
    const [targetTeaProfiles, setTargetTeaProfiles] = useState<TeaProfiles>([]);
    const [aromaMatchingMode, setAromaMatchingMode] = useState<MatchingMode>(MATCHING_MODE.FLAVOR_ONLY);
    const [focusedAromaId, setFocusedAromaId] = useState<string | null>(null);
    const [selectedTeaProfile, setSelectedTeaProfile] = useState<TeaProfile | null>(null);
    const [showCarousel, setShowCarousel] = useState(false);

    const carouselRef = useRef<CarouselHandle | null>(null);
    const carouselGateRef = useRef<HTMLDivElement | null>(null);


    /* Allows us to fluidly resize the aroma wheel, which derives its internal geometry from
       props passed to it. */
    const [aromaWheelDivRef, aromaWheelDivWidth] = useMeasure();
    /* Allows us to resize the aroma wheel when the carousel meets its minimum width so the
       carousel doesn't get cut off the screen before it needs to be. */
    const [outermostDivRef, outermostDivWidth] = useMeasure(); 

    const { ref: teaProfileGridGateRef, isVisible: showTeaProfileGrid } = useVisibility();

    /* 
        Why we don't use useVisibility hook for the carousel:

        TeaProfilesPage is unusually dynamic: its layout shifts after hydration, Suspense 
        boundaries resolve at different times, lazy components load asynchronously, and 
        ResizeObservers adjust geometry. Because of this, the carousel wrapper may not be 
        in its final on‑screen position when useVisibility first runs.

        useVisibility is intentionally a simple, reusable, one‑shot observer that attaches 
        on mount and disconnects after the first intersection. This design works for the 
        vast majority of components in the app, where layout is stable at mount time and 
        visibility can be determined immediately. We still use it for the tea profile grid 
        for this reason.

        The carousel is an exception. Its layout is not stable when the page first 
        mounts, so the initial observer from useVisibility can attach too early and miss 
        the moment when the carousel wrapper actually becomes visible. Once missed, the 
        one‑shot observer never fires again.

        Instead of complicating useVisibility with dependency arrays, state resets, and 
        multi‑shot behavior (which would make the hook harder to reason about and less 
        reusable), we keep the hook simple and add a page‑specific observer and local
        ref here. The observer attaches when focusedAromaId changes (at a moment when the 
        layout is stable and the carousel wrapper is definitely rendered). This ensures reliable 
        visibility detection.
    */

    useEffect(() => {
        setShowCarousel(false);

        /* We only need to run this effect if we already have a carouselGateRef.current. */
        if (!carouselGateRef.current) return;

        /* Create a new intersection observer. */
        const observer = new IntersectionObserver(([entry]) => {
            
            /* If the element enters the viewport, set isVisible to true and
                disconnect the observer, as we no longer need it. */
            if (entry.isIntersecting) {
                setShowCarousel(true);
                observer.disconnect();
            }
        });

        /* Attach obseerver to the DOM element. */
        observer.observe(carouselGateRef.current);

        /* Stop observing and clean up when the component unmounts. */
        return () => observer.disconnect();
    }, [focusedAromaId]);

    /* Optimization - Rendering after hydration: useEffect runs after hydration (the process
       where React attaches to existing HTML / the DOM). The page will have been painted
       at least once, and the browser will be ready for non-critical work. 
       
       Call setShowAromaWheel(true) so that we know we can render the AromaWheel. */
    useEffect(() => {
        /* As soon as the browser finishes the current call stack, let the page know it
           can render the wheel. This will always fire, but it will do so slightly later
           than we really want, so we have fallbacks. */
        const t = setTimeout(() => setShowAromaWheel(true), 0);

        /* Make sure the wheel appears right after the initial paint. This can potentially
           fire too early. */
        requestAnimationFrame(() => setShowAromaWheel(true));

        /* The wheel should appear when the browser is idle. This may never fire, but is the
           best performance-wise. Unlike the first two, it provides a chance to set our flag
            if the browser ecomes idle early at the cheapest moment for the CPU. */
        runWhenIdle(() => setShowAromaWheel(true));

        return () => clearTimeout(t);
    }, []);

    /* After the initial render, create a media query list (mql) to track the width of the screen. The
       mql object will update automatically when the screen size changes. */
    useEffect(() => {
        /* mql.matches will be true if the screen is <= 768px and false otherwise. */
        const mql = window.matchMedia('(max-width: 768px)');

        const update = (mqlEvent: MediaQueryList | MediaQueryListEvent) => {
            setIsAromaWheelInteractive(!mqlEvent.matches); 
        };

        update(mql);

        /* If any action causes mql's value to change, run update to update isAromaWheelInteractive.
           mql only has two possible states (true or false). */
        mql.addEventListener('change', update);

        /* Prevent memory leaks when component unmounts. */
        return () => mql.removeEventListener('change', update);
    }, []);

    const updateTargetTeaProfiles = useCallback((aromaName: string) => {
        const matchingTeaProfiles: TeaProfiles = [];

        if (teaProfiles) {
            for (let i = 0; i < teaProfiles?.length; i++) {
                let aromas: string[];
                
                if (aromaMatchingMode === MATCHING_MODE.FLAVOR_ONLY) {
                    aromas = [...teaProfiles[i].liquor_taste];
                }
                else {
                    aromas = [
                        ...teaProfiles[i].liquor_aroma, 
                        ...teaProfiles[i].liquor_taste, 
                        ...teaProfiles[i].dry_leaf_aroma, 
                        ...teaProfiles[i].wet_leaf_aroma,
                    ];
                }

                const aromaFoundInTeaProfile = aromas.some(teaProfilesAroma =>
                    teaProfilesAroma.toLowerCase().includes(aromaName.toLowerCase())
                );

                if (aromaFoundInTeaProfile) {
                    matchingTeaProfiles.push(teaProfiles[i]);
                }
            }

            if (matchingTeaProfiles.length > 0) {
                safeLog(matchingTeaProfiles);
                setTargetTeaProfiles(matchingTeaProfiles);
            }
            else {
                setTargetTeaProfiles([]);
            }
        }
    }, [teaProfiles, aromaMatchingMode]);

    /* Update the target tea profiles if the user changes the matching mode. */
    useEffect(() => {
        if (!focusedAromaId) return;

        const aromaName = getAromaName(focusedAromaId);
        if (!aromaName) return;

        updateTargetTeaProfiles(aromaName);
    }, [aromaMatchingMode, focusedAromaId, updateTargetTeaProfiles]);

    useEffect(() => {
        /* If the aroma wheel is interactive, we're in desktop mode, and we should NOT show the
           combobox. */
        if (isAromaWheelInteractive) {
            setShowAromaComboBox(false);
            return;
        }

        /* The aroma combobox is only used in mobile mode (when the screen is sufficiently 
           small and the user cannot effectively interact with the aroma wheel). */
        let timeoutId: number;

        runWhenIdle(() => {
            setShowAromaComboBox(true);
        });

        /* Fallback for browsers that delay or skip idle callbacks */
        timeoutId = window.setTimeout(() => {
            setShowAromaComboBox(true);
        }, 150);

        return () => clearTimeout(timeoutId);

    }, [isAromaWheelInteractive]);


    const handleOnAromaClick = (aroma: Aroma, category: AromaCategory) => {
        safeLog("Category: " + category.name + ". " + "Aroma: " + aroma.name + ".");

        updateTargetTeaProfiles(aroma.name);
    };

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

    /* Inlining this for now. It's small, not nested, only has a single piece of state, and simple. Not likely to
       grow.
       
       Not sure why yet, but using a utility for RadioGroup's className doesn't seem to work. */
    const matchTeasRadioGroup =
        <fieldset className="radio-group-field-set w-[325px]">
            <legend className="radio-group-legend"> 
                Match teas by
            </legend>

            <RadioGroup 
                value={aromaMatchingMode} 
                onValueChange={(value) => setAromaMatchingMode(value as MatchingMode)}
                className="flex justify-center gap-7 py-1"
            >
                <div className="radio-group-item-and-label">
                    <RadioGroupItem 
                        className="radio-group-item" 
                        id="flavor-only" 
                        value={MATCHING_MODE.FLAVOR_ONLY} 
                    />
                    <Label className="text--small" htmlFor="flavor-only">Flavor only</Label>
                </div>

                <div className="radio-group-item-and-label">
                    <RadioGroupItem 
                        className="radio-group-item" 
                        id="full-aroma-profile" 
                        value={MATCHING_MODE.FULL_AROMA_PROFILE}
                    />
                    <Label className="text--small" htmlFor="full-aroma-profile">Full aroma profile</Label>
                </div>
            </RadioGroup>
        </fieldset>;

    /* Draw attention to the aroma wheel and make it feel like it's blooming by increasing the scale and 
       decreasing the brightness as it fades in. It should be the star of the show. */
    const aromaWheelVariants = {
        hidden: {
            opacity: 0,
            scale: 0.96,
            filter: "brightness(1.2)"
        },
        visible: {
            opacity: 1,
            scale: 1,
            filter: "brightness(1)",
            transition: {
                delay: 0.2,      
                duration: 0.9,   
                ease: circOut
            }
        }
    }; 

    /* Always show the enclosing div so useMeasure works when determining aromaWheelDivWidth, but only show 
       the wheel inside the loadable area container if we've determined we should. 
       
        The outer <div> must always render so that useMeasure() has a real DOM element 
        to attach its ResizeObserver to. If we hide this wrapper, useMeasure() will 
        always report width = 0 and the AromaWheel will never render.

        We only render the LoadableArea + Suspense + AromaWheel if
            1. the browser is idle (showAromaWheel === true), AND
            2. the wrapper has been measured (aromaWheelDivWidth > 0).

        This defers the heavy AromaWheel work until after hydration while still 
        allowing useMeasure() to function correctly. */
    const aromaWheel = 
        <div 
            ref={aromaWheelDivRef} 
            className="fade-in-component mt-5 aspect-square w-full max-w-[640px] min-w-[1px]"
        >
            {
                showAromaWheel && (aromaWheelDivWidth > 0) && 

                <motion.div
                    initial="hidden"
                    animate={"visible"}
                    variants={aromaWheelVariants}
                >
                    <LoadableArea isLoading={isLoading} error={error} skeleton={<Skeleton className="h-full w-full rounded-full"/>} >
                        <Suspense fallback={<Skeleton className="h-full w-full rounded-full"/>}>
                            <AromaWheel
                                data={aromaWheelData}
                                size={Math.min(aromaWheelDivWidth, aromaWheelDefaultWidth)}
                                gapAngleRad={0.02}
                                interactive={isAromaWheelInteractive}
                                onAromaClick={(aroma, category) => {
                                    handleOnAromaClick(aroma, category);
                                }}
                                focusedAromaId={focusedAromaId}
                                onFocusedAromaIdChange={setFocusedAromaId}
                            />
                        </Suspense>
                    </LoadableArea>
                </motion.div>
            }
        </div>;
        
    /* flex-1 tells this content to take up the remaining horizontal space in the row its in next to the aroma wheel.
    
       mx-auto centers the img horizontally within its container.
    */
    const noMatchingTeaProfilesImg = 
        <div className="fade-in-component flex flex-1 flex-col items-center">
            <h2 className="title--heading mb-3 text-center">
                No tea profiles were found for that aroma.
            </h2>

            <LoadableArea isLoading={isLoading} error={error} skeleton={<Skeleton className="carousel-shape"/>} >
                <img src={EmptyCup} alt="Empty teacup" width={677} height={543} className="mx-auto h-auto w-60 object-contain"/>
            </LoadableArea>
        </div>;

    const teaProfilesCarouselVariants = {
        hidden: {
            opacity: 0,
            scale: 0.985
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delay: 0.1,      
                duration: 0.6,   
                ease: circOut
            }
        }
    };

    /* flex-1 tells this content to take up the remaining horizontal space in the row its in next to the aroma wheel.
    
       w-full is needed when the screen shrinks and this content becomes part of a flex column. Without it, the
       carousel will look constricted because flex-1 will make it grow taller and not wider for flex column. 
       
       Important: The outer <div> wrapper must always be in the DOM so the visibility 
       observer can attach properly. 
    */
    const teaProfilesCarousel = 
        <div 
            ref={carouselGateRef} 
            className="fade-in-component w-full flex-1"
        >
            {
                focusedAromaId ? 
                (
                    (targetTeaProfiles.length > 0) ?

                        <>
                            <h2 className="title--heading mb-3 text-center">
                                Teas with this aroma
                            </h2>

                            <p className="text--body mb-3 text-center">
                                Click on a tea to view its full profile.
                            </p>

                            {
                            showCarousel &&

                            <motion.div
                                initial="hidden"
                                animate={"visible"}
                                variants={teaProfilesCarouselVariants}
                            >
                                <LoadableArea isLoading={isLoading} error={error} skeleton={<Skeleton className="carousel-shape"/>} >
                                    <Suspense fallback={<Skeleton className="carousel-shape"/>}>
                                        <Carousel<TeaProfile>
                                            key="carousel"
                                            ref={carouselRef}
                                            slideContent={targetTeaProfiles}
                                            ariaLabel="Teas with this aroma"
                                            loop
                                            // onActiveIndexChange={(index) => {
                                            //     console.log("Active index:", index);
                                            // }}
                                            onSlideClick={(tea, _index) => {
                                                setSelectedTeaProfile(tea);
                                                // console.log("Clicked tea:", tea, "at index", index);
                                            }}
                                            renderSlide={({ item, isActive }) => (
                                                <TeaProfileCardM teaProfile={item} isActive={isActive} />
                                            )}
                                        />
                                    </Suspense>
                                </LoadableArea>
                            </motion.div>
                        }
                        </> :

                    noMatchingTeaProfilesImg
                ) : 
                
                null
            }
        </div>;

    const aromaComboBox = 
        showAromaComboBox ? 
            <ComboBox
                items={aromaWheelData.categories.flatMap(category => category.aromas)}
                groups={Object.fromEntries(
                aromaWheelData.categories.map(category => [category.name, category.aromas])
            )}
                selectedItem={getAromaFromId(focusedAromaId)}
                onSelectItem={(aroma) => setFocusedAromaId(aroma.id)}
                getItemName={(aroma) => aroma.name}
                itemPlaceholderText="No aroma selected"
                className="w-60"
        /> :
        null;

    /* Important: The outer <div> wrapper must always be in the DOM so the visibility 
       observer can attach properly. */
    const teaProfileGrid = 
        <div ref={teaProfileGridGateRef}>
            {
                selectedTeaProfile && showTeaProfileGrid &&
                <Suspense 
                    fallback={
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="text-wood-bowl-brown h-8 w-8 animate-spin" />
                        </div>
                    }
                >
                    <TeaProfileGrid
                        teaProfile={selectedTeaProfile}
                    />
                </Suspense> 
            }
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
            <HeroTitle>{Pages[pageIDs.teaProfiles].title}</HeroTitle>

            <p className="text--body mt-10">
                Use the <strong>Aroma Wheel</strong> below to discover new teas to match your mood. Simply put,
                an <strong>aroma</strong> is a sensation caused by volatile compounds that we taste and smell. The Aroma Wheel
                has broader aroma categories at its center. Specific aromas belonging to those categories are in the outer 
                ring. Select an aroma in the outer ring to view tea profiles associated with it. 
            </p>

            <p className="text--body mt-4">
                Traditionally, aroma wheels capture all possible aroma sources, including the taste and smell of the liquor and 
                the smell of the dry and wet leaves. Select <strong>&quot;Full aroma profile&quot;</strong> to view teas that match the 
                selected aroma at any point of the tea experience. 
            </p>

            <p className="text--body mt-4">
                Practically, we tend to care most about the flavor of our teas. Select <strong>&quot;Flavor only&quot;</strong> to view 
                teas based primarily on their flavor. 
            </p>

            {matchTeasRadioGroup}

            <div 
                ref={outermostDivRef} 
                className={clsx( "flex items-center gap-[32px]", showInRow ? "flex-row" : "flex-col" )}
            >
                {aromaWheel}
                {aromaComboBox}
                {teaProfilesCarousel}
            </div>

            {teaProfileGrid}

            {/* <div className="h-20 w-100 text-sm text-black">
                focusedAromaId: {String(focusedAromaId)}<br/>
                targetTeaProfiles length: {targetTeaProfiles?.length}<br/>
                showCarousel: {String(showCarousel)}<br/>
                isLoading: {String(isLoading)}<br/>
                error: {String(error)}
            </div> */}
        </>
    );
}