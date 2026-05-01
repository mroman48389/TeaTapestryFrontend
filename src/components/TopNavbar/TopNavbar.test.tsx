import { screen } from "@testing-library/react";

import TopNavbar from "./TopNavbar";

import { renderWithRouter } from "@/utils/test-utils";

// import { pageIDs } from "@/constants/pages";

describe("TopNavbar", () => {

    /* Integration tests */

    it("Integration test: Renders TopNavbar with and TopNavbarList.", () => {
        // renderWithRouter(<TopNavbar selectedPageID={pageIDs.about} onSelectPage={() => {}}/>);
        renderWithRouter(<TopNavbar/>);
        expect(screen.getByRole("list")).toBeInTheDocument();
    });

});