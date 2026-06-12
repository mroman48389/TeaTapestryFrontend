import { motion, AnimatePresence } from "framer-motion";

interface TransitionOverlayProps {
    active: boolean;
}

/* This overlay fades out to ease the transition between components with a high
   visual contrast such as the landing page and app. This makes it so the user 
   doesn't notice when React Router swaps pages. Uses a green-black gradient as
   opposed to straight black to make the transition less stark. The green ties
   in visually with the landing page. AnimatePresence ensures a smooth fade out
   and that the animation finishes before the component we're fading away from
   is unmounted. */
export function TransitionOverlay({ active }: TransitionOverlayProps) {
    // bg-[#0b0f0d]/70 
    // backdrop-blur-[6px]
    return (
        <AnimatePresence>
            {active 
            
            && 
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="
                    pointer-events-none fixed 
                    inset-0 z-9999 bg-linear-to-b
                    from-[--black-wash] to-[#0f0a14]
                "
            />
            }
        </AnimatePresence>
    );
}