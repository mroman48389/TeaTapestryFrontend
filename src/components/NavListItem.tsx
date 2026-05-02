// import { memo } from "react";
import React from "react";
import { useRef, useState, useEffect } from "react";

import { Link, LinkProps, useLocation } from "react-router-dom";

import TwistedThreadsUnderline from "./TwistedThreadsUnderline";
import { Pages, PageID } from "@/constants/pages";
import { getPageIDFromPath } from "@/utils/path-utils";

type NavListItemProps = {
    forceVisible? : boolean;
    liClassName? : string;
    linkClassName? : string;
    pageID: PageID;
    onClick: () => void;
    // selectedPageID: PageID;
    // onSelectPage: (value: PageID) => void;
} & Partial<Pick<LinkProps, "className" | "style" | "target" | "rel">>;

/* List item that can be used for navigation on the top navbar, nav sidebar, or hamburger menu sheet for mobile. */
const NavListItem = React.forwardRef<HTMLLIElement, NavListItemProps>((props, ref) => {

    /* Create ref for direct access to anchor element so we can grab info from it (the offsetWidth DOM measurement). We 
       Can't use useState to hold a DOM node directly, since React doesn't know when the DOM is ready. We'd end up
       triggering unncessary re-renders if we tried. This reference will persist across renders. */
    const textRef = useRef<HTMLAnchorElement>(null);
    const [textWidth, setTextWidth] = useState(0);

    const location = useLocation();
    const selectedPageID = getPageIDFromPath(location.pathname);

    //const {forceVisible = false, liClassName = "", linkClassName = "", pageID, selectedPageID, onSelectPage, ...rest} = props;
    const {forceVisible = false, liClassName = "", linkClassName = "", pageID, onClick, ...rest} = props;
    
    const itemName = Pages[pageID].title;
    const pageLink = Pages[pageID].path;

    useEffect(() => {
        /* If text has been rendered, set its width as state. We'll use this width to determine how long the underline
           svg should be. Effect is dependent on the item name, so run again if item name changes. */
        if (textRef.current) {
            setTextWidth(textRef.current.offsetWidth);
        }
    }, [itemName]);    

    // No longer needed, since React Router handles it.
    // function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
    //     /* Prevent browser from navigating; we'll handle it with React Router ourselves. If we let the browser do this,
    //        it will navigate to a new URL, reload the app, and wipe out our state. */
    //     e.preventDefault(); 
    //     onSelectPage(pageID);
    // }

    return (
        <li ref={ref} data-testid="nav-list-item" className={`${liClassName} ${forceVisible ? 'list-item' : ''}`}>

            {/* Note that React Router requires casting refs. */}
            <Link 
                ref={textRef as React.Ref<HTMLAnchorElement>} 
                className={`btn ${linkClassName}`}
                {...rest}
                to={pageLink} 
                // onClick={() => onSelectPage(pageID)} 
                onClick={() => onClick?.()}
            >
                {itemName}
            </Link>

            {/* {(itemName === Pages[selectedPageID]?.title) ? <TwistedThreadsUnderline width={textWidth}/> : null} */}
            {(itemName === Pages[selectedPageID]?.title) ? <TwistedThreadsUnderline width={textWidth}/> : null}
        </li>
    );
});

NavListItem.displayName = "NavListItem";
export default NavListItem;
/* Only re-render if the selection status changed (item was selected and now isn't or vice versa) or onSelectPage changed 
    (it  shouldn't since it's also memoized). 
    
    UPDATE: No longer needed, since we are deriving the selected page ID from the useLocation hook. React can't compare
    hook values. 
*/
// export default memo(NavListItem, (prev, next) => {
//     const wasSelected = prev.pageID === prev.selectedPageID;
//     const isSelected = next.pageID === next.selectedPageID;
//     const selectionChanged = wasSelected !== isSelected;
//     const onSelectPageChanged = prev.onSelectPage !== next.onSelectPage; 

//     return (
//         (!selectionChanged) && (!onSelectPageChanged)   
//     );
// });