
import { ComponentPropsWithoutRef } from "react";
// import { useState } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// import { PageID } from "@/constants/pages";
import { pageIDs } from "@/constants/pages";
import NavListItem from "../NavListItem";
import TopNavbarLeftList from "./TopNavbarLeftList";
import HamburgerMenu from "./HamburgerMenu";

type TopNavbarListProps = {
    // selectedPageID: PageID;
    // onSelectPage : (value: PageID) => void;
} & ComponentPropsWithoutRef<"ul">;

export default function TopNavbarList(props: TopNavbarListProps) {
    // const {selectedPageID, onSelectPage, ...rest} = props;
    const {...rest} = props;

    const liClassName = "top-navbar-list-item";
    const linkClassName = "top-navbar-btn";

    return (
        <nav className="flex" aria-label="Top navbar">
            <ul data-testid="top-navbar-list" className="top-navbar-list" {...rest}> 
                {/* <TopNavbarLeftList selectedPageID={selectedPageID} onSelectPage={onSelectPage}/> */}
                <TopNavbarLeftList/>

                <li className="mr-0">
                    <Avatar>
                        {/* <AvatarImage src="/user.jpg" alt="User" /> */}
                        <AvatarFallback>
                            <AccountCircleIcon className="icon"/>
                        </AvatarFallback>
                    </Avatar>
                </li>

                <NavListItem 
                    forceVisible
                    pageID={pageIDs.logIn}
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                    liClassName={liClassName}
                    linkClassName={linkClassName}
                />

                {/* Show up until the medium breakpoint, then give a height and width of 0. */}
                <li className="h-[36px] w-[36px] md:h-0 md:w-0">
                    {/* <HamburgerMenu selectedPageID={selectedPageID} onSelectPage={onSelectPage}/> */}
                    <HamburgerMenu/>
                </li>
            </ul>
        </nav>
    );
}