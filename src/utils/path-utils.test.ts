import { getPageIDFromPath } from "@/utils/path-utils";
import { Pages, pageIDs } from "@/constants/pages";

describe("getPageIDFromPath", () => {
    test("Unit test: Returns the correct PageID for a known path.", () => {
        expect(getPageIDFromPath(Pages[pageIDs.teaProfiles].path)).toBe(pageIDs.teaProfiles);
    });

    test("Unit test: Returns home for an unknown path.", () => {
        expect(getPageIDFromPath("/does-not-exist")).toBe(pageIDs.home);
    });
});
