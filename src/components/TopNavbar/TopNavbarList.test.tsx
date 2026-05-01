import { screen } from "@testing-library/react";

import TopNavbarList from "./TopNavbarList";

import { renderWithRouter } from "@/utils/test-utils";

// import { pageIDs } from "@/constants/pages";

describe("TopNavbarList", () => {
    it("Renders the TopNavbarList.", () => {
        // renderWithRouter(<TopNavbarList selectedPageID={pageIDs.about} onSelectPage={() => {}}/>);
        renderWithRouter(<TopNavbarList/>);
        expect(screen.getByTestId("top-navbar-list")).toBeInTheDocument();
    });
});