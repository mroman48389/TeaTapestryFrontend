import { useRef, useState, useEffect, memo } from "react";

import { Link, LinkProps } from "react-router-dom";

import TwistedThreadsUnderline from "./TwistedThreadsUnderline";
import { Pages, PageID } from "@/constants/pages";

type NavListItemProps = {
    forceVisible? : boolean;
    liClassName? : string;
    linkClassName? : string;
    pageID: PageID;
    selectedPageID: PageID;
    onSelectPage: (value: PageID) => void;
} & Partial<Pick<LinkProps, "className" | "style" | "target" | "rel">>;

/* List item that can be used for navigation on the top navbar, nav sidebar, or hamburger menu sheet for mobile. */
function NavListItem(props: NavListItemProps) {
    /* Create ref for direct access to anchor element so we can grab info from it (the offsetWidth DOM measurement). We 
       Can't use useState to hold a DOM node directly, since React doesn't know when the DOM is ready. We'd end up
       triggering unncessary re-renders if we tried. This reference will persist across renders. */
    const textRef = useRef<HTMLAnchorElement>(null);
    const [textWidth, setTextWidth] = useState(0);

    const {forceVisible = false, liClassName = "", linkClassName = "", pageID, selectedPageID, onSelectPage, ...rest} = props;
    
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
        <li data-testid="nav-list-item" className={`${liClassName} ${forceVisible ? 'list-item' : ''}`}>

            {/* Note that React Router requires casting refs. */}
            <Link 
                ref={textRef as React.Ref<HTMLAnchorElement>} 
                className={`btn ${linkClassName}`}
                {...rest}
                to={pageLink} 
                onClick={() => onSelectPage(pageID)} 
            >
                {itemName}
            </Link>

            {(itemName === Pages[selectedPageID]?.title) ? <TwistedThreadsUnderline width={textWidth}/> : null}
        </li>
    );
}

/* Only re-render if the selection status changed (item was selected and now isn't or vice versa) or onSelectPage changed 
    (it  shouldn't since it's also memoized). */
export default memo(NavListItem, (prev, next) => {
    const wasSelected = prev.pageID === prev.selectedPageID;
    const isSelected = next.pageID === next.selectedPageID;
    const selectionChanged = wasSelected !== isSelected;
    const onSelectPageChanged = prev.onSelectPage !== next.onSelectPage; 

    return (
        (!selectionChanged) && (!onSelectPageChanged)   
    );
});