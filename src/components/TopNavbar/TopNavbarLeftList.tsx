// import { PageID } from "@/constants/pages";
import { pageIDs } from "@/constants/pages";
import NavListItem from "../NavListItem";

interface TopNavbarLeftListProps {
    liClassName? : string;
    linkClassName? : string;
    onNavClick : () => void;
    // selectedPageID: PageID;
    // onSelectPage : (value: PageID) => void;
}

export default function TopNavbarLeftList(props: TopNavbarLeftListProps) {
    // const {selectedPageID, onSelectPage, liClassName = "top-navbar-list-item", linkClassName = "top-navbar-btn"} = props;
    const {liClassName = "top-navbar-list-item", linkClassName = "top-navbar-btn", onNavClick} = props;

    return (
        <>
            <NavListItem 
                pageID={pageIDs.home}
                onClick={onNavClick}
                // selectedPageID={selectedPageID}
                // onSelectPage={onSelectPage}
                liClassName={liClassName}
                linkClassName={linkClassName}
            />

            <NavListItem 
                pageID={pageIDs.about}
                onClick={onNavClick}
                // selectedPageID={selectedPageID}
                // onSelectPage={onSelectPage}
                liClassName={liClassName}
                linkClassName={linkClassName}
            />

            <NavListItem 
                pageID={pageIDs.whatsNew}
                onClick={onNavClick}
                // selectedPageID={selectedPageID}
                // onSelectPage={onSelectPage}
                liClassName={liClassName}
                linkClassName={linkClassName}
            />

            <NavListItem 
                pageID={pageIDs.contact}
                onClick={onNavClick}
                // selectedPageID={selectedPageID}
                // onSelectPage={onSelectPage}
                liClassName={liClassName}
                linkClassName={linkClassName}
            />
        </> 
    );
}