export function generateContinuousWavePath(width: number, amplitude: number, wavelength: number) {
    const points = [];
    const step = 2;

    for (let x = 0; x <= width; x += step) {
        const y = 10 + amplitude * Math.sin((2 * Math.PI * x) / wavelength);
        points.push(`${x},${y}`);
    }

    /* Last point of the wave. */
    const endX = width;
    const endY = 10 + amplitude * Math.sin((2 * Math.PI * width) / wavelength);

    /* Smooth transition length. Slightly longer for gentler curvature. */
    const smooth = 10; 

    /* (C)ontrol (p)oints for Bezier curve. Control point 1 is the crest and control point 2 is the trough. */
    const cp1X = endX + smooth * 0.25;
    const cp1Y = endY; // match tangent direction

    const cp2X = endX + smooth * 0.75;
    const cp2Y = 10; // pull toward baseline

    /* Final leaf anchor point. */
    const leafX = endX + smooth;
    const leafY = 10;

    /* M= (M)ove to x = 0, y = 10. */
    return `
        M0,10 
        L${points.join(" ")}
        C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${leafX},${leafY}
    `;
}
