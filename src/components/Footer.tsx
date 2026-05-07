import { ComponentPropsWithoutRef } from "react";

import { getSidebarWidthOrMarginLeft } from "@/utils/class-utils";
import { SidebarSettingType } from "@/constants/app";

type FooterProps = {
    sidebarOpen: boolean;
} & ComponentPropsWithoutRef<"nav">;

export default function Footer(props: FooterProps) {
    const { sidebarOpen, ...rest } = props;

    /* Make sure any changes to the dimensions of this component are reflected in the Suspense 
       that wraps it where it is used! We need to avoid layout shifts when lazy loading and
       keep LCP and CLS low. */
    return (
        <footer 
            data-testid="footer"
            className={`footer ${getSidebarWidthOrMarginLeft(sidebarOpen, SidebarSettingType.MarginLeft)}`} 
            {...rest}
        >
            <div className="ml-10">
                <p className="text-linen-white m-0 font-bold">&copy; 2026 Mark Roman</p>
                <p className="text-linen-white m-0"><small className="text-small">All rights reserved.</small></p>
            </div>
        </footer>
    );
}