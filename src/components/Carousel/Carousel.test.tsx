import React, { createRef } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Carousel, CarouselHandle } from "./Carousel";

interface TestItem { 
    id: number; 
    label: string;
}

const getActiveIndex = () => {
    /* data-active and data-testid are set on the slides via the helper used in renderCarousel. First,
        get all slides by looking for "slide-" in their test id. */
    const slides = screen.getAllByTestId(/slide-/);

    /* Only the active slide will have data-active set to true. */
    const activeSlide = slides.find(s => s.getAttribute("data-active") === "true");

    /* If it's not the active slide, we don't care about it. */
    if (!activeSlide) return -1;

    /* Otherwise, get the test id of the active slide (ex: "slide-1") and match it to the "slide-x" 
        pattern, where x is one or more numerical digits. The match will return an array where the
        first element is the string we are trying to match and the second is digit captured from the 
        string. So, if the active slide has test id "slide-1", we will have:
        
            activeSlide.getAttribute("data-testid")?.match(/slide-(\d+)/) -->
            "slide-1".match(/slide-(\d+)/) -->
            ["slide-1", "1"]

    */
    const match = activeSlide.getAttribute("data-testid")?.match(/slide-(\d+)/);

    /* Return the active index from the match array. Number(match[1]) could potentially be null in theory, 
        but won't be null because of how the test is set up. This is just defensive programming. */
    return match ? Number(match[1]) : -1;
};

const generateSlideContent = (numItems: number): TestItem[] =>
    Array.from({ length: numItems }, (_, i) => ({ id: i, label: `Item ${i}` }));

const renderSlide = ({
    item,
    index,
    isActive,
}: {
    item: TestItem;
    index: number;
    isActive: boolean;
}) => (
    /* data-testid will allow us to lock on to certain slides in tests and data-active will
       allow us to assert whether the slide is active. */
    <div 
        data-testid={`slide-${index}`} 
        data-active={isActive ? "true" : "false"}
    >
        {item.label}
    </div>
);

/* This render helper's job is to build a working Carousel instance. Carousel has has no 
   default content. We are building it in here via renderSlide and generateSlideContent.
   These differences make renderCarousel more complex than renderAromaWheel. 
   
   Also,using CarouselProps in the params here doesn't give us any real benefits because
   we still need to list the props out when we deconstruct them and build parts we need
   to build, and it's also more straightforward to just tailor props like items,
   onSlideClick, and ref to suit our needs for the tests. 
   
   Still, we pass in optional parameters via opts to avoid code duplication when we need
   to render the Carousel. */
const renderCarousel = (opts?: {
    items?: TestItem[];
    loop?: boolean;
    ariaLabel?: string;
    onActiveIndexChange?: (index: number) => void;
    onSlideClick?: (item: TestItem, index: number) => void;
    ref?: React.RefObject<CarouselHandle>;
}) => {
    const {
        items = generateSlideContent(5),
        loop = true,
        ariaLabel = "Test Carousel",
        onActiveIndexChange,
        onSlideClick,
        ref,
    } = opts ?? {};

    return render(
        <Carousel<TestItem>
            ref={ref as React.RefObject<CarouselHandle>}
            slideContent={items}
            ariaLabel={ariaLabel}
            loop={loop}
            onActiveIndexChange={onActiveIndexChange}
            onSlideClick={onSlideClick}
            renderSlide={renderSlide}
        />
    );
};

describe("Carousel: Basic rendering.", () => {

    test("Unit test: Renders as a region.", () => {
        /* To behave as a proper accessible region landmark, the Carousel must:

            1) Be discoverable in screen reader landmark navigation:
                - role="region" + aria-label
            2) Be keyboard-navigable:
                - tabIndex="0"
            3) Convey its semantic purpose:
                - role="region" + aria-roledescription="carousel"
            4) Announce dynamic slide changes appropriately:
                - aria-live="polite"
        */

        renderCarousel({ ariaLabel: "Teas with this aroma" });

        const region = screen.getByRole("region", { name: "Teas with this aroma" });

        expect(region).toBeInTheDocument();
        expect(region).toHaveAttribute("aria-roledescription", "Carousel");
        expect(region).toHaveAttribute("aria-live", "polite");
        expect(region).toHaveAttribute("tabIndex", "0");
    });

    test("Unit test: Does not render navigation buttons when there is exactly 1 item.", () => {
        renderCarousel({ items: generateSlideContent(1) });

        expect(screen.queryByRole("button", { name: "Previous item" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Next item" })).not.toBeInTheDocument();
    });

    test("Unit test: Renders navigation buttons when there are 2 items.", () => {
        renderCarousel({ items: generateSlideContent(2) });

        expect(screen.getByRole("button", { name: "Previous item" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Next item" })).toBeInTheDocument();
    });
});

describe("Carousel: Advanced rendering of slides based on slots and item count.", () => {

    test("Unit test: Rendering with 1 item should produce exactly 1 real active slide and no silhouettes.", () => {
        renderCarousel({ items: generateSlideContent(1) });

        const allSlides = document.querySelectorAll(".slide");
        expect(allSlides).toHaveLength(1);

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlide).toHaveClass("slide");
        expect(activeSlide).toHaveAttribute("aria-current", "true");
        expect(activeSlide).toHaveAttribute("tabIndex", "0");

        const silhouetteSlides = [...allSlides].filter(el => (el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides).toHaveLength(0);
    });

    test("Unit test: Rendering with 2 items should produce 1 real active slide and 1 silhouette.", () => {
        renderCarousel({ items: generateSlideContent(2) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));
        expect(allSlides).toHaveLength(2);

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlide).toHaveClass("slide");
        expect(activeSlide).toHaveAttribute("aria-current", "true");
        expect(activeSlide).toHaveAttribute("tabIndex", "0");

        const silhouetteSlides = allSlides.filter(el => (el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides).toHaveLength(1);
        expect(silhouetteSlides[0]).toHaveClass("slide");
        expect(silhouetteSlides[0]).toHaveAttribute("tabIndex", "-1");
    });

    test("Unit test: Rendering with 3 items should produce 3 real slides (1 active, 2 inert) and no silhouettes.", () => {
        renderCarousel({ items: generateSlideContent(3) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));
        expect(allSlides).toHaveLength(3);

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlide).toHaveClass("slide");
        expect(activeSlide).toHaveAttribute("aria-current", "true");
        expect(activeSlide).toHaveAttribute("tabIndex", "0");

        const inertRealSlides = allSlides.filter(
            el => (el !== activeSlide) && !el.hasAttribute("aria-hidden")
        );
        expect(inertRealSlides).toHaveLength(2);
        inertRealSlides.forEach(realSlide => {
            expect(realSlide).toHaveAttribute("tabIndex", "-1");
        });

        const silhouetteSlides = allSlides.filter((el => el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides).toHaveLength(0);
        silhouetteSlides.forEach(el => {
            expect(el).toHaveClass("slide");
            expect(el).toHaveAttribute("tabIndex", "-1");
        });
    });

    test("Unit test: Rendering with 4 items should produce 3 real slides (1 active, 2 inert) and 2 silhouettes.", () => {
        renderCarousel({ items: generateSlideContent(4) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));
        expect(allSlides).toHaveLength(5);

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlides = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlides).toHaveClass("slide");
        expect(activeSlides).toHaveAttribute("aria-current", "true");
        expect(activeSlides).toHaveAttribute("tabIndex", "0");

        const inertRealSlides = allSlides.filter(
            el => (el !== activeSlides) && !el.hasAttribute("aria-hidden")
        );
        expect(inertRealSlides).toHaveLength(2);
        inertRealSlides.forEach(realSlide => {
            expect(realSlide).toHaveAttribute("tabIndex", "-1");
        });

        const silhouetteSlides = allSlides.filter(el => (el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides).toHaveLength(2);
        silhouetteSlides.forEach(el => {
            expect(el).toHaveClass("slide");
            expect(el).toHaveAttribute("tabIndex", "-1");
        });
    });

    test("Unit test: Rendering with 5 or more items should produce 3 real slides (1 active, 2 inert) and 2 silhouettes.", () => {
        renderCarousel({ items: generateSlideContent(6) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));
        expect(allSlides).toHaveLength(5);

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlide).toHaveClass("slide");
        expect(activeSlide).toHaveAttribute("aria-current", "true");
        expect(activeSlide).toHaveAttribute("tabIndex", "0");

        const inertRealSlides = allSlides.filter(
            el => (el !== activeSlide) && !el.hasAttribute("aria-hidden")
        );
        expect(inertRealSlides).toHaveLength(2);
        inertRealSlides.forEach(realSlide => {
            expect(realSlide).toHaveAttribute("tabIndex", "-1");
        });

        const silhouetteSlides = allSlides.filter((el => el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides).toHaveLength(2);
        silhouetteSlides.forEach(el => {
            expect(el).toHaveClass("slide");
            expect(el).toHaveAttribute("tabIndex", "-1");
        });
    });

});

describe("Carousel: 4-item clone strategy.", () => {

    test("Unit test: When exactly 4 items are rendered, unique keys are used for silhouettes.", () => {
        const { container } = renderCarousel({ items: generateSlideContent(4) });

        /* We should have 5 slides. If the cloned silhouette was properly given a unique key, then
           expressing the slides as a set should reveal 5 unique items. React does not expose 
           keys for us to examine, so assertion must be made via DOM identity. */
        const allSlides = Array.from(container.querySelectorAll(".slide"));
        expect(allSlides).toHaveLength(5);

        const uniqueElements = new Set(allSlides);
        expect(uniqueElements.size).toBe(5);
    });

    test("Integration test: When exactly 4 items are rendered, the user sees 5 visual elements before and after navigation.", () => {
        renderCarousel({ items: generateSlideContent(4) });

        const nextButton = screen.getByRole("button", { name: "Next item" });

        const getSlides = () => Array.from(document.querySelectorAll(".slide"));

        const initialSlides = getSlides();
        expect(initialSlides).toHaveLength(5);

        fireEvent.click(nextButton);

        const afterClickSlides = getSlides();
        expect(afterClickSlides).toHaveLength(5);
    });

});

describe("Carousel: Click events.", () => {

    test("Unit test: If the slide is active, clicking triggers onSlideClick. Otherwise, it does not.", () => {
        const onSlideClick = jest.fn();
        
        renderCarousel({ items: generateSlideContent(5), onSlideClick });

        const allSlides = Array.from(document.querySelectorAll(".slide"));

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        fireEvent.click(activeSlide);
        expect(onSlideClick).toHaveBeenCalledTimes(1);

        const inertRealSlides = allSlides.filter(
            el => (el !== activeSlide) && !el.hasAttribute("aria-hidden")
        );

        /* Fire off whatever event is attached to each slide's onClick. data-testid is set 
           on the slides via the helper used in renderCarousel.  */
        inertRealSlides.forEach(slide => {
            const inner = slide.querySelector("[data-testid]");
            fireEvent.click(inner!);
        });

        /* After clicking all other slides, onSlideClick should still only have been fired once. */
        expect(onSlideClick).toHaveBeenCalledTimes(1);
    });

    test("Unit test: Does not call onSlideClick when a silhouette is clicked.", () => {
        const onSlideClick = jest.fn();

        renderCarousel({ items: generateSlideContent(5), onSlideClick });

        const allSlides = Array.from(document.querySelectorAll(".slide"));
        
        const silhouetteSlides = allSlides.filter(el => (el.getAttribute("aria-hidden") === "true"));

        expect(silhouetteSlides.length).toBeGreaterThan(0);

        fireEvent.click(silhouetteSlides[0]);

        expect(onSlideClick).not.toHaveBeenCalled();
    });

});

describe("Carousel: Imperative API.", () => {
    
    test("Unit test: Exposes nextSlide, prevSlide, and jumpToSlide via ref.", () => {
        const ref = createRef<CarouselHandle>();
        renderCarousel({ ref });

        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.nextSlide).toBe("function");
        expect(typeof ref.current?.prevSlide).toBe("function");
        expect(typeof ref.current?.jumpToSlide).toBe("function");
    });

    test("Integration test: nextSlide advances the active index and calls onActiveIndexChange.", () => {
        const onActiveIndexChange = jest.fn();
        const ref = createRef<CarouselHandle>();

        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange, ref });

        /* Make sure the Carousel starts on slide 0 before moving to the next slide. */
        expect(getActiveIndex()).toBe(0);

        /* Wrap in act to ensure state updates are flushed (needed for active index state). */
        act(() => {
            ref.current?.nextSlide();
        });

        /* Calling nextSlide should have called onActiveIndexChange(1), and then new active index should
           now be 1. */
        expect(onActiveIndexChange).toHaveBeenCalledWith(1);
        expect(getActiveIndex()).toBe(1);
    });

    test("Integration test: prevSlide moves the active index back and calls onActiveIndexChange.", () => {
        const onActiveIndexChange = jest.fn();
        const ref = createRef<CarouselHandle>();

        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange, ref });

        expect(getActiveIndex()).toBe(0);

        act(() => {
            ref.current?.prevSlide();
        });

        /* With 5 items, the first index will be 0 and the last will be 4. So, if we start at 0 and move the
           active index back, it should now be 4. */
        expect(onActiveIndexChange).toHaveBeenCalledWith(4);
        expect(getActiveIndex()).toBe(4);
    });

    test("Integration test: jumpToSlide normalizes indices properly in looping mode.", () => {
        const onActiveIndexChange = jest.fn();
        const ref = createRef<CarouselHandle>();

        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange, ref });

        act(() => {
            ref.current?.jumpToSlide(7); // 7 mod 5 = 2
        });

        expect(onActiveIndexChange).toHaveBeenCalledWith(2);

        act(() => {
            ref.current?.jumpToSlide(-1); // -1 mod 5 = 4
        });

        expect(onActiveIndexChange).toHaveBeenCalledWith(4);
    });

    test("Integration test: jumpToSlide clamps indices in non-looping mode.", () => {
        const onActiveIndexChange = jest.fn();
        const ref = createRef<CarouselHandle>();

        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange, ref, loop: false });

        act(() => {
            ref.current?.jumpToSlide(10);
        });

        expect(onActiveIndexChange).toHaveBeenCalledWith(4);

        act(() => {
            ref.current?.jumpToSlide(-5);
        });

        expect(onActiveIndexChange).toHaveBeenCalledWith(0);
    });
});

describe("Carousel: Press-and-hold navigation.", () => {

    beforeEach(() => { 
        jest.useFakeTimers(); 
    }); 
    
    afterEach(() => { 
        jest.useRealTimers(); 
    });

    test("Integration test: Holding down the Next button advances the slides until mouseup.", () => {
        const onActiveIndexChange = jest.fn();
        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange });

        const nextButton = screen.getByRole("button", { name: "Next item" });

        fireEvent.mouseDown(nextButton);

        act(() => {
            jest.advanceTimersByTime(500); // about 3 ticks at 150ms apiece
        });

        fireEvent.mouseUp(nextButton);

        // First change may come from initial state if any, but we expect multiple calls
        expect(onActiveIndexChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    test("Integration test: Holding down the Prev button reverses the slides until mouseup.", () => {
        const onActiveIndexChange = jest.fn();
        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange });

        const prevButton = screen.getByRole("button", { name: "Previous item" });

        fireEvent.mouseDown(prevButton);

        act(() => {
            jest.advanceTimersByTime(500);
        });

        fireEvent.mouseUp(prevButton);

        expect(onActiveIndexChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    test("Unit test: stopHold clears the interval on mouseLeave.", () => {
        const onActiveIndexChange = jest.fn();
        renderCarousel({ items: generateSlideContent(5), onActiveIndexChange });

        const nextButton = screen.getByRole("button", { name: "Next item" });

        fireEvent.mouseDown(nextButton);

        act(() => {
            jest.advanceTimersByTime(200);
        });

        fireEvent.mouseLeave(nextButton);

        const callCountAfterLeave = onActiveIndexChange.mock.calls.length;

        act(() => {
            jest.advanceTimersByTime(500);
        });

        /* If onActiveIndexChange wasn't called again after advancing the timer,
           we can assume the interval was cleared appropriately. */
        expect(onActiveIndexChange.mock.calls.length).toBe(callCountAfterLeave);
    });
});

describe("Carousel: Accessibility attributes.", () => {

    test("Unit test: Active slide has aria-current=true and others do not.", () => {
        renderCarousel({ items: generateSlideContent(5) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));

        /* Get the active slide this way to ensure we don't pick up the navigation buttons as well. */
        const activeSlide = screen.getByRole("button", {
            hidden: true,
            current: true,
        });
        expect(activeSlide).toHaveClass("slide");
        expect(activeSlide).toHaveAttribute("aria-current", "true");

        const inactiveSlides = allSlides.filter(el => (el !== activeSlide));
        expect(inactiveSlides.length).toBeGreaterThan(0);
        inactiveSlides.forEach(slide => {
            expect(slide).not.toHaveAttribute("aria-current");
        });
    });

    test("Unit test: Silhouette slides are marked aria-hidden=true.", () => {
        renderCarousel({ items: generateSlideContent(5) });

        const allSlides = Array.from(document.querySelectorAll(".slide"));

        const silhouetteSlides = allSlides.filter(el => (el.getAttribute("aria-hidden") === "true"));
        expect(silhouetteSlides.length).toBeGreaterThan(0);
    });

});
