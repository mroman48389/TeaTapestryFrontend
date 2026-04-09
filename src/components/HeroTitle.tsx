import { 
    useEffect, 
    useState, 
    useRef
} from "react";

import TwistedThreadsUnderline from "@/components/TwistedThreadsUnderline";

export function HeroTitle({ children }: { children: React.ReactNode }) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleWidth, setTitleWidth] = useState(0);

    useEffect(() => {
        /* If title has been rendered, set its width as state. We'll use this width to determine 
           how long the underline svg should be. */
        if (titleRef.current) {
            setTitleWidth(titleRef.current.offsetWidth);
        }
    }, []);

    return (
        <h1 ref={titleRef} className="relative title--hero w-fit">
            {children}
            <TwistedThreadsUnderline width={titleWidth}/>
        </h1>
    );
}
