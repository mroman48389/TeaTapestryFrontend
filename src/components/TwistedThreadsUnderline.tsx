import { ComponentProps } from "react";
import { motion } from "motion/react";

import { generateContinuousWavePath } from '@/utils/svg-utils';
import { APP_COLORS } from "@/constants/app";

export const LEAF_WIDTH = 22;

type TwistedThreadsUnderlineProps = {
    width: number;
} & ComponentProps<typeof motion.svg>;

export default function TwistedThreadsUnderline(props: TwistedThreadsUnderlineProps) {
    const { width, ...rest } = props;

    /* Controls the height of the waves. */
    const amplitude = 5;
    /* Length of one wave from y = 0, x = a to y = 0, x = b, where a and b are
       consecutive moments where the wave crosses y = 0. */
    const wavelength = 50; 

    const topPath = generateContinuousWavePath(width, amplitude, wavelength);
    const bottomPath = generateContinuousWavePath(width, -amplitude, wavelength);

    /* Generate a unique gradient ID for the SVG instance below. This prevents ID collisions when multiple 
       TwistedThreadsUnderline components are rendered on the same page. SVG gradients are referenced by ID 
       (e.g., fill="url(#leafGradient-xyz)") and must be defined within the same <svg>. If multiple components 
       reuse the same static ID, the browser may fail to resolve the gradient correctly. Using a random suffix 
       ensures each gradient is scoped and resolved properly. */
    const gradientId = `leafGradient-${Math.random().toString(36).slice(2, 11)}`;

    return (
        <div data-testid="twisted-threads-underline" className="twisted-threads-underline">
            <motion.svg
                width={width + LEAF_WIDTH}
                height="20"
                aria-hidden="true"
                viewBox={`0 0 ${width + LEAF_WIDTH} 20`}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: { pathLength: 1, opacity: 1 }
                }}
                transition={{ duration: 1.5 }}
                preserveAspectRatio="xMinYMin meet"
                {...rest}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={APP_COLORS.DUANNI_YELLOW} />
                        <stop offset="100%" stopColor={APP_COLORS.ZISHA_BROWN} />
                    </linearGradient>
                </defs>

                {/* Top thread */}
                <motion.path
                    d={topPath}
                    stroke={APP_COLORS.DUANNI_YELLOW}
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                />

                {/* Bottom thread */}
                <motion.path
                    d={bottomPath}
                    stroke={APP_COLORS.ZISHA_BROWN}
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                />

                {/* Leaf */}
                <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.7 }}
                >
                    {/* Outer shape */}
                    <path
                        d={`
                            M${width + LEAF_WIDTH},10
                            C${width + LEAF_WIDTH - 12},4 ${width + LEAF_WIDTH - 20},4 ${width + LEAF_WIDTH - 22},10
                            C${width + LEAF_WIDTH - 20},16 ${width + LEAF_WIDTH - 12},16 ${width + LEAF_WIDTH},10
                            Z
                        `}
                        fill={`url(#${gradientId})`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="1"
                    />

                    {/* Center vein */}
                    <path
                        d={`M${width + LEAF_WIDTH - 22},10 L${width + LEAF_WIDTH},10`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="0.5"
                        opacity="0.6"
                    />

                    {/* Side veins */}
                    <path
                        d={`M${width + LEAF_WIDTH - 16},10 L${width + LEAF_WIDTH - 14},7`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="0.4"
                        opacity="0.5"
                    />

                    <path
                        d={`M${width + LEAF_WIDTH - 16},10 L${width + LEAF_WIDTH - 14},13`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="0.4"
                        opacity="0.5"
                    />

                    <path
                        d={`M${width + LEAF_WIDTH - 10},10 L${width + LEAF_WIDTH - 8},7`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="0.4"
                        opacity="0.5"
                    />

                    <path
                        d={`M${width + LEAF_WIDTH - 10},10 L${width + LEAF_WIDTH - 8},13`}
                        stroke={APP_COLORS.ZISHA_BROWN}
                        strokeWidth="0.4"
                        opacity="0.5"
                    />
                </motion.g>
            </motion.svg>
        </div>
    );
}
