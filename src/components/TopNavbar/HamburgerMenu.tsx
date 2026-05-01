import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

import CloseIcon from '@mui/icons-material/Close';

import { MotionConfig, motion, AnimatePresence } from 'framer-motion';

import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import NavSidebarList from '../NavSidebar/NavSidebarList';
import TopNavbarLeftList from './TopNavbarLeftList';
// import { PageID } from '@/constants/pages';

// interface HamburgerMenuProps {
//     selectedPageID: PageID;
//     onSelectPage : (value: PageID) => void;
// }

// export default function HamburgerMenu(props: HamburgerMenuProps) {
export default function HamburgerMenu() {
    const [open, setOpen] = useState(false);

    // const {selectedPageID, onSelectPage} = props;

    useEffect(() => {
        // console.log("useEffect running, open state:", open); 

        const handleResize = () => {
            // console.log("handleResize called");
            /* 768px is equivalent to the md breakpoint in Tailwind. This needs to be done inside the handleResize so that 
              every time the window resizes, the component checks matchMedia to get the latest value. */
            const mediaQuery = window.matchMedia("(min-width: 768px)");

            if (mediaQuery.matches && open) {
                // console.log("Condition met, closing drawer"); 
                setOpen(false);
            }
        };

        /* Listen for changes */
        window.addEventListener("resize", handleResize);

        /* Cleanup */
        return () => {
            // console.log("Cleanup function called"); 
            window.removeEventListener("resize", handleResize);
        };

    }, [open]);

    const hamburgerTopLine = {
        closed: { rotate: 0, y: -6 },
        open: { rotate: 45, y: 0 },
    };
    const hamburgerMiddleLine = {
        closed: { opacity: 1 },
        open: { opacity: 0 },
    };
    const hamburgerBottomLine = {
        closed: { rotate: 0, y: 6 },
        open: { rotate: -45, y: 0 },
    };

    // function hamburgerOnSelectPage(pageID: PageID) {
    //     console.log("hamburgerOnSelectPage called with:", pageID);
    //     onSelectPage(pageID);
    //     setOpen(false);
    // }

    return (
        <div data-testid="hamburger-menu" className="md:hidden">
            {/* shadcn's Sheet will manage the opening and closing of the menu, but we need both SheetTrigger to open the menu and 
                SheetClose to close the menu.  */}
            <Sheet open={open} onOpenChange={setOpen} >
                {/* asChild is needed on SheetTrigger to use the implementation of <Button> we have below. 
                    Without it, <Button> would get wrapped in <button>. All shadcn components ending in Trigger need asChild.*/}
                <SheetTrigger asChild>
                    {/* ghost = no visible border or background */}
                    <Button className="text-dark-mahogany-brown cursor-pointer" variant="ghost" size="icon">
                        <span className="sr-only">Hamburger menu</span>

                        <MotionConfig transition={{ duration: 0.2, ease: 'easeInOut' }}>
                            <motion.div
                                animate={open ? 'open' : 'closed'}
                                className="relative h-10 w-10"
                                style={{ pointerEvents: 'none' }}

                            >
                                <motion.span
                                    variants={hamburgerTopLine}
                                    className="absolute top-1/2 left-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
                                />
                                <motion.span
                                    variants={hamburgerMiddleLine}
                                    className="absolute top-1/2 left-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
                                />
                                <motion.span
                                    variants={hamburgerBottomLine}
                                    className="absolute top-1/2 left-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
                                />
                            </motion.div>
                        </MotionConfig>
                    </Button>
                </SheetTrigger>

                {/* border-l-0 and shadow-none will get rid of the vertical line on the left side of the sheet that goes 
                    down the page.  */}
                <SheetContent 
                    // aria-describedby="hamburger-menu-description" 
                    side="right" 
                    className="border-l-0 shadow-none"
                >
                    {/* For accessibility. */}
                    <VisuallyHidden>
                        <DialogTitle>
                            Navigation menu
                        </DialogTitle>

                        <DialogDescription>
                            Select a page from the navigation menu
                        </DialogDescription>
                        {/* <p id="hamburger-menu-description">Select a page from the navigation menu</p> */}
                    </VisuallyHidden>

                    {/* AnimatePresence allows Framer Motion to perform an exit animation when the sheet is unmounted so it
                        doesn't just disappear instantly. When the sheet is no longer rendered, it triggers the exit
                        animation before the unmount. Note that the key is important for this to work. The "open && () pattern
                        conditionally renders the the sheet, which triggers the exit animation when "open" is false. */}
                    <AnimatePresence>
                        {/* Tried doing a slide-in using pure Tailwind, but couldn't seem to override defaults, so I switched to
                            Framer Motion.
                            
                            The div with the hamburger/X will be positioned in the top right corner of the screen. Since we want the 
                            hamburger/X instead to stay there, we'll have to put some space between it and the content of the div so
                            our content doesn't get cut off. */}
                        {open && (
                            <motion.div
                                key="sheet-content"
                                initial={{ x: '100%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '100%', opacity: 0 }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                                className="bg-tea-steam-green absolute top-0 right-0 h-screen w-[300px] p-5"
                            >
                                <SheetClose asChild>
                                    <Button className="text-dark-mahogany-brown absolute top-4 right-4 cursor-pointer" variant="ghost" size="icon">
                                        <span className="sr-only">Close menu</span>
                                        <CloseIcon />
                                    </Button>
                                </SheetClose>

                                {/* Note that Tailwind doesn't like spaces inside arbitrary values. the margin-top on the divider 
                                    needs to be smaller because the first group of list items has a padding on the bottom. That padding
                                    is needed by the class to ensure the last nav item actually shows the threads underline.
                                    
                                    The last div here is just so the scrollbar doesn't sit flush at the bottom of the last item in the 
                                    list. */}
                                <div className="hamburger-menu-content mt-[calc(var(--height-nav)+15px)] max-h-[calc(100vh-var(--height-nav)-15px)] overflow-y-auto">
                                    <ul className="nav-sidebar-list">
                                        <TopNavbarLeftList 
                                            liClassName="nav-sidebar-list-item" 
                                            linkClassName="text-wood-bowl-brown" 
                                            // selectedPageID={selectedPageID} 
                                            // onSelectPage={hamburgerOnSelectPage}
                                        />
                                    </ul>

                                    <hr className="border-wood-bowl-brown my-8 mt-3 border-t"/>

                                    <NavSidebarList 
                                        open={true} 
                                        // selectedPageID={selectedPageID} 
                                        // onSelectPage={hamburgerOnSelectPage}
                                    />

                                    <div className="h-10" /> {/* Spacer */}
                                </div>
                                
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SheetContent>
            </Sheet>
        </div>
    );
}