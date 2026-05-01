import { screen, fireEvent, waitFor, act } from "@testing-library/react";

import HamburgerMenu from "./HamburgerMenu";

import { renderWithRouter, setUpMatchMediaMock } from "@/utils/test-utils";

// import { pageIDs } from "@/constants/pages";

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

    /* UPDATE: We can no longer test "setting the new page" because React Router takes care of that, but we can test
       that it navigates to a new page, so slightly change the test. */
    // it("Integration test: Should set the new page and close the drawer when a nav item is clicked.", async () => {
    //     const mockOnSelectPage = jest.fn();

    //     /* Render the drawer and open it. For simple user events like fireEvent.click, React Testing Library
    //        automatically wraps the state updates in act(), so explicit wrapping is not needed. */
    //     renderWithRouter(<HamburgerMenu selectedPageID={pageIDs.about} onSelectPage={mockOnSelectPage}/>);
    //     renderWithRouter(<HamburgerMenu/>);
    //     fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i })); 

    //     /* Click a nav item. The "/i" makes the match case insensitive. Text should be what you see on the screen. */
    //     fireEvent.click(screen.getByRole("link", { name: /about/i }));

    //     /* Check that the mock onSelectPage was called with the expected page ID. */
    //     expect(mockOnSelectPage).toHaveBeenCalledWith(pageIDs.about);

    //     /* waitFor is needed because clicking a nav item triggers a state update that conditionally unmounts the 
    //        drawer, and we wait for the DOM to reflect the drawer’s disappearance. */
    //     await waitFor(() => {
    //         /* Check that the drawer is closed. */
    //         expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
    //     });
    // });

    it("Integration test: Should navigate to the new page and close the drawer when a nav item is clicked.", async () => {
        const { router  } = renderWithRouter(<HamburgerMenu/>);

        /* Open the drawer. */
        fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i }));

        /* Click the About link. */
        fireEvent.click(screen.getByRole("link", { name: /about/i }));

        /* Assert navigation happened. */
        expect(router.state.location.pathname).toBe("/about");

        /* Assert drawer closed. */
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
        });
    });



});