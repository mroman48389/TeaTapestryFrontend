import { ComponentPropsWithoutRef } from "react";

import TeaTapestryTeapot from '../../assets/tea-tapestry-logo-xi-shi-teapot-200x200.svg';
import TeaTapestryLogo from "../../assets/tea-tapestry-logo-400x150.svg";
// import { PageID } from "@/constants/pages";
import TopNavbarList from './TopNavbarList';

type TopNavbarProps = {
    // selectedPageID: PageID;
    // onSelectPage : (value: PageID) => void;
} & ComponentPropsWithoutRef<"header">;

export default function TopNavbar(props: TopNavbarProps) {
    // const {selectedPageID, onSelectPage, ...rest} = props;
    const {...rest} = props;

    /*  Teapot

            1. Grabbed photo of a real Xi Shi teapot and saved as a PNG.
            2. Used Sologo.ai to turn the image into a flat solid image of a teapot using the prompt "I want to convert this teapot into a simple, solid colored logo, preserving its shape.".  Changed the color and took a screenshot that I saved as a PNG.
            3. Image had some shadow effect so I used Paint to fill the shadow with the solid color and spruce up some parts. Saved as PNG.
            4. Used remove.bg to remove background and again save as PNG.
            5. Used convertio.co to change the image to a vector (SVG). 
            6. Opened the file directly in Notepad++ and changed the fill color. Alternatively, we could have copied the <svg> contents of the file and pasted them directly into the code, then modify. Stored this file in src/assets.
            7. Put the favicon in the public folder and made fallbacks. Used freeconvert.com to convert it to ico and png.

        "Tea Tapestry"

            1. Used Claude this time with prompting. It was able to do everything!
            
    */
    return (
        <header className="top-navbar" {...rest}>
            <div className='ml-3 flex items-center justify-between'>
                <img src={TeaTapestryTeapot} alt="Tea Tapestry teapot" width={50} height={50}/>
                <img src={TeaTapestryLogo} alt="Tea Tapestry logo" width={200} height={75}/>
            </div>
            {/* <TopNavbarList selectedPageID={selectedPageID} onSelectPage={onSelectPage}/> */}
            <TopNavbarList/>
        </header>
    );
}