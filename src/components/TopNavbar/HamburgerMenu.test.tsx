jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");

    const Link = React.forwardRef(
        (
            {
                children,
                _to, // unused but lint-safe
                ...rest
            }: {
                children: React.ReactNode;
                _to?: unknown;
            },
            ref: React.Ref<HTMLAnchorElement>
        ) => (
            <a
                ref={ref}
                href="#"
                onClick={(e) => e.preventDefault()}
                {...rest}
            >
                {children}
            </a>
        )
    );
    Link.displayName = "MockLink";

    const NavLink = React.forwardRef(
        (
            {
                children,
                _to,
                ...rest
            }: {
                children: React.ReactNode;
                _to?: unknown;
            },
            ref: React.Ref<HTMLAnchorElement>
        ) => (
            <a
                ref={ref}
                href="#"
                onClick={(e) => e.preventDefault()}
                {...rest}
            >
                {children}
            </a>
        )
    );
    NavLink.displayName = "MockNavLink";

    return {
        ...actual,
        Link,
        NavLink,
    };
});

import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { renderWithRouter, setUpMatchMediaMock } from "@/utils/test-utils";

// import { pageIDs } from "@/constants/pages";

import HamburgerMenu from "./HamburgerMenu";

describe("HamburgerMenu", () => {
    it("Unit test: Renders the HamburgerMenu.", () => {
        // renderWithRouter(<HamburgerMenu selectedPageID={pageIDs.about} onSelectPage={() => {}}/>);
        renderWithRouter(<HamburgerMenu/>);
        expect(screen.getByTestId("hamburger-menu")).toBeInTheDocument();
    });

    it("Unit test: Should keep the drawer open on resize when the user shrinks the screen.", async () => {
        /* Simulate initial screen size below the md breakpoint. */
        const mediaMock = setUpMatchMediaMock(false);

        /* Render the component. */
        // renderWithRouter(<HamburgerMenu selectedPageID={pageIDs.about} onSelectPage={() => {}}/>);
        renderWithRouter(<HamburgerMenu/>);
        
        /* Explicit act is needed because the drawer opens with conditional rendering and Framer Motion animation, 
           which may cause delayed state updates that need to be flushed before asserting. */
        await act(async () => {
            /* Simulate clicking the hamburger menu. */
            fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i })); 
        });

        /* Check that the drawer is open. */
        expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();

        /* Explicit act is needed because the resize event triggers a state update via an external event listener 
           (handleResize), which React cannot automatically track without manual flushing. */
        await act(async () => {
            /* Manually trigger media query listeners to simulate the screen shrinking below the md breakpoint. */
            mediaMock.triggerChange(false);

            /* Dispatch a resize event to trigger the component's resize listener. */
            window.dispatchEvent(new Event("resize"));
        });

        /* waitFor is needed because the drawer’s visibility may be affected by animation timing or delayed rendering, 
           so we wait for the DOM to reflect the final state. */
        await waitFor(() => {
            /* Check that the drawer is still open. */
            expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
        });
    });

    it("Unit test: Should close the drawer on resize when the user grows the screen past the md breakpoint.", async () => {
        /* Simulate initial screen size below the md breakpoint, then grow past it during the test. */
        const mediaMock = setUpMatchMediaMock(false); 

        /* Render the component. */
        // renderWithRouter(<HamburgerMenu selectedPageID={pageIDs.about} onSelectPage={() => {}} />);
        renderWithRouter(<HamburgerMenu/>);
        
        /* Explicit act is needed because opening the drawer triggers conditional rendering and animation, which may 
           involve asynchronous updates that need to be flushed before asserting. */
        await act(async () => {
            /* Simulate clicking the hamburger menu. */
            fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i }));
        });

        /* Check that the drawer is open. */
        expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();

        /* Explicit act is needed because the resize event triggers a state update via an external event listener (handleResize), 
           and React requires manual flushing to track updates from non-React sources. */
        await act(async () => {
            /* Manually trigger media query listeners to simulate the screen growing past the md breakpoint. */
            mediaMock.triggerChange(true); 

            /* Dispatch a resize event to trigger the component's resize listener. */
            window.dispatchEvent(new Event("resize")); 
        });

        /* waitFor is needed because the drawer’s closing may involve animation or delayed unmounting, so we wait for the 
           DOM to reflect the final state. */
        await waitFor(() => {
            /* Check that the drawer is closed. */
            expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
        });
    });

    it("Integration test: Clicking a nav item triggers its click handler and closed the menu.", async () => {
        renderWithRouter(<HamburgerMenu />);

        fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i }));

        const aboutLink = screen.getByRole("link", { name: /about/i });
        fireEvent.click(aboutLink);

        /* Drawer should be closed. */
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
        });
    });

});