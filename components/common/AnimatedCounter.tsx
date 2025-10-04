import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value }: { value: number }) => {
    // Initialize with the target value to prevent a 0-to-value jump on first render
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const startValue = displayValue;
        const endValue = value;
        const duration = 800; // Animation duration in ms
        let startTime: number | null = null;

        const animationStep = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Ease-out cubic function for a smooth deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const newDisplayValue = startValue + (endValue - startValue) * easedProgress;
            setDisplayValue(newDisplayValue);

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                // Ensure the final value is precise
                setDisplayValue(endValue);
            }
        };

        // Only start the animation if the target value is different
        if (displayValue !== endValue) {
            requestAnimationFrame(animationStep);
        }

    }, [value]); // Rerun the effect when the target value prop changes

    return <span>{displayValue.toFixed(2)}</span>;
};

export default AnimatedCounter;
