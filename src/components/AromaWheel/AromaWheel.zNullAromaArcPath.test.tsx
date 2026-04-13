/* This mock must come before any imports that use d3-shape. We need
    a d3 shape that returns null for a path for one of our tests. We 
    also don't want to apply this mock to all tests, so tests that need
    it have to live in this separate file. */
jest.doMock("d3-shape", () => {
    /* Start with the actual d3-shape. */
    const actual = jest.requireActual("d3-shape");

    /* Make the d3-shape return a null path. */
    const fakeArc = () => {
        /* Component calls this to get the path. */
        const arcGenerator = () => null; 

        /* Added necessary functions to prevent arcGenerator from breaking. */
        arcGenerator.innerRadius = () => arcGenerator;
        arcGenerator.outerRadius = () => arcGenerator;
        arcGenerator.startAngle = () => arcGenerator;
        arcGenerator.endAngle = () => arcGenerator;
        arcGenerator.centroid = () => [0, 0];

        return arcGenerator;
    };
    
    /* Return a d3-shape based on the actual one, but with an arc function that
       returns the null path we need for our test. */
    return {
        ...actual,
        arc: fakeArc,
    };
});

import { render, screen } from "@testing-library/react"; 
import { AromaWheel, AromaWheelProps } from "./AromaWheel";

describe("AromaWheel arc null path tests", () => {

    test("Unit test: Renders wheel if arc generator generates bad paths.", () => {
        
        function renderAromaWheel(props: AromaWheelProps) { 
            return render(<AromaWheel {...props} />); 
        }

        const data = {
            categories: [
                {
                    id: "cat-1",
                    name: "Floral",
                    color: "#ff0000",
                    aromas: [
                        { id: "aro-1", name: "Rose" },
                    ],
                },
            ]
        };

        renderAromaWheel({ data: data });

        // Role was removed to address Axe accessibility concerns.
        //expect(screen.getByRole("img", { name: /tea aroma wheel/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/tea aroma wheel/i)).toBeInTheDocument();
    });
});