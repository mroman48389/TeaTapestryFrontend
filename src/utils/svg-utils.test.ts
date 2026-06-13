import { generateContinuousWavePath } from "./svg-utils";

describe("generateFixedWavePath", () => {

    // it("Uses default parameters when none are provided.", () => {
    //     const path = generateContinuousWavePath();
    //     expect(path).toMatch(/^M0 10 C/); // confirms path starts correctly
    //   });

    it("Returns a valid SVG path string.", () => {
        const path = generateContinuousWavePath(3, 10, 5);

        /* Starts with M0,10. */
        expect(path.trim().startsWith("M0,10")).toBe(true);

        /* Contains a line segment. */
        expect(path.includes("L")).toBe(true);

        /* Contains a cubic Bezier curve. */
        expect(path.includes("C")).toBe(true);
    });

});