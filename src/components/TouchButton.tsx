import React from 'react';
import { Button } from '@/components/ui/button';

interface TouchButtonProps {
    onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    children: React.ReactNode;
    buttonClassName?: string;
    buttonTip?: string;
    "data-testid"?: string;
}

/* 
   TouchButton wraps the shadcn <Button> in a real DOM <div> so we can attach 
   touch/mouse handlers and test them reliably. 

   React.forwardRef lets this component accept a ref from its parent and forward 
   it to the inner <div>. The basic pattern looks like:

       const MyComponent = React.forwardRef((props, ref) => {
           return <div ref={ref}>Hello</div>;
       });

   In our case, the forwarded ref points to the wrapper <div>, which is the 
   element that actually receives the touch/mouse events.
*/
export const TouchButton = React.forwardRef<HTMLDivElement, TouchButtonProps>(
    ({ children, buttonClassName, buttonTip, ...rest }, ref) => {
        return (
            <div 
                ref={ref} 
                {...rest}
            >
                <Button 
                    className={buttonClassName} 
                    data-tip={buttonTip}
                >
                    {children}
                </Button>
            </div>
        );
    }
);

/* forwardRef returns an anonymous component, so set the display name. Prevents linting error. */
TouchButton.displayName = "TouchButton";
