import { render, screen } from "@testing-library/react";

import NavSidebarToggle from "./NavSidebarToggle";
import NavSidebarList from "./NavSidebarList";
import NavSidebar from "./NavSidebar";

import { renderWithRouter } from "@/utils/test-utils";

// import { pageIDs } from "@/constants/pages";

describe("NavSidebar", () => {

    test("Unit test: Renders the NavSidebarToggle.", () => {
        render(<NavSidebarToggle open={false} onToggleClick={() => {}}/>);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("Unit test: Renders the NavSidebarList.", () => {
        // renderWithRouter(<NavSidebarList open={false} selectedPageID={pageIDs.whatIsTea} onSelectPage={() => {}}/>);
        renderWithRouter(<NavSidebarList open={false} onNavClick={() => {}}/>);
        expect(screen.getByRole("list")).toBeInTheDocument();
    });

    test("Integration test: Renders NavSidebar with NavSidebarToggle and NavSidebarList.", () => {
        // renderWithRouter(<NavSidebar sidebarOpen={false} onOpenSidebar={() => {}} selectedPageID={pageIDs.whatIsTea} onSelectPage={() => {}}/>);
        renderWithRouter(<NavSidebar sidebarOpen={false} onOpenSidebar={() => {}}/>);
        expect(screen.getByRole("button")).toBeInTheDocument();
        expect(screen.getByRole("list")).toBeInTheDocument();
    });

});