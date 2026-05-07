import { ComponentPropsWithoutRef } from "react";

import NavSidebarToggle from "./NavSidebarToggle";
import NavSidebarList from "./NavSidebarList";

// import { PageID } from "@/constants/pages";
import { getSidebarWidthOrMarginLeft } from "@/utils/class-utils";
import { SidebarSettingType } from "@/constants/app";

type NavSidebarProps = {
    sidebarOpen: boolean;
    onOpenSidebar: () => void;

    // selectedPageID: PageID;
    // onSelectPage : (value: PageID) => void;
} & ComponentPropsWithoutRef<"nav">;

export default function NavSidebar(props: NavSidebarProps) {
    // const {sidebarOpen, onOpenSidebar, selectedPageID, onSelectPage, ...rest} = props;
    const {sidebarOpen, onOpenSidebar, ...rest} = props;

    /* Make sure any changes to the dimensions of this component are reflected in the Suspense 
       that wraps it where it is used! We need to avoid layout shifts when lazy loading and
       keep LCP and CLS low. */
    return (
        <nav aria-label="Nav sidebar" className="hidden md:block"{...rest}>
            <div className={
                `nav-sidebar 
                transition-[width] 
                duration-200 ease-in-out 
                ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.Width)}`
            }>
                <NavSidebarToggle 
                    open={sidebarOpen}
                    onToggleClick={onOpenSidebar}
                />
                <NavSidebarList
                    open={sidebarOpen}
                    onNavClick={() => {}}
                    // selectedPageID={selectedPageID}
                    // onSelectPage={onSelectPage}
                />
            </div>
        </nav>
    );
}