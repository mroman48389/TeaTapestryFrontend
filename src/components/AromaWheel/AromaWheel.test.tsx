import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { AromaWheel } from "./AromaWheel";
import { AromaCategories } from "@/types/aromas";

/* Wrap sample aroma category data in a function to ensure each test
    gets its own fresh copy. () => ({}) will impliticly return
    the content while () => { ... } requires an explicit return inside
    the {}. Implicit is nice because we can't accidentally forget the
    return. */
const getSampleAromaCatData = (): AromaCategories => ({
    categories: [
        {
            id: "cat-1",
            name: "Floral",
            color: "#ff0000",
            aromas: [
                { id: "aro-1", name: "Rose" },
                { id: "aro-2", name: "Jasmine" },
            ],
        },
        {
            id: "cat-2",
            name: "Fruity",
            color: "#00ff00",
            aromas: [{ 
                id: "aro-3", name: "Peach" 
            }],
        },
    ],
});

/* This render helper's job is to pass props appropriately to AromaWheel. 
   AromaWheel handles most default props, so we only need to pass in a 
   couple of relevant ones depending on the test. 

   By using Partial here, any time we call renderAromaWheel, we only 
   need to pass in the subset of AromaWheel props we actually care about 
   for the test. Default to {} so we don't need to pass in any by default. */
function renderAromaWheel(
    propOverrides: Partial<React.ComponentProps<typeof AromaWheel>> = {}
) {
    /* If AromaCategories data was passed in, used that, otherwise use 
        sample data. The AromaWheel generally needs at least some sample
        data for us to do meaningful tests on it. */
    const data = propOverrides.data ?? getSampleAromaCatData();
    return render(<AromaWheel data={data} {...propOverrides}/>);
}

describe("AromaWheel: Basic rendering.", () => {

    test("Unit test: Renders the SVG with the correct aria-label.", () => {
        renderAromaWheel();

        // Role was removed to address Axe accessibility concerns.
        //expect(screen.getByRole("img", { name: /tea aroma wheel/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/tea aroma wheel/i)).toBeInTheDocument();
    });

    test("Unit test: Renders category labels with correct test IDs and expected aroma category name.", () => {
        const data = getSampleAromaCatData();
        renderAromaWheel({ data });

        for (const aromaCat of data.categories) {
            /* Category arc label <text>. */
            const label = screen.getByTestId(`category-label-text-${aromaCat.id}`);
            expect(label).toBeInTheDocument();
            expect(label).toHaveTextContent(aromaCat.name);
        }
    });

    test("Unit test: Renders aroma labels with correct test IDs and expected aroma name.", () => {
        const data = getSampleAromaCatData();
        renderAromaWheel({ data });

        for (const aromaCat of data.categories) {
            for (const aroma of aromaCat.aromas) {
                /* Aroma arc label <text>. */
                const label = screen.getByTestId(`aroma-label-text-${aromaCat.id}-${aroma.id}`);
                expect(label).toBeInTheDocument();
                expect(label).toHaveTextContent(aroma.name);
            }
        }
    });

    test("Unit test: Renders AromaWheel with empty aroma category data without breaking.", () => {
        renderAromaWheel({ data: { categories: [] } });

        // Role was removed to address Axe accessibility concerns.
        //expect(screen.getByRole("img", { name: /tea aroma wheel/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/tea aroma wheel/i)).toBeInTheDocument();
        
        expect(screen.queryByTestId(/category-label-text-/)).toBeNull();
    });

    test("Unit test: Renders AromaWheel with a category containing no aromas.", () => {
        renderAromaWheel({ 
            data: { 
                categories: [
                    {
                        id: "cat-1",
                        name: "Floral",
                        color: "#ff0000",
                        aromas: [],
                    },
                ] 
            },
        });

        // Role was removed to address Axe accessibility concerns.
        //expect(screen.getByRole("img", { name: /tea aroma wheel/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/tea aroma wheel/i)).toBeInTheDocument();
    });

});

describe("AromaWheel: Hover events.", () => {

    test("Unit test: Calls onAromaHoverChange when hovering and leaving an aroma arc.", () => {
        const data = getSampleAromaCatData();
        const onAromaHoverChange = jest.fn();
        renderAromaWheel({ data, onAromaHoverChange });

         /* Aroma arc <path>. */
        const aromaArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");

        fireEvent.mouseEnter(aromaArc);
        expect(onAromaHoverChange).toHaveBeenCalledTimes(1);

        const [aroma, category] = onAromaHoverChange.mock.calls[0];
        expect(aroma?.id).toBe("aro-1");
        expect(category?.id).toBe("cat-1");

        fireEvent.mouseLeave(aromaArc);
        expect(onAromaHoverChange).toHaveBeenCalledTimes(2);
        /* onAromaHoverChange takes an Aroma and AromaCategory. Now that the mouse has left the
           aroma arc, these should both be null (this happens in handleAromaArcMouseLeave). */
        expect(onAromaHoverChange).toHaveBeenLastCalledWith(null, null);
    });

    test("Unit test: Calls onCategoryHoverChange when hovering and leaving a category arc.", () => {
        const data = getSampleAromaCatData();
        const onCategoryHoverChange = jest.fn();
        renderAromaWheel({ data, onCategoryHoverChange });

        /* Category arc <path>. */
        const catArc = screen.getByTestId("category-arc-path-cat-1");

        fireEvent.mouseEnter(catArc);
        expect(onCategoryHoverChange).toHaveBeenCalledTimes(1);

        const [category] = onCategoryHoverChange.mock.calls[0];
        expect(category?.id).toBe("cat-1");

        fireEvent.mouseLeave(catArc);
        expect(onCategoryHoverChange).toHaveBeenCalledTimes(2);
        /* onCategoryHoverChange takes an AromaCategory. Now that the mouse has left the
           category arc, it should be null (this happens in handleCategoryArcMouseLeave). */
        expect(onCategoryHoverChange).toHaveBeenLastCalledWith(null);
    });

    test("Integration: hovering an aroma arc triggers onAromaHoverChange with correct aroma + category", () => {
        const data = getSampleAromaCatData();

        const onAromaHoverChange = jest.fn();

        renderAromaWheel({
            data,
            interactive: true,
            onAromaHoverChange,
        });

        /* Pick a specific aroma arc from the sample data */
        const aromaCat = data.categories[0];      // Floral
        const aroma = aromaCat.aromas[0];         // Rose

        /* The component should render an aroma arc with this test id. */
        const aromaArc = screen.getByTestId(
            `aroma-arc-path-${aromaCat.id}-${aroma.id}`
        );

        fireEvent.mouseEnter(aromaArc);
        
        expect(aromaArc).toBeInTheDocument();
        
        expect(onAromaHoverChange).toHaveBeenCalledTimes(1);
        expect(onAromaHoverChange).toHaveBeenCalledWith(aroma, aromaCat);
    });

});

describe("AromaWheel: Click events.", () => {

    test("Unit test: Calls onAromaClick when an aroma arc is clicked.", () => {
        const onAromaClick = jest.fn();
        renderAromaWheel({ onAromaClick, interactive: true});

        /* Aroma arc <path>. */
        const aromaArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");

        fireEvent.click(aromaArc);

        expect(onAromaClick).toHaveBeenCalledTimes(1);

        const [aroma, category] = onAromaClick.mock.calls[0];
        expect(aroma.id).toBe("aro-1");
        expect(category.id).toBe("cat-1");
    });

    test("Unit test: Calls onCategoryClick when a category arc is clicked.", () => {
        const onCategoryClick = jest.fn();
        renderAromaWheel({ onCategoryClick });

        /* Category arc <path>. */
        const catArc = screen.getByTestId("category-arc-path-cat-1");
        fireEvent.click(catArc);

        expect(onCategoryClick).toHaveBeenCalledTimes(1);

        const [category] = onCategoryClick.mock.calls[0];
        expect(category.id).toBe("cat-1");
    });

});

describe("AromaWheel: Keyboard events.", () => {

    test("Integration test: Enter and Space keys trigger onAromaClick for focused aroma.", () => {
        const onAromaClick = jest.fn();
        renderAromaWheel({ 
            onAromaClick, 
            focusedAromaId: "aro-1" 
        });

        /* Aroma arc <path>s. */
        const aromaArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");

        fireEvent.click(aromaArc); // sets focus
        expect(onAromaClick).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(aromaArc, { key: "Enter" });
        fireEvent.keyDown(aromaArc, { key: " " });

        expect(onAromaClick).toHaveBeenCalledTimes(3);
    });

    test("Integration test: ArrowRight key moves focus to next aroma and calls onAromaHoverChange.", () => {
        const onAromaHoverChange = jest.fn();
        const onAromaClick = jest.fn();
        const onFocusedAromaIdChange = jest.fn();

        renderAromaWheel({         
            onAromaHoverChange,
            onAromaClick,
            onFocusedAromaIdChange,
            focusedAromaId: "aro-1"
        });

        /* Aroma arc <path>s. */
        const startingArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");

        fireEvent.keyDown(startingArc, { key: "ArrowRight" });

        expect(onAromaHoverChange).toHaveBeenCalled();

        /* The last call should look like onAromaHoverChange(nextAroma, nextAromaCategory). 
           Knowing just the nextAroma is enough for the purpose of this test. We can use ! 
           because we just asserted onAromaHoverChange was called. This avoids TypeScript
           complaints about pop() returning something undefined that can't be 
           destructured. */
        const [nextAroma] = onAromaHoverChange.mock.calls.pop()!;
        expect(nextAroma.id).toBe("aro-2");

        /* Moving to the next aroma should have called onAromaClick with an Aroma with id "aro-3" and 
           some AromaCategory object (we don't care about the details of the latter for this test). */
        expect(onAromaClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: "aro-2" }),
            expect.any(Object)
        );

        /* Focus should now be on the next aroma. */
        expect(onFocusedAromaIdChange).toHaveBeenCalledWith("aro-2");
    });

    test("Integration test: ArrowRight key moves focus to first aroma if the last aroma has focus.", () => {
        const onAromaHoverChange = jest.fn();
        const onAromaClick = jest.fn();
        const onFocusedAromaIdChange = jest.fn();
        renderAromaWheel({         
            onAromaHoverChange,
            onAromaClick,
            onFocusedAromaIdChange,
            focusedAromaId: "aro-3" // start on last aroma
        });

        /* Aroma arc <path>s. */
        const startingArc = screen.getByTestId("aroma-arc-path-cat-2-aro-3");

        fireEvent.keyDown(startingArc, { key: "ArrowRight" });

        expect(onAromaHoverChange).toHaveBeenCalled();

        const [nextAroma] = onAromaHoverChange.mock.calls.pop()!;
        expect(nextAroma.id).toBe("aro-1");

        /* Moving to the next aroma should have called onAromaClick with an Aroma with id "aro-1" and 
           some AromaCategory object (we don't care about the details of the latter for this test). */
        expect(onAromaClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: "aro-1" }),
            expect.any(Object)
        );

        /* Focus should now be on the first aroma. */
        expect(onFocusedAromaIdChange).toHaveBeenCalledWith("aro-1");
    });

    test("Integration test: ArrowRight key does not trigger aroma hover change if no aroma has focus.", () => {
        const onAromaHoverChange = jest.fn();
        renderAromaWheel({ onAromaHoverChange });

        /* Aroma arc <path>s. */
        const startingArc = screen.getByTestId("aroma-arc-path-cat-2-aro-3");

        fireEvent.keyDown(startingArc, { key: "ArrowRight" });

        expect(onAromaHoverChange).not.toHaveBeenCalled();
    });

    test("Integration test: ArrowLeft key wraps to last aroma.", () => {
        const data = getSampleAromaCatData();
        const onAromaHoverChange = jest.fn();
        const onAromaClick = jest.fn();
        const onFocusedAromaIdChange = jest.fn();
        renderAromaWheel({         
                data,
            onAromaHoverChange,
            onAromaClick,
            onFocusedAromaIdChange,
            focusedAromaId: "aro-1", // start on first aroma 
        });

        /* Aroma arc <path>s. */
        const firstArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");

        fireEvent.keyDown(firstArc, { key: "ArrowLeft" });

        const [lastAroma] = onAromaHoverChange.mock.calls.pop()!;
        expect(lastAroma.id).toBe("aro-3"); // last aroma in dataset

        /* Moving to the next aroma should have called onAromaClick with an Aroma with id "aro-3" and 
           some AromaCategory object (we don't care about the details of the latter for this test). */
        expect(onAromaClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: "aro-3" }),
            expect.any(Object)
        );

        /* Focus should now be on the last aroma. */
        expect(onFocusedAromaIdChange).toHaveBeenCalledWith("aro-3");
    });

    test("Integration test: Does not call callbacks or handle keyboard events when interactive prop is false.", () => {
        const onAromaClick = jest.fn();
        const onAromaHoverChange = jest.fn();
        const onCategoryClick = jest.fn();
        const onCategoryHoverChange = jest.fn();

        renderAromaWheel({
            interactive: false,
            onAromaClick,
            onAromaHoverChange,
            onCategoryClick,
            onCategoryHoverChange,
        });

        // setTimeout(() => console.error("ASYNC STILL RUNNING"), 0);

        /* Aroma arc <path>s and category arc <path>s. */
        const aromaArc = screen.getByTestId("aroma-arc-path-cat-1-aro-1");
        const catArc = screen.getByTestId("category-arc-path-cat-1");

        fireEvent.click(aromaArc);
        fireEvent.mouseEnter(aromaArc);
        fireEvent.mouseLeave(aromaArc);
        fireEvent.keyDown(aromaArc, { key: "ArrowRight" });

        fireEvent.click(catArc);
        fireEvent.mouseEnter(catArc);
        fireEvent.mouseLeave(catArc);

        expect(onAromaClick).not.toHaveBeenCalled();
        expect(onAromaHoverChange).not.toHaveBeenCalled();
        expect(onCategoryClick).not.toHaveBeenCalled();
        expect(onCategoryHoverChange).not.toHaveBeenCalled();
    });

});

describe("AromaWheel: Press-and-hold navigation.", () => {

    beforeEach(() => { 
        jest.useFakeTimers(); 
    }); 
    
    afterEach(() => { 
        jest.useRealTimers(); 
    });

    interface RotationTestParams {
        testId: string;
        startEvent: "mouseDown" | "touchStart";
        stopEvent: "mouseUp" | "touchEnd";
    }

    function testRotationInteraction({
        testId,
        startEvent,
        stopEvent,
    }: RotationTestParams) {
        const btn = screen.getByTestId(testId);
        const group = screen.getByTestId("aroma-wheel-rotation-group");

        const initialTransform = group.getAttribute("transform");

        fireEvent[startEvent](btn);
        /* Causes React state updates, so must be wrapped with act. */
        act(() => jest.advanceTimersByTime(200));

        const middleTransform = group.getAttribute("transform");
        expect(middleTransform).not.toBe(initialTransform);

        fireEvent[stopEvent](btn);
        /* Causes React state updates, so must be wrapped with act. */
        act(() => jest.advanceTimersByTime(200));

        /* Verify that the rotation has fully stopped and the transform is
            stable. */
        const finalTransformBefore = group.getAttribute("transform");

        /* Wait for any pending updates. Causes React state updates, so must be wrapped with act. */
        act(() => jest.advanceTimersByTime(50));

        const finalTransformAfter = group.getAttribute("transform");
        expect(finalTransformAfter).toBe(finalTransformBefore);
    }

    test("Integration test: Rotates when holding clockwise button and stops when released.", () => {
        renderAromaWheel();

        testRotationInteraction({ 
            testId: "rotate-clockwise-btn", 
            startEvent: "mouseDown", 
            stopEvent: "mouseUp", 
        });
    });

    test("Integration test: Starts rotating on touch for clockwise button and stops when touch stops.", () => {
        renderAromaWheel();

        testRotationInteraction({ 
            testId: "rotate-clockwise-btn", 
            startEvent: "touchStart", 
            stopEvent: "touchEnd", 
        });
    });

    test("Integration test: Rotates when holding counterclockwise button and stops when released.", () => {
        renderAromaWheel();

        testRotationInteraction({ 
            testId: "rotate-counterclockwise-btn", 
            startEvent: "mouseDown", 
            stopEvent: "mouseUp", 
        });
    });

    test("Integration test: Starts rotating on touch for counterclockwise button and stops when touch stops.", () => {
        renderAromaWheel();

        testRotationInteraction({ 
            testId: "rotate-counterclockwise-btn", 
            startEvent: "touchStart", 
            stopEvent: "touchEnd", 
        });
    });

    test("Integration test: Rotation internal logic.", () => {
        renderAromaWheel();

        const btn = screen.getByTestId("rotate-clockwise-btn");
        fireEvent.mouseDown(btn);

        /* Causes React state updates, so must be wrapped with act. */
        act(() => {
            jest.advanceTimersByTime(100);
        });

        fireEvent.mouseDown(btn);
        fireEvent.mouseUp(btn);
    });

});