
import { ComponentPropsWithoutRef } from "react";

// import { PageID } from "@/constants/pages";
import { pageIDs } from "@/constants/pages";
import NavListItem from "../NavListItem";

type NavSidebarListProps = {
    open: boolean;
    onNavClick : () => void;
    // selectedPageID: PageID;
    // onSelectPage: (value: PageID) => void;
} & ComponentPropsWithoutRef<"ul">;

export default function NavSidebarList(props: NavSidebarListProps) {
    // const {open, selectedPageID, onSelectPage, ...rest} = props;
    const {open, onNavClick, ...rest} = props;

    const liClassName = "nav-sidebar-list-item";

    /*  The following makes the text appear less clunky when the sidebar opens/closes.

        "overflow-hidden": Prevents text from spilling out while the sidebar is narrow.
        "transition-opacity duration-150": Smoothly fades the list in/out over 1.5 seconds
        
        "opacity-100 delay-200 relative": When sidebar is open, make the list fully visible after 1.5 seconds so you don't see
        the text until the sidebar finishes expanding. Relative keeps the list in the normal document flow.

        "opacity-0 absolute": When the sidebar is closed, make the text invisible immediately and position absolutely to 
        remove it from document flow so we don't see the text get squeezed as the sidebar shrinks.
    */
    return (
        <>
            <ul 
                data-testid="nav-sidebar-list"
                className={`nav-sidebar-list overflow-hidden transition-opacity duration-150 ${open ? "relative opacity-100 delay-150" : "absolute opacity-0"}`}
                {...rest} 
            > 
                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.whatIsTea}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.whereDoesTeaComeFrom}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.growingAndProcessing}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.brewingMethods}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.experiencingTea}
                    liClassName={liClassName}
                />
                
                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.teaProfiles}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.teaware}
                    liClassName={liClassName}
                />

                <NavListItem 
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    onClick={onNavClick}
                    pageID={pageIDs.teaTerminology}
                    liClassName={liClassName}
                />
            </ul>
        </>
    );
}