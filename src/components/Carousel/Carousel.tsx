import React, {
    useCallback,
    // useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import { motion } from "framer-motion";

import { modEuclidean } from "@/utils/utils";
import { CarouselSlot, ALL_SLOTS, SlotTransform } from "./CarouselTypes";

/**
 * Props for the Carousel component.
 *
 * This component is a UI interaction component and is content-agnostic. 
 * 
 * @typeParam T - The type of each item in "slideContent". 
 *
 * @property slideContent - An array of one or more items to cycle through.
 * 
 * @property ariaLabel - Optional accessible name for the carousel. Useful
 * when multiple carousels appear on the same screen or when the parent
 * needs to provide semantic context.
 * 
 * @property loop - Whether the carousel should wrap from the last slide
 * back to the first. Defaults to non-looping behavior.
 * 
 * @property onActiveIndexChange - Callback fired whenever the active slide
 * index changes, allowing parent components to sync state or analytics.
 * 
 * @property onSlideClick - Optional handler invoked when a slide is clicked.
 * 
 * @property renderSlide - Render function for each slide. Receives the slide,
 * its index, and whether it is currently active.
 * 
 */
export interface CarouselProps<T> {
    slideContent: T[];
    ariaLabel?: string;
    loop?: boolean;
    onActiveIndexChange?: (index: number) => void;
    onSlideClick?: (item: T, index: number) => void;
    renderSlide: (args: { item: T; index: number; isActive: boolean }) => React.ReactNode;
}

/**
 * Imperative API exposed by the Carousel component.
 *
 * This handle allows parent components to control the carousel programmatically,
 * enabling integrations such as external navigation buttons, synchronized UI,
 * or automated progression logic.
 *
 * @property nextSlide - Advances the carousel to the next slide. 
 * 
 * @property prevSlide - Moves the carousel to the previous slide. 
 * 
 * @property jumpToSlide - Jumps to a specific slide.
 * 
 */
export interface CarouselHandle {
    nextSlide: () => void;
    prevSlide: () => void;
    jumpToSlide: (index: number) => void;
}

/* ---------------------------------------- COMPONENT ------------------------------------------ */

/* UI interaction component for traversing lists of items. See docs/patterns/component.md */

function CarouselInner<T>(
    props: CarouselProps<T>,
    ref: React.Ref<CarouselHandle>
) {
    /* A note on the logic below. 

       There are two logical layers in the Carousel:

           1. ACTUAL: Logic based on the ACTUAL number of items the Carousel is given in slideContent. This layer focuses
           on 
               -determining the active index
               -determining how the Carousel loops through content
               -determining how to jump to a particular item
               -the item count
               -imperative commands

           2. VISUAL / SLOT: Logic based on the VISUAL number of items the Carousel shows at a given time. This layer derives from
           the aforementioned layer and focuses on:

               -slots
               -silhouettes
               -transforms
               -animations
               -layouts

        Decoupling these two logical layers allows us to write the cleanest, most maintainable code for this
        component. Shown items are either real shown items or silhouette shown items. Real shown items display data from the
        slide content passed in. Silhouette shown items do not show any data and exist only for visual effect. At any given
        time, there will be at least 1 real shown item and at most 3 real shown items. At any given time, there will be 0 to 2
        silhouette shown items. Here is a mapping of the actual number of items to the visible number of items, along with the
        real vs silhouette distinctions:

        1 actual item   --> 1 visible item  (1 real shown item)
        2 actual items  --> 2 visible items (1 real shown item + 1 silhouette shown item in back)
        3 actual items  --> 3 visible items (3 real shown items, one in the center and one to either side at a slant)
        4+ actual items --> 5 visible items (3 real shown items, one in the center and one to either side at a slant + 
            2 silhouette in the back) 

    */
    const {
        slideContent,
        ariaLabel = "Carousel",
        loop = true,
        onActiveIndexChange,
        onSlideClick,
        renderSlide,
    } = props;

    /* Note that we should include this in several of our dependency arrays below because it affects the identify of the
       Carousel and may change over time. This is an example of how it's not only state that should exist in 
       dependency arrays! */
    const actualItemCount = slideContent.length;
    const [focusedAbsoluteItemIndex, setFocusedAbsoluteItemIndex] = useState(0);

    /*  Holds the ID retruned from a setInterval timer used for continuous rotation.
        When the user holds down a rotate button, we start the timer, and when they
        release it, we clear it. 
        
        A ref is used so the value persists across renders without triggering 
        re-renders, and because this is not UI state. */
    const rotateIntervalRef = useRef<number | null>(null);

    /* DEBUG - Keep this here for debugging and just add/replace the dependencies and logs with what we want to
       know about as needed. We can get a snapshot of the component's state when any particular thing changes,
       and we know the component will have fresh state, the DOM will be updated, and the component will be stable.
       We can more easily isolate when something changes. */
    // useEffect(() => {
    //     console.log("[Carousel internal] actualItemActiveIndex changed:", actualItemActiveIndex);
    // }, [actualItemActiveIndex]);

    /* ---------------------------------------- IMPERATIVE API METHODS ------------------------------------------ */

    /* Expose API to parent. Recall that public APIs should treat each function as independent, self-contained
       contracts and not as parts of a larger system. They should not assume the functions are being "used correctly". 
       They should be comprised of total functions rather than partial ones. Total functions are operations that are 
       defined for all possible inputs within a domain and do not crash or hang. Every input has a corresponding, 
       predictable output. They should not produce runtime errors. The domain is the set of all values the type system
       allows (as opposed to business logic, which says what the code should do). We take a defensive API approach here, as 
       professional libraries do, to ensure robustness.
       
       For jumpToSlide, the domain is "any integer". To keep the carousel stable, the function must normalize 
       any provided actualItemIndex into a valid internal state. Even if slideContent had 10 items (valid indices 0–9), 
       jumpToSlide would still have to convert values like 23 or -5 into a valid index. We do not assume the caller knows 
       the correct range. It is jumpToSlide's responsibility to map any integer to a meaningful real‑item index.

       In looping mode, we wrap using Euclidean modulo to preserve circular semantics. In non‑looping mode, we clamp to 
       the nearest valid index to preserve linear semantics. This ensures the carousel behaves correctly regardless of how the 
       function is called.
    
       Remember that useCallback tells React to use the same function instance between renders
       unless one of the dependencies in the dependency array changes. */

    /* Helper functions used inside a function wrapped with ueCallback must have 
       component state and props passed into them rather than accessing them directly. 
       They must be pure (no side effects). */
    function getNewActiveItemIndex(unboundedIndex: number, loop: boolean, count: number) {
        return loop
            ? modEuclidean(unboundedIndex, count)
            : Math.max(0, Math.min(unboundedIndex, count - 1));
    }

    const jumpToSlide = useCallback(
        (actualItemIndex: number) => {
            if (actualItemCount === 0) return;

            /* Assume nothing about what the caller meant when passing actualItemIndex. 
               The only safe assumption is that the caller is issuing a navigation command, 
               not directly setting an array index. Our job is to take any integer and 
               normalize it into a valid real‑item index.

               To normalize, we apply logic that preserves the semantics of navigation: 
                   -if looping, wrap using Euclidean modulo (circular navigation)
                   -if not looping, clamp to the nearest valid index (bounded navigation)

               We do NOT simply clamp out‑of‑range values to 0 or any fixed index. While 
               that would technically fall within the bounds of slideContent, it would 
               break the expected semantics of carousel navigation and produce incorrect 
               behavior for autoplay, keyboard navigation, gesture momentum, and synced 
               carousels.
            */
            const newIndex = getNewActiveItemIndex(actualItemIndex, loop, actualItemCount); 
            
            setFocusedAbsoluteItemIndex(newIndex);

            onActiveIndexChange?.(newIndex);
        },
        [loop, actualItemCount, onActiveIndexChange]
    );

    const nextSlide = useCallback(() => {
        setFocusedAbsoluteItemIndex(currentActiveIndex => {
            const newIndex = getNewActiveItemIndex(currentActiveIndex + 1, loop, actualItemCount);
            onActiveIndexChange?.(newIndex);
            return newIndex;
        });
    }, [loop, actualItemCount, onActiveIndexChange]);


    const prevSlide = useCallback(() => {
        setFocusedAbsoluteItemIndex(currentActiveIndex => {
            const newIndex = getNewActiveItemIndex(currentActiveIndex - 1, loop, actualItemCount);
            onActiveIndexChange?.(newIndex);
            return newIndex;
        });
    }, [loop, actualItemCount, onActiveIndexChange]);

    /* Expose object for parent components when useRef is used. A ref normally points to a DOM element like
    
           const ref = useRef<HTMLDivElement>(null)
           <div ref={ref} />
        
       But we want to to expose the Carousel component so we can do

           const ref = useRef<CarouselHandle>(null); 
           <Carousel ref={ref} />

        This allows the parent to do things like ref.current?.nextSlide(). The dependency array ensures the
        handle object only regenerates if one of the things passed to it (like nextSlide) changes. This keeps
        the ref stable and prevents unnecessary re-renders in parents. For more information on imperative components,
        see docs/patterns/components.md.
    */
    useImperativeHandle(ref, () => ({ nextSlide, prevSlide, jumpToSlide }), [nextSlide, prevSlide, jumpToSlide]);

    /********************************************   PRESS-AND-HOLD LOGIC   ******************************************/ 

    const startHold = (direction: "next" | "prev") => {
        /* false negative for coverage */
        // console.log("START HOLD CURRENT REF PATH CHECK RAN");
        if (rotateIntervalRef.current) { 
            return; 
        }
        
        rotateIntervalRef.current = window.setInterval(() => {
            /* Linter did not like the user of a ternary here. */
            if (direction === "next") {
                nextSlide();
            }
            else {
                prevSlide();
            }
        }, 150);
    };

    const stopHold = () => {
        if (rotateIntervalRef.current) {
            clearInterval(rotateIntervalRef.current);
            rotateIntervalRef.current = null;
        }
    };

    /********************************************   SLOT LOGIC   ******************************************/ 

    /* Returns the slot that an item from the slideContent array should show up in given that item's 
       absolute index in the slideContent array. For example, say we have three teas in slideContent,
       
           index 0: Dragonwell
           index 1: Tai Ping Hou Kui
           index 2: Mao Feng

        These are the absolute indices of these teas. Say the user has brought Mao Feng to the front of
        the Carousel. In that case, focusedAbsoluteItemIndex will be 2, because it is the index of the item
        in slideContent that the user is focusing on. We'll get

            Dragonwell slot       : residue = modEuclidean(0 - 2, 3) = --> 1 --> Right (1)
            Tai Ping Hou Kui slot : residue = modEuclidean(1 - 2, 3) = --> 2 --> Left (-1)
            Mao Feng slot         : residue = modEuclidean(2 - 2, 3) = --> 0 --> Center (0)
    */
    function getSlotForOneToThreeItems(absoluteItemIndex: number): CarouselSlot | null {
        if (actualItemCount === 1) {
            return CarouselSlot.Center;
        }

        else if (actualItemCount === 2) {
            if (absoluteItemIndex === focusedAbsoluteItemIndex) return CarouselSlot.Center;

            return CarouselSlot.Left;
        }

        /* actualItemCount === 3 */
        else {
            /* residue is NOT the slot but the circular distance between two absolute indices. */
            const residue = modEuclidean(absoluteItemIndex - focusedAbsoluteItemIndex, 3);

            if (residue === 0) {
                return CarouselSlot.Center;
            }
            else if (residue === 1) {
                return CarouselSlot.Right;
            }
            /* residue === 2 */
            else {
                return CarouselSlot.Left;
            }
        }
    }

    // function getSlotForOneToThreeItems(absoluteItemIndex: number): CarouselSlot | null {
    //     if (actualItemCount === 1) {
    //         return CarouselSlot.Center;
    //     }

    //     if (actualItemCount === 2) {
    //         if (absoluteItemIndex === focusedAbsoluteItemIndex) return CarouselSlot.Center;

    //         return CarouselSlot.Left;
    //     }

    //     if (actualItemCount === 3) {
    //         /* residue is NOT the slot but the circular distance between two absolute indices. */
    //         const residue = modEuclidean(absoluteItemIndex - focusedAbsoluteItemIndex, 3);

    //         if (residue === 0) return CarouselSlot.Center;
    //         if (residue === 1) return CarouselSlot.Right;
    //         if (residue === 2) return CarouselSlot.Left;

    //         return null;
    //     }

    //     /* 0 and 4+ items are handled elsewhere. */
    //     return null;
    // }


    /* Declare an object where the keys are the numeric slot values (-1, 1, 0, etc. as dictated by the 
       CarouselSlot object) and the values are SlotTransform objects.

       x represents the horizontal translation of the the center of an item relative to the center of
       the track. So, slot 0 (center) has an x of 0. Slot 1 (right) has an x of 260, placing its center 
       260 pixels to the right of the center of the track. If slot 1 has a width of 256, it's right edge 
       will be at 260 + (256 / 2) = 388px away from the center of the track on the right. If we multiply this 
       number by 2 to account for the left side of the track (left of the center of the track), we'll
       know the total necessary minimum width for the track. */
	const slotTransforms: Record<CarouselSlot, SlotTransform> = {
        [CarouselSlot.Center]: {
            x: 0,
            scale: 1,
            rotateY: 0,
            zIndex: 5,
        },
        [CarouselSlot.Right]: {
            x: 260,
            scale: 0.85,
            rotateY: 25,
            zIndex: 4,
        },
        [CarouselSlot.Left]: {
            x: -260,
            scale: 0.85,
            rotateY: -25,
            zIndex: 4,
        },
        [CarouselSlot.RightSilhouette]: {
            x: 180,
            scale: 0.7,
            rotateY: 45,
            zIndex: 2,
        },
        [CarouselSlot.LeftSilhouette]: {
            x: -180,
            scale: 0.7,
            rotateY: -45,
            zIndex: 2,
        },
    };

    /* Special transform for the 2 slot case needed for the item that is behind the focused one. */
    const twoItemBehindTransform: SlotTransform = {
        x: -120,
        scale: 0.75,
        rotateY: -15,
        zIndex: 1,
    };

    /* IMPORTANT: All items will have the same height and width EVEN THOUGH after we apply the 3D affects,
       they will appear to have different dimensions. This allows us to have simpler math below and assume
       equal widths and heights for everything. So, when thinking about the math, assume the items are all 
       flat on a table. */
    const itemHeight = 320;
    const itemWidth = 256;
    const trackHeight = itemHeight + 20;

    /* Find the largest number of pixels any element moves left or right on the track, measure from the
       center of the track to the center of the element. */
    const maxItemOffsetFromTrackCenter = Math.max(
        ...Object.values(slotTransforms).map(item => Math.abs(item.x))
    );

    const itemRightEdgePosition = maxItemOffsetFromTrackCenter + (itemWidth / 2);

    /* Give the track only as much space as it needs so we don't eat up space for no reason when fewer
       items are passed in. */
    let trackWidth: number;
    if (actualItemCount === 1) {
        trackWidth = itemWidth;
    } 
    else if (actualItemCount === 2) {
        /* Enough room for the front card plus a bit more space for the card peeking out behind it. */
        trackWidth = itemWidth + 60;
    } 
    else {
        trackWidth = itemRightEdgePosition * 2;
    }

    /********************************************   RENDER HELPER LOGIC   ******************************************/ 

    const renderSilhouette = () => {
        return <div className="h-full w-full rounded-xl bg-neutral-800/40 shadow-lg" />;
    };

    const renderSlideTrackOneToThreeItems = () => {
        return slideContent.map((item, itemIndex) => {
            const slot = getSlotForOneToThreeItems(itemIndex);

            if (slot === null) return null;

            /* Is the item we are currently on the center / focused one? If it's slot is the center one, then yes. */
            const isActive = slot === CarouselSlot.Center;

            /* Are we on the case where we have two items and the item we are currently on is the one that goes 
               in back? */
            const isTwoItemBehind = (actualItemCount === 2) && (slot === CarouselSlot.Left);

            /* In the case of 1-3 items, we would only show a silhouette if there are 2 items and we're on the one
               in the back. */
            const isSilhouette = isTwoItemBehind;

            /* Use the proper transform object. The only time we use a different one is in the
               case of 2 items. */
            const transform = 
                isTwoItemBehind
                ? twoItemBehindTransform
                : slotTransforms[slot];

            const targetOpacity = isSilhouette ? 0.4 : 1;

            /* Regardless of the number of slides, only the Center one should ever behave like a button
               for accessibility reasons. The user should only be able to interact with that one slide, making it
               focusable, reachable via keyboard, and unhidden. 
               
                We must use motion.div instead of motion.button for the active slide in order for Framer Motion to
                animate the Center slide properly. This means we must ensure the the Center slide has the
                properties of a button to keep it accessible. 
            */
            if (isActive) {
                return (
                    <motion.div
                        key={itemIndex}
                        role="button"
                        tabIndex={0}
                        aria-current="true"
                        aria-label={`Item ${itemIndex + 1} of ${actualItemCount}`}
                        onClick={() => onSlideClick?.(item, itemIndex)}
                        className="slide"
                        style={{
                            zIndex: transform.zIndex,
                            width: `${itemWidth}px`,
                            height: `${itemHeight}px`,
                        }}
                        initial={{ opacity: targetOpacity }}
                        animate={{
                            x: transform.x,
                            scale: transform.scale,
                            rotateY: transform.rotateY,
                            opacity: targetOpacity,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 26,
                        }}
                    >
                        {renderSlide({item, index: itemIndex, isActive})}
                    </motion.div>
                );
            }

            return (
                <motion.div
                    key={itemIndex}
                    aria-hidden={isSilhouette ? "true" : undefined}
                    tabIndex={-1}
                    className="slide"
                    style={{
                        zIndex: transform.zIndex,
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                    }}
                    initial={{ opacity: targetOpacity }}
                    animate={{
                        x: transform.x,
                        scale: transform.scale,
                        rotateY: transform.rotateY,
                        opacity: targetOpacity,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 26,
                    }}
                >
                    {isSilhouette ? renderSilhouette() : renderSlide({item, index: itemIndex, isActive})}
                </motion.div>
            );
        });
    };

    const renderSlideTrackFourItems = () => {
        /* For exactly 4 items, we use up all 5 visual slots still so the carousel looks attractive. 
           We solve the mismatch by creating a clone of the silhouette and giving it a unique
           identity. Framer Motion needs each slot to have a unique identity in it to animate
           correctly.*/

        return ALL_SLOTS.map((slot) => {
            const transform = slotTransforms[slot];

            const isSilhouette = Math.abs(slot) === CarouselSlot.RightSilhouette;

            const itemIndex = modEuclidean(focusedAbsoluteItemIndex + slot, actualItemCount);

            const item = slideContent[itemIndex];

            const isActive = (slot === CarouselSlot.Center) && !isSilhouette;

            const targetOpacity = isSilhouette ? 0.4 : 1;

            /* The right silhouette is a clone of the the left silhouette with a changed 
               identity (uniqueKey). Up until the code that follows, the previous code should
               be the same as for the 5+ item code. */
            const isRightDuplicateSilhouette =
                (slot === CarouselSlot.RightSilhouette) && 
                (itemIndex === modEuclidean(focusedAbsoluteItemIndex - 2, actualItemCount));

            const uniqueKey = 
                isRightDuplicateSilhouette
                ? `${itemIndex}-clone`
                : itemIndex;

            /* Regardless of the number of slides, only the Center one should ever behave like a button
               for accessibility reasons. The user should only be able to interact with that one slide, making it
               focusable, reachable via keyboard, and unhidden. 
               
                We must use motion.div instead of motion.button for the active slide in order for Framer Motion to
                animate the Center slide properly. This means we must ensure the the Center slide has the
                properties of a button to keep it accessible. 
            */
            if (isActive) {
                return (
                    <motion.div
                        key={uniqueKey}
                        role="button"
                        tabIndex={0}
                        aria-current="true"
                        aria-label={`Item ${itemIndex + 1} of ${actualItemCount}`}
                        onClick={() => onSlideClick?.(item, itemIndex)}
                        className="slide"
                        style={{
                            zIndex: transform.zIndex,
                            width: `${itemWidth}px`,
                            height: `${itemHeight}px`,
                        }}
                        initial={{ opacity: targetOpacity }}
                        animate={{
                            x: transform.x,
                            scale: transform.scale,
                            rotateY: transform.rotateY,
                            opacity: targetOpacity,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 26,
                        }}
                    >
                        {renderSlide({item, index: itemIndex, isActive})}
                    </motion.div>
                );
            }

            return (
                <motion.div
                    key={uniqueKey}
                    aria-hidden={isSilhouette ? "true" : undefined}
                    tabIndex={-1}
                    className="slide"
                    style={{
                        zIndex: transform.zIndex,
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                    }}
                    initial={{ opacity: targetOpacity }}
                    animate={{
                        x: transform.x,
                        scale: transform.scale,
                        rotateY: transform.rotateY,
                        opacity: targetOpacity,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 26,
                    }}
                >
                    {isSilhouette ? renderSilhouette() : renderSlide({item, index: itemIndex, isActive})}
                </motion.div>
            );
        });
    };

    const renderSlideTrackFivePlusItems = () => {
        return ALL_SLOTS.map((slot) => {
            const transform = slotTransforms[slot];

            const isSilhouette = Math.abs(slot) === CarouselSlot.RightSilhouette;

            const itemIndex = modEuclidean(focusedAbsoluteItemIndex + slot, actualItemCount);

            const item = slideContent[itemIndex];

            const isActive = (slot === CarouselSlot.Center) && !isSilhouette;

            const targetOpacity = isSilhouette ? 0.4 : 1;

            /* Regardless of the number of slides, only the Center one should ever behave like a button
               for accessibility reasons. The user should only be able to interact with that one slide, making it
               focusable, reachable via keyboard, and unhidden. 
               
                We must use motion.div instead of motion.button for the active slide in order for Framer Motion to
                animate the Center slide properly. This means we must ensure the the Center slide has the
                properties of a button to keep it accessible. 
            */
            if (isActive) {
                return (
                    <motion.div
                        key={itemIndex}
                        role="button"
                        tabIndex={0}
                        aria-current="true"
                        aria-label={`Item ${itemIndex + 1} of ${actualItemCount}`}
                        onClick={() => onSlideClick?.(item, itemIndex)}
                        className="slide"
                        style={{
                            zIndex: transform.zIndex,
                            width: `${itemWidth}px`,
                            height: `${itemHeight}px`,
                        }}
                        initial={{ opacity: targetOpacity }}
                        animate={{
                            x: transform.x,
                            scale: transform.scale,
                            rotateY: transform.rotateY,
                            opacity: targetOpacity,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 26,
                        }}
                    >
                        {renderSlide({item, index: itemIndex, isActive})}
                    </motion.div>
                );
            }

            return (
                <motion.div
                    key={itemIndex}
                    aria-hidden={isSilhouette ? "true" : undefined}
                    tabIndex={-1}
                    className="slide"
                    style={{
                        zIndex: transform.zIndex,
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                    }}
                    initial={{ opacity: targetOpacity }}
                    animate={{
                        x: transform.x,
                        scale: transform.scale,
                        rotateY: transform.rotateY,
                        opacity: targetOpacity,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 26,
                    }}
                >
                    {isSilhouette ? renderSilhouette() : renderSlide({item, index: itemIndex, isActive})}
                </motion.div>
            );
        });
    };

    /********************************************   COMPONENT RENDERING   ******************************************/ 

    const previousItemButton = 
        <button
            type="button"
            aria-label="Previous item"
            onClick={prevSlide}            
            onMouseDown={() => startHold("prev")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            className="carousel-nav-button"
            data-tip={"Previous item"}
        >
            ‹
        </button>;

    /* 
        The slide track uses absolute positioning for its child elements. This lets us overlap items and 
        move them independently, which is essential behavior for a carousel. However, absolutely positioned 
        elements use their parent's top-left corner as their (0, 0) origin.

        Our transform math assumes a different coordinate system where (0, 0) is the true center
        of the slide track. So, an item with x = 0 would appear centered, and x = 260 would place 
        the item 260 pixels to the right of the center.

        To align the browser’s layout coordinate system with our transform coordinate system, we make the 
        slide track a flex container and center its contents both horizontally and vertically. This shifts 
        the effective origin for absolute positioning to the visual center of the track, so our transforms 
        behave exactly as intended.

        Items are rendered as children of motion.button so they remain clickable, focusable, and accessible. 
        Recall that divs are not appropriate for interactive elements, as they have accessibility issues.

        styling: 
            width: "100%" --> Ask the slide track to take up the entire width of its parent container. Now, the parent
            container is a flex container with three flex children: a previous arrow to the left of the track, the
            track itself, and a next arrow to the right of the track. We set shrink-0 on the arrows to force them 
            not to shrink. Flexbox will resolve the conflict by shrinking the track. So, the actual width we end up 
            with for the track will be smaller than 100% and bounded by maxWidth and minWidth.

            maxWidth: `${trackWidth}px` --> Track should never be larger than the calculated track width.

            minWidth: `${itemWidth}px` --> Track should never be smaller than the calculated width of one of its items.

            height: : `${trackHeight}px` --> Track should remain the calculated height.

            perspective: "1200px" --> Perspective must be applied to the parent of the transformed elements. This gives 
            the children their 3D slant when combined with rotateY and scale.

            overflow: "hidden" --> Clip any part of the track that can't be shown at the current width.

          CRITICAL SOLUTION FOR 4-ITEM CAROUSEL:
            
            The Challenge:

                When exactly 4 items are passed to the carousel, we want to display 5 visual elements 
                (2 silhouettes + 3 content cards) to maintain the carousel's aesthetic. However, with 
                only 4 unique items cycling through 5 positions, mathematical necessity dictates that 
                one item must appear in BOTH silhouette positions simultaneously (slots -2 and 2).
            
            The Problem:

                If we use key={itemIndex} for all elements (like we do for 5+ items), React encounters 
                duplicate keys when the same item appears in both silhouette slots. This causes:
                    1. React warnings about duplicate keys.
                    2. Undefined behavior in the virtual DOM.
                    3. Framer Motion opacity compounding - each animation cycle adds another layer of 
                       opacity, making silhouettes progressively darker.
                
                Why other approaches failed:
                    - Using key={slot}: Prevents darkening but breaks animation - elements stay in fixed 
                      positions and don't rotate around the carousel.
                    - Static silhouettes: Solves duplicate keys but silhouettes don't animate, losing the 
                      immersive "rotating on a vertical axis" effect.
                    - Skipping duplicate rendering: Only shows one silhouette, breaking visual symmetry.
                
                The solution is a "clone" strategy. We create a VIRTUAL fifth item by cloning the 
                duplicate. Specifically:
                    1. Detect which item appears in both silhouette positions.
                    2. Give the RIGHT silhouette a unique key by appending "-clone" to the itemIndex.
                    3. The LEFT silhouette keeps the regular itemIndex as its key.
                    4. Now we have 5 elements with unique keys: items 0, 1, 2, 3, and "3-clone" (for example).
                
            Result:
                - All 5 elements can move independently through the carousel slots.
                - React treats them as separate DOM elements (no duplicate key warnings).
                - Framer Motion animates each element's position smoothly (circular rotation effect).
                - Opacity is set explicitly via initial={{ opacity: targetOpacity }}, preventing 
                  any compounding.
                - Both silhouettes remain visible and animate, maintaining visual polish.
            
            This approach balances mathematical constraints (4 items, 5 slots) with UX requirements 
            (smooth circular animation, no darkening, visual symmetry).
    */
    const slideTrack =
        <div
            className="flex items-center justify-center"
            style={{
                width: actualItemCount === 2 ? `${trackWidth}px` : "100%",
                maxWidth: actualItemCount === 2 ? undefined : `${trackWidth}px`,
                minWidth: `${itemWidth}px`,
                height: `${trackHeight}px`,
                perspective: "1200px",
                overflow: "hidden",
            }}
        >
            {(actualItemCount === 4) ? renderSlideTrackFourItems() : 
            (actualItemCount >= 5) ? renderSlideTrackFivePlusItems() : 
            renderSlideTrackOneToThreeItems()}
        </div>;

    const nextItemButton = 
        <button
            type="button"
            aria-label="Next item"
            onClick={nextSlide}
            onMouseDown={() => startHold("next")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            className="carousel-nav-button"
            data-tip={"Next item"}
        >
            ›
        </button>;

    /* There is a lot happening in Carousel, so we assign it the region role and "carousel" description for 
       accessibility. Screen readers will have a named area they can jump directly to and the user will know the
       controls are related.

       touch-pan-y allows vertical scrolling on touch devices and prevents horizontal scrolling on the carousel and
       pinch zoom. */
    return (
        <div
            role="region"
            aria-roledescription="Carousel"
            aria-label={ariaLabel}
            aria-live="polite"
            tabIndex={0}
            className="flex touch-pan-y items-center justify-center gap-4"
        >
            {(actualItemCount > 1) && previousItemButton}
            {slideTrack}
            {(actualItemCount > 1) && nextItemButton}
        </div>
    );

};

export const Carousel = forwardRef(CarouselInner) as <
    T
>(
    props: CarouselProps<T> & { ref?: React.Ref<CarouselHandle> }
) => React.ReactElement;
