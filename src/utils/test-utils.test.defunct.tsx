import { render, screen } from "@testing-library/react";

import { renderWithRouter, createMemoizedComponentWithSpy, setUpMatchMediaMock} from "./test-utils";

/* DEFUNCT

   These tests were intentionally disabled because they target internal test utilities 
   (ex: renderWithRouter, createMemoizedComponentWithSpy, setUpMatchMediaMock) rather 
   than the application itself. Test utilities are implementation details of the 
   test environment, not part of the production codebase, and testing them does not 
   increase confidence in Tea Tapestry’s behavior or correctness. The test utilities are
   not user-visible, do not contain business logic, and are not part of the app’s 
   runtime behavior. Future testing efforts should focus on components, hooks, and 
   flows that affect real user interactions and application state.

*/

const TestDivArrowFunction = () => <div data-testid="test-div-arrow-function">Test div arrow function</div>;

function TestDivNamed() {
    return <div data-testid="test-div-named">Test div named</div>;
}

const TestDivNamedComponent = function TestDivNamedComponentFunction() {
    return <div data-testid="test-div-named-component">Named</div>;
};

describe("renderWithRouter", () => {

    it("Renders the component.", () => {
        renderWithRouter(<TestDivArrowFunction/>);
        expect(screen.getByTestId("test-div-arrow-function")).toBeInTheDocument();
    });

});

describe("createMemoizedComponentWithSpy", () => {

    it("Returns a memoized component and a spy.", () => {
        const { Memoized } = createMemoizedComponentWithSpy(TestDivArrowFunction);
        render(<Memoized/>);
        expect(screen.getByTestId("test-div-arrow-function")).toBeInTheDocument();
    });

    it("Calls spy on render.", () => {
        const { Memoized, spy } = createMemoizedComponentWithSpy(TestDivArrowFunction);
        render(<Memoized/>);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("Uses passed in displayName for Component's displayName.", () => {
        const { Memoized } = createMemoizedComponentWithSpy(TestDivArrowFunction, {displayName: 'TestDisplayName'});
        render(<Memoized/>);
        expect(Memoized.displayName).toBe("TestDisplayName");
    });

    it("Uses preset displayName for Component's displayName.", () => {
        /* Need to cast as function component (FC) in order to use .displayName. */
        (TestDivArrowFunction as React.FC).displayName = 'TestDisplayName';
        const { Memoized } = createMemoizedComponentWithSpy(TestDivArrowFunction);
        render(<Memoized/>);
        expect(Memoized.displayName).toBe("TestDisplayName");
    });

    it("Uses the function name of the component as the displayName for the Component's displayName.", () => {
        const { Memoized } = createMemoizedComponentWithSpy(TestDivNamed);
        render(<Memoized/>);
        expect(screen.getByTestId("test-div-named")).toBeInTheDocument();
        expect(Memoized.displayName).toBe("TestDivNamed");
    });

    it("Uses Component.name when displayName is not set.", () => {        
        const { Memoized } = createMemoizedComponentWithSpy(TestDivNamedComponent);
        render(<Memoized/>);
        expect(Memoized.displayName).toBe("TestDivNamedComponentFunction");
    });

});

describe("setUpMatchMediaMock", () => {

    it("Should register and trigger listeners via triggerChange.", () => {
        const mock = setUpMatchMediaMock(false);
        const listener = jest.fn();

        const result = window.matchMedia("(min-width: 768px)");
        result.addListener(listener);

        mock.triggerChange(true);

        expect(result.matches).toBe(true);
        expect(listener).toHaveBeenCalledWith({ matches: true });
    });

    it("Should support addEventListener and removeEventListener", () => {
        const mock = setUpMatchMediaMock(false);
        const listener = jest.fn();

        const result = window.matchMedia("(min-width: 768px)");
        result.addEventListener("change", listener);

        mock.triggerChange(true);
        expect(listener).toHaveBeenCalledWith({ matches: true });

        result.removeEventListener("change", listener);
        mock.triggerChange(false);
        expect(listener).toHaveBeenCalledTimes(1); // no second call
    });

    it("Should support addListener and removeListener.", () => {
        const mock = setUpMatchMediaMock(false);
        const listener = jest.fn();

        const result = window.matchMedia("(min-width: 768px)");
        result.addListener(listener);

        mock.triggerChange(true);
        expect(listener).toHaveBeenCalledWith({ matches: true });

        result.removeListener(listener);
        mock.triggerChange(false);
        expect(listener).toHaveBeenCalledTimes(1); // no second call
    });

    it("Should return fallback object when query does not match mediaQueryList.media.", () => {
        setUpMatchMediaMock(false); // sets mediaQueryList.media to "(min-width: 768px)"

        const result = window.matchMedia("(max-width: 500px)");

        expect(result).toEqual({ matches: false, media: "(max-width: 500px)" });
    });
});
