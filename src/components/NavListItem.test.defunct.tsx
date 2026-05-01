// import { screen, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";

import NavListItem from "./NavListItem";

// import { renderWithRouter } from "@/utils/test-utils";
import { createMemoizedComponentWithSpy } from "@/utils/test-utils";

import { pageIDs } from "@/constants/pages";

/* DEFUNCT

   These tests were intentionally disabled because NavListItem does not contain 
   meaningful logic that benefits from unit testing, and it is it not expected to going
   foward. This testing suite is being left in as defunct in case that changes. 
   The tests below focus on implementation details (ex: memoization, callback wiring) 
   rather than user-visible behavior.

   Users never interact with NavListItem in isolation; they interact with the 
   parent navigation components where the real behavior occurs. Testing should 
   be performed at that level instead.

*/

describe("NavListItem", () => {

    /* Unit tests */

    // it("Unit test: Calls onSelectPage when anchor is clicked.", () => {
    //     const mockSelect = jest.fn();
    
    //     renderWithRouter(
    //         <NavListItem
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.about}
    //             onSelectPage={mockSelect}
    //         />
    //     );
    
    //     const anchor = screen.getByRole("link", { name: /about/i });
    //     fireEvent.click(anchor);
    
    //     expect(mockSelect).toHaveBeenCalledTimes(1);
    //     expect(mockSelect).toHaveBeenCalledWith(pageIDs.about);
    // });

    it("Unit test, Memoization: Does not re-render when props are unchanged.", () => {
        const options = {
            displayName: "MemoizedNavListItem",
            withRouter: true,
        };
        const { Memoized, spy } = createMemoizedComponentWithSpy(NavListItem, options);

        // const onSelectPage = () => {};

        const { rerender } = render(
            <Memoized
                pageID={pageIDs.about}
                // selectedPageID={pageIDs.about}
                // onSelectPage={onSelectPage}
            />
        );
    
        rerender(
            <Memoized
                pageID={pageIDs.about}
                // selectedPageID={pageIDs.about}
                // onSelectPage={onSelectPage}
            />
        );
    
        expect(spy).toHaveBeenCalledTimes(1);
      });
      
    //   it("Unit test, Memoization: Re-renders when page selection changes.", () => {
    //     const onSelectPage = () => {};

    //     const options = {
    //         displayName: "MemoizedNavListItem",
    //         withRouter: true,
    //     };
    //     const { Memoized, spy } = createMemoizedComponentWithSpy(NavListItem, options);

    //     const { rerender } = render(
    //         <Memoized
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.about}
    //             onSelectPage={onSelectPage}
    //         />
    //     );
    
    //     rerender(
    //         <Memoized
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.brewingMethods}
    //             onSelectPage={onSelectPage}
    //         />
    //     );
    
    //     expect(spy).toHaveBeenCalledTimes(2); 
    // });

    // it("Unit test, Memoization: Re-renders when onSelectPage changes but page selection stays the same.", () => {
    //     const options = {
    //         displayName: "MemoizedNavListItem",
    //         withRouter: true,
    //     };
    //     const { Memoized, spy } = createMemoizedComponentWithSpy(NavListItem, options);

    //     const firstCallback = () => {};
    //     const secondCallback = () => {}; // different reference
      
    //     const { rerender } = render(
    //         <Memoized
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.about}
    //             onSelectPage={firstCallback}
    //         />
    //     );
      
    //     rerender(
    //         <Memoized
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.about}
    //             onSelectPage={secondCallback}
    //         />
    //     );
      
    //     expect(spy).toHaveBeenCalledTimes(2);
    //   });

    /* Integration tests */

    // it("Integration test: Renders the NavListItem with the same pageID as selectedPageID.", () => {
    //     renderWithRouter(
    //         <NavListItem 
    //             pageID={pageIDs.about} 
    //             selectedPageID={pageIDs.about} 
    //             onSelectPage={() => {}}
    //         />
    //     );
    //     expect(screen.getByTestId("twisted-threads-underline")).toBeInTheDocument();
    // });

    // it("Integration test: Renders the NavListItem with a different pageID than selectedPageID.", () => {
    //     renderWithRouter(
    //         <NavListItem 
    //             pageID={pageIDs.about}
    //             selectedPageID={pageIDs.brewingMethods} 
    //             onSelectPage={() => {}}
    //         />
    //     );
    //     /* Note use of queryByTestId, since we expect the conditionally rendered threads underline to not be present. */
    //     expect(screen.queryByTestId("twisted-threads-underline")).not.toBeInTheDocument();
    // });
});