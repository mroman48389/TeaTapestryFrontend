import React, {
    useMemo,
    useState,
    useCallback,
    useRef,
    KeyboardEvent,
    CSSProperties,
} from 'react';
import * as d3 from 'd3';
import { hsl } from 'd3-color';
import { RotateLeft, RotateRight } from '@mui/icons-material';

import { TouchButton } from '../TouchButton';
import { Aroma, AromaCategory, AromaCategories } from '@/types/aromas';
import { AromaArc, CategoryArc } from "./AromaWheelTypes";

export interface AromaWheelProps {
    data: AromaCategories;

    /** Size of wheel in pixels. */
    size?: number;

    /** Inner (Category) ring radius ratio. A smaller ratio makes the ring 
        thicker by moving the innermost part of the ring closer to the
        center of the circle.  */
    innerCategoryRadiusRatio?: number;

    /** Gap between categories in radians. Makes it easier to distinguish
        the different aromas visually. */
    gapAngleRad?: number;

    /** If false, the wheel will be static (for mobile mode, where it would
        be difficult to interact with). */
    interactive?: boolean;

    style?: CSSProperties;
    className?: string;

    /** Controlled state. */
    /** The id of the aroma the user clicks on the wheel.  */
    focusedAromaId?: string | null;
    onFocusedAromaIdChange?: (id: string | null) => void;

    /** Semantic events. */
    onAromaClick?: (aroma: Aroma, category: AromaCategory) => void;
    onCategoryClick?: (category: AromaCategory) => void;
    onAromaHoverChange?: (aroma: Aroma | null, category: AromaCategory | null) => void;
    onCategoryHoverChange?: (category: AromaCategory | null) => void;
}

/* ---------------------- COLOR UTILITIES ---------------------- */

function getAromaColor(baseColor: string): string {
    /* Convert base color in hex to HSL (hue, saturation, lightness) object. */
    const newColor = hsl(baseColor);

    /* Increase lightness by 5%, capping it by 1 if it was already light enough
       to exceed 100%. */
    newColor.l = Math.min(1, newColor.l + 0.05);

    return newColor.toString();
}

function getStrokeColor(baseColor: string): string {
    /* Convert base color in hex to HSL (hue, saturation, lightness) object. */
    const newColor = hsl(baseColor);

    /* Increase lightness by 20% and saturation by 10%, capping by 1 to prevent
       exceeding 100%. */
    newColor.l = Math.min(1, newColor.l + 0.2);
    newColor.s = Math.min(1, newColor.s + 0.1);

    return newColor.toString();
}

function getFocusColor(baseColor: string): string {
    /* Convert base color in hex to HSL (hue, saturation, lightness) object. */
    const newColor = hsl(baseColor);

    /* Decrease lightness by 30% and increase saturation by 50%, being sure
       not to go below 0% or above 100%. */
    newColor.l = Math.max(0, newColor.l - 0.3);
    newColor.s = Math.min(1, newColor.s + 0.5);

    return newColor.toString();
}

/* ---------------------------------------- COMPONENT ------------------------------------------ */

/* Domain widget component for visualizing tea aromas. See docs/patterns/component.md. This is
   an optionally controlled component, as the parent should pass in the focused aroma Id. */

export const AromaWheel: React.FC<AromaWheelProps> = ({
    data,
    size = 500,
    innerCategoryRadiusRatio = 0.13,
    gapAngleRad = 0.0,
    interactive = true,
    style,
    className,
    focusedAromaId = null,
    onFocusedAromaIdChange,
    onAromaClick,
    onCategoryClick,
    onAromaHoverChange,
    onCategoryHoverChange,
}) => {
    /* UI state that only matters to the aroma wheel. The focusedAromaId is semantic state needed for 
       several components, so it is lifted up to the parent. */
    const [hoveredAromaId, setHoveredAromaId] = useState<string | null>(null);
    const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
    /* The user can rotate the wheel to make it easier to read certain sections. */
    const [rotationDeg, setRotationDeg] = useState(0);
    /*  Holds the ID of a setInterval timer used for continuous rotation.
        When the user holds down a rotate button, we start the timer, and when they
        release it, we clear it. 
        
        A ref is used so the value persists across renders without triggering 
        re-renders, and because this is not UI state. */
    const rotateIntervalRef = useRef<number | null>(null);

    /* Holds a table with references to the aroma arc paths so we can easily refocus on them if the
       user clicks a rotate button after having previously focused on an aroma arc. After the aroma
       arcs mount, this will look something like:

           aromaArcPathRefs.current = {
               "citrus": SVGPathElement,
               "floral": SVGPathElement,
               "honey": SVGPathElement,
               ...
           }

       The object will start as

           {
               current: {}
           }
    */
    const aromaArcPathRefs = useRef<Record<string, SVGPathElement | null>>({});

    /* debugging */
    //console.log("RAW PROPS RECEIVED:", { data, interactive, onAromaClick, onAromaHoverChange, onCategoryHoverChange, });

    const outerRadius = size / 2;
    const categoryInnerRadius = outerRadius * innerCategoryRadiusRatio;
    const categoryOuterRadius = outerRadius * 0.6;
    const aromaInnerRadius = outerRadius * 0.65;
    const aromaOuterRadius = outerRadius * 0.98;
    const aromaArcPopoutDistance = outerRadius * 0.05;

    /* Create the category and aroma arcs. Since this is expensive derived data 
       and we don't need to recompute it on re-renders, we use useMemo so the
       code only recomputes when necessary. In this case, that would be if
       the data or gapAngleRad changes. */

    const { categoryArcs, aromaArcs } = useMemo(() => {
        const categories = data.categories;
        const numCategories = categories.length;

        if (numCategories === 0) {
            return { categoryArcs: [], aromaArcs: [] };
        }

        const innerArcs: CategoryArc[] = [];
        const outerArcs: AromaArc[] = [];

        const numRadiansCircle = Math.PI * 2;

        /* Get the total number of aromas across all categories. Reduce calls
           a callback function with an accumulator/sum/total as the first 
           parameter and the current element of the array reduce is acting upon
           as the second parameter. In this case, the second element is an 
           AromaCategory, which knows the number of aromas it has. The second
           parameter of the reduce function is the initial value of the accumulator
           parameter, which we want as 0. */
        const numAromasAllCategories = categories.reduce(
          (sum, cat) => sum + cat.aromas.length, 0
        );

        /* Keep track of where we are in radians around the wheel. 
           Recall that 0 starts at the rightmost point of the circle. */
        let currentAngleRad = 0;

        categories.forEach((category) => {
            /* Guarantee at least one aroma per category. If the length is 0, force
               there to be 1 aroma. */
            const aromaCount = category.aromas.length || 1;

            /* Get the proportion of aromas for this category to the number of aromas
               across all categories and multiply by the number of radians in a circle
               to get the number of radians to use for the category we're on. */
            const catProportion = aromaCount / numAromasAllCategories;
            const catAngleRad = numRadiansCircle * catProportion;

            /* Apply a gap on both sides of the category arc. */
            const catStartAngleRad = currentAngleRad + gapAngleRad / 2;
            const catEndAngleRad = currentAngleRad + catAngleRad - gapAngleRad / 2;

            /* Save category arc. */
            innerArcs.push({ category, startAngle: catStartAngleRad, endAngle: catEndAngleRad });

            /* Get the number of radians per aroma arc needed for this category. */
            const aromaAngleRad = (catEndAngleRad - catStartAngleRad) / aromaCount;

            /* Set up and save the aroma arcs. Notice that we do not explicitly account for a gap
               even though you will see one because the "gap" for the aroma arcs is created with 
               strokes. */
            category.aromas.forEach((aroma, i) => {
                const aromaStartAngleRad = catStartAngleRad + i * aromaAngleRad;
                const aromaEndAngleRad = aromaStartAngleRad + aromaAngleRad;

                outerArcs.push({ category, aroma, startAngle: aromaStartAngleRad, endAngle: aromaEndAngleRad });
            });

            /* Advance to the start angle in radians of the next category. */
            currentAngleRad += catAngleRad;
        });
        
        return { categoryArcs: innerArcs, aromaArcs: outerArcs };
    }, [data, gapAngleRad]);

    /* Set up memoized factory functions that produce the expensive arc-drawing functions. Again, this is
       derived data, and it depends only on the inner and outer radii of the arcs we want to draw. */

    const categoryArc = useMemo(
        () =>
            d3.arc<CategoryArc>()
              .innerRadius(categoryInnerRadius)
              .outerRadius(categoryOuterRadius)
              .startAngle(d => d.startAngle)
              .endAngle(d => d.endAngle),
            [categoryInnerRadius, categoryOuterRadius]
    );

    const aromaArc = useMemo(
      () =>
          d3.arc<AromaArc>()
            .innerRadius(aromaInnerRadius)
            .outerRadius(aromaOuterRadius)
            .startAngle(d => d.startAngle)
            .endAngle(d => d.endAngle),
          [aromaInnerRadius, aromaOuterRadius]
    );

    /* Interaction handles. useCallback is like useMemo for functions 
       rather than values. It tells React to use the same function
       instance between renders unless one of the dependencies in
       the dependency array changes. */

    const handleAromaArcMouseEnter = useCallback(
        (arc: AromaArc) => {
            /* debugging */
            // console.log("HANDLE HOVER CALLED", { 
            //     interactive, 
            //     hasHoverCallback: !!onAromaHoverChange, 
            //     aroma: arc.aroma.id, 
            //     category: arc.category.id, 
            // });

            /* false negative for coverage */
            //console.log("HANDLE AROMA ARC MOUSE ENTER INTERACTIVE CHECK RAN");
            if (!interactive) return;

            setHoveredAromaId(arc.aroma.id);
            setHoveredCategoryId(arc.category.id);
            onAromaHoverChange?.(arc.aroma, arc.category);
        },
        [interactive, onAromaHoverChange]
    );

    const handleAromaArcMouseLeave = useCallback(
        () => {
            /* false negative for coverage */
            //console.log("HANDLE AROMA ARC MOUSE LEAVE INTERACTIVE CHECK RAN");
            if (!interactive) return;

            setHoveredAromaId(null);
            setHoveredCategoryId(null);
            onAromaHoverChange?.(null, null);
        }, 
        [interactive, onAromaHoverChange]
    );

    const handleCategoryArcMouseEnter = useCallback(
        (arc: CategoryArc) => {
            /* false negative for coverage */
            //console.log("HANDLE CATEGORY ARC MOUSE ENTER INTERACTIVE CHECK RAN");
            if (!interactive) return;

            setHoveredCategoryId(arc.category.id);
            onCategoryHoverChange?.(arc.category);
        },
        [interactive, onCategoryHoverChange]
    );

    const handleCategoryArcMouseLeave = useCallback(
        () => {
            /* false negative for coverage */
            //console.log("HANDLE CATEGORY ARC MOUSE LEAVE INTERACTIVE CHECK RAN");
            if (!interactive) return;

            setHoveredCategoryId(null);
            onCategoryHoverChange?.(null);
        }, 
        [interactive, onCategoryHoverChange]
    );

    const handleAromaArcClick = useCallback(
        (arc: AromaArc) => {
            /* false negative for coverage */
            //console.log("HANDLE AROMA ARC CLICK INTERACTIVE CHECK RAN");
            if (!interactive) return;

            onFocusedAromaIdChange?.(arc.aroma.id);
            onAromaClick?.(arc.aroma, arc.category);
        },
        [interactive, onFocusedAromaIdChange, onAromaClick]
    );

    const handleCategoryArcClick = useCallback(
        (arc: CategoryArc) => {
            /* false negative for coverage */
            //console.log("HANDLE CATEGORY ARC CLICK INTERACTIVE CHECK RAN");
            if (!interactive) return;

            onCategoryClick?.(arc.category);
        },
        [interactive, onCategoryClick]
    );

    /* Note that we can't derive the focused aroma arc from the parameters of the 
       function passed to useCallback because it will remain the same as it was
       when the event listener was originally attached. Instead, derive the
       focused aroma arc from state. */
    const handleAromaKeyDown = useCallback(
        (event: KeyboardEvent) => {
            /* false negative for coverage */
            //console.log("HANDLE AROMA KEY DOWN INTERACTIVE CHECK RAN");
            if (!interactive) return;

            const focusedAromaArc = aromaArcs.find( 
                aromaArc => aromaArc.aroma.id === focusedAromaId
            ); 
            if (!focusedAromaArc) return;

            /* Save key that was pressed. */
            const { key } = event;

            /* Enter and space are equivalent to clicking an aroma arc. */
            if (key === 'Enter' || key === ' ') {
                /* Prevent page from scrolling. */
                event.preventDefault();

                onAromaClick?.(focusedAromaArc.aroma, focusedAromaArc.category);

                return;
            }

            /* Right and left arrows are equivalent to clicking the next or
               previous aroma arc relative to the one the user is currently
               focused on. */
            if (key === 'ArrowRight' || key === 'ArrowLeft') {
                event.preventDefault();

                /* Find the index of the aroma we are currently focused on in
                   the array of all aroma arcs. If no aroma is focused, exit
                   since we have no basis for moving to the previous or next one. */
                const focusedArcIdx = aromaArcs.findIndex(
                    aromaArc => {
                        return (
                            (aromaArc.aroma.id === focusedAromaArc.aroma.id) && 
                            (aromaArc.category.id === focusedAromaArc.category.id)
                        );
                    }
                );
                /* false negative for coverage */
                //console.log("FOCUSED ARC IDX CHECK RAN");
                if (focusedArcIdx === -1) return;

                /* Right arrow will move clockwise; left will move counterclockwise. */
                const delta = key === 'ArrowRight' ? 1 : -1;
                
                let nextIdx = focusedArcIdx + delta;

                /* If we are on the first aroma, move to the last one. */
                if (nextIdx < 0) {
                    nextIdx = aromaArcs.length - 1;
                }
                /* If you're on the last aroma, move to the first one. */
                else if (nextIdx >= aromaArcs.length) {
                    nextIdx = 0;
                }

                const nextArc = aromaArcs[nextIdx];

                onFocusedAromaIdChange?.(nextArc.aroma.id);
                onAromaClick?.(nextArc.aroma, nextArc.category); 
                setHoveredAromaId(nextArc.aroma.id);
                setHoveredCategoryId(nextArc.category.id);
                
                onAromaHoverChange?.(nextArc.aroma, nextArc.category);
            }
        },
        [interactive, focusedAromaId, onFocusedAromaIdChange, aromaArcs, onAromaClick, onAromaHoverChange]
    );

    function startRotating(direction: 1 | -1) {
        /* If the ref is not null, the wheel must be actively rotating. */
        if (rotateIntervalRef.current !== null) return;

        /* Every rotation of the wheel causes the text to blur. So, 
           larger numbers will allow less precision for turning the wheel
           to certain aromas, but they will reduce the number of
           clicks needed. This will reduce the number of times the 
           text is blurred and decrease the likelihood of motion sickness.  */
        rotateIntervalRef.current = window.setInterval(() => {
            setRotationDeg(r => r + direction * 6);
        }, 50); 
    }

    function stopRotating() {
        if (rotateIntervalRef.current !== null) {
            clearInterval(rotateIntervalRef.current);
            rotateIntervalRef.current = null;

            /* Restore focus to the aroma arc if it was focused before the user 
               started rotating the wheel. */
            if (focusedAromaId) {
                const el = aromaArcPathRefs.current[focusedAromaId];
                el?.focus();
            }
        }
    }

    const categorySegments = 
        categoryArcs.map((arc) => {
            const path = categoryArc(arc);

            /* false negative for coverage */
            //console.log("CATEGORY SEGMENTS PATH CHECK RAN");
            if (!path) return null;

            /* If the category is being hovered, determine a stroke color and increase the
                width of the stroke. */
            const isHovered = hoveredCategoryId === arc.category.id;
            const stroke = isHovered ? getStrokeColor(arc.category.color) : 'none';
            const strokeWidth = isHovered ? 2 : 1;

            return (
                <path
                    key={`category-arc-path-${arc.category.id}`}
                    data-testid={`category-arc-path-${arc.category.id}`}
                    d={path}
                    fill={arc.category.color}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    cursor={interactive ? 'pointer' : 'default'}
                    onMouseEnter={interactive ? () => handleCategoryArcMouseEnter(arc) : undefined}
                    onMouseLeave={interactive ? handleCategoryArcMouseLeave : undefined}
                    onClick={interactive ? () => handleCategoryArcClick(arc) : undefined}
                />
            );
      });

    const aromaSegments = 
        aromaArcs.map((arc) => {
            const path = aromaArc(arc);

            /* false negative for coverage */
            //console.log("AROMA SEGMENTS PATH CHECK RAN");
            if (!path) return null;

            /* See comment on categories explaining how this works. */
            const midAngle = (arc.startAngle + arc.endAngle) / 2;
            const midAngleDeg = (midAngle * 180) / Math.PI;
            const rotationDeg = midAngleDeg - 90;
            
            const isHovered = hoveredAromaId === arc.aroma.id;
            const isFocused = focusedAromaId === arc.aroma.id;

            /* Use aroma color if it was specified. Otherwise, fallback to
               category color. Then alter the color slightly to give the wheel
               some depth. */
            const baseColor = arc.aroma.color || arc.category.color;
            const fill = getAromaColor(baseColor);

            const rotationRad = (rotationDeg * Math.PI) / 180;
            /* Get vectors for horizontal (dx) and vertical (dy) popout movements on hover by
               converting angles in radians. Math.cos and Math.sin give us the direction of the 
               movement and popoutDistance gives us the distance. */
            const dx = interactive && isHovered ? aromaArcPopoutDistance * Math.cos(rotationRad) : 0;
            const dy = interactive && isHovered ? aromaArcPopoutDistance * Math.sin(rotationRad) : 0;

            const strokeColor = isFocused ? getFocusColor(baseColor) : 'white';
            const strokeWidth = isFocused ? 2 : 0.5;

            /* debugging */
            // console.log( "ARC RENDER:", 
            //     "arc id:", arc.aroma.id, 
            //     "interactive:", interactive, 
            //     "onAromaClick exists:", !!onAromaClick, 
            //     "onAromaHoverChange exists:", !!onAromaHoverChange 
            // );

            /* React supports three ways to assign refs:
                   
                   1. Object refs (ref={someRef})
                   2. Forwarded refs (ref={forwardRef(...)})
                   3. Callback refs (ref={el => { ... }})
                   
                Below, we use a callback ref on each aroma arc <path> element. This lets us
                dynamically store a reference to every arc DOM node in a lookup table.

                The key is the aroma ID (a string), and the value is the actual SVGPathElement.
                After all aroma arcs mount, the structure will look like:
               
                    aromaRefs.current = {
                        "citrus": SVGPathElement,
                        "floral": SVGPathElement,
                        "honey": SVGPathElement,
                        ...
                    }

               This will allow us to refocus on the aroma arc immediately (using focusedAromaId) if 
               the user clicks the rotate button to rotate the aroma wheel. 

               aromaArcPathRefs is the container that React keeps stable across renders and 
               aromaArcPathRefs.current is the value stored in that container. The latter can be mutated 
               freely without triggering re-renders.
            */
            return (
                <g
                    key={`aroma-arc-g-${arc.category.id}-${arc.aroma.id}`} 
                    transform={`translate(${dx}, ${dy})`}
                    style={interactive ? { transition: 'transform 180ms ease-out' } : undefined}
                >
                    <path
                        data-testid={`aroma-arc-path-${arc.category.id}-${arc.aroma.id}`}
                        ref={el => { aromaArcPathRefs.current[arc.aroma.id] = el }}
                        className="aroma-arc-path"
                        d={path}
                        fill={fill}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        cursor={interactive ? 'pointer' : 'default'}
                        onMouseEnter={interactive ? () => handleAromaArcMouseEnter(arc) : undefined}
                        onMouseLeave={interactive ? handleAromaArcMouseLeave : undefined}
                        onClick={interactive ? () => handleAromaArcClick(arc) : undefined}
                        tabIndex={interactive ? 0 : -1}
                        role={interactive ? 'button' : undefined}
                        aria-label={`${arc.aroma.name} aroma`}
                        onKeyDown={interactive ? (e) => handleAromaKeyDown(e) : undefined}
                    />

                    {(() => {
                        const [x, y] = aromaArc.centroid(arc);

                        /* false negative for coverage */
                        //console.log("AROMA SEGMENTS CENTROID CHECK RAN");
                        /* Don't render a label if the arc is invalid. x and y may be NaNs if, for example,
                           we try to render a category with no aromas (happens during testing)/ */
                        if (!Number.isFinite(x) || !Number.isFinite(y)) { 
                            return null;
                        }

                        return (
                            <text
                                data-testid={`aroma-label-text-${arc.category.id}-${arc.aroma.id}`}
                                x={x}
                                y={y}
                                fill="#222"
                                fontSize={10}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${rotationDeg}, ${x}, ${y})`}
                                pointerEvents="none"
                            >
                                {arc.aroma.name}
                            </text>
                        );
                    })()}
                </g>
            );
        });

    const categoryLabels = 
        categoryArcs.map((arc) => {
            /* Ask d3 for the horizontal (x) and vertical (y) coordinate of the
               category arc's center. */
            const [x, y] = categoryArc.centroid(arc);

            /* Don't render a label if the arc is invalid. x and y may be NaNs if, for example,
                we try to render a category when none is provided. */
            if (!Number.isFinite(x) || !Number.isFinite(y)) { 
                return null;
            }

            const midAngle = (arc.startAngle + arc.endAngle) / 2;
            /* d3 works in radians. We need to convert to degrees to work with the
               transform. */
            const midAngleDeg = (midAngle * 180) / Math.PI;

            /* Make text radial (pointing outward from the center of the wheel 
               to the edge). d3 uses the standard unit circle in
               mathematics. Recall that
                   
                   east --> 0 (or 360) degrees
                   north --> 90 degrees
                   west --> 180 degrees
                   south --> 270 degrees
                   
               For SVG rotation, rotating by 0 degrees would cause the text to appear 
               at (x, y), perpendicular to the arc. -90 will rotate the text at 
               (x, y) in the counterclockwise direction 90 degrees. If we did +90, the
               text would be rotated at (x, y) in the clockwise direction at 90 degrees,
               giving us the opposite effect of the one we're aiming for.
            */
            const rotationDeg = midAngleDeg - 90;

            /* Since our component uses an SVG image, use the <text> 
               SVG element over something like <p>. This will make
               it much easier to position, rotate, align, and scale
               the labels. 
               
               textAnchor="middle" centers the text horizontally at (x, y)
               dominantBaseline="middle" centers the text vertically at (x, y)
            */
            return (
                <text
                    data-testid={`category-label-text-${arc.category.id}`}
                    key={`${arc.category.id}-CategoryLabel`}
                    x={x}
                    y={y}
                    fill="black"
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rotationDeg}, ${x}, ${y})`}
                    pointerEvents="none"
                >
                    {arc.category.name}
                </text>
            );
        });

    const clockwiseBtn = 
        <TouchButton
            data-testid="rotate-clockwise-btn"
            buttonClassName="btn rectangle-btn-border tooltip px-4 py-2"
            buttonTip="Rotate clockwise"
            onMouseDown={() => startRotating(1)} 
            onMouseUp={stopRotating} 
            onMouseLeave={stopRotating} 
            onTouchStart={() => startRotating(1)} 
            onTouchEnd={stopRotating}
        >
            <span className="sr-only">Rotate clockwise</span>
            <RotateRight className="rotate-[-50deg]"/>
        </TouchButton>;

    const counterclockwiseBtn = 
        <TouchButton
            data-testid="rotate-counterclockwise-btn"
            buttonClassName="btn rectangle-btn-border tooltip ml-[5px] px-4 py-2"
            buttonTip="Rotate counterclockwise"
            onMouseDown={() => startRotating(-1)} 
            onMouseUp={stopRotating} 
            onMouseLeave={stopRotating} 
            onTouchStart={() => startRotating(-1)} 
            onTouchEnd={stopRotating}
        >
            <span className="sr-only">Rotate counterclockwise</span>
            <RotateLeft className="rotate-[50deg]"/>
        </TouchButton>;

    /* There is a lot happening in AromaWheel, so we assign it the region role and 
       "Aroma wheel" description for  accessibility. Screen readers will have a named area 
       they can jump directly to and the user will know the controls are related.
 
       The padding on the parent div is needed so the aroma arcs don't get cut off when
       they pop out of the wheel. */
    return (
        <div 
            role="region"
            aria-roledescription="Aroma wheel"
            style={{ 
                position: "relative", 
                width: size,
                height: size,
                padding: "20px"
            }}
        >
            <svg
                className={className}
                style={{ width: '100%', height: '100%', ...style }}
                viewBox={`0 0 ${size} ${size}`}
                // Causes accessibility warning
                // role="img"
                aria-label="Tea aroma wheel"
            >
                <g 
                    data-testid="aroma-wheel-rotation-group"
                    className="transition-transform duration-[120ms] ease-linear"
                    transform={`translate(${size / 2}, ${size / 2}) rotate(${rotationDeg})`} 
                >
                    {categorySegments}
                    {aromaSegments}
                    {categoryLabels}
                </g>
            </svg>

            <div className="absolute bottom-2.5 left-2.5 flex gap-0">
                {clockwiseBtn}
                {counterclockwiseBtn}
            </div>

        </div>
    );

};
