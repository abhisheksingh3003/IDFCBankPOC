import React from 'react';
import { motion } from 'framer-motion';

interface AIVoiceOrbProps {
    isActive: boolean;
}

const AIVoiceOrb: React.FC<AIVoiceOrbProps> = ({ isActive }) => {
    // Animation variants for the circles
    const circleVariants = {
        animate: (i: number) => ({
            rotate: i % 2 === 0 ? 360 : -360,
            scale: isActive ? [1, 1.1, 1] : [1, 1.02, 1],
            borderRadius: [
                "55%",
                "45% 55% 50% 50%",
                "55%"
            ],
            transition: {
                rotate: {
                    repeat: Infinity,
                    duration: isActive ? 4 : 8,
                    ease: "linear"
                },
                scale: {
                    repeat: Infinity,
                    duration: isActive ? 1.5 : 3,
                    ease: "easeInOut"
                },
                borderRadius: {
                    repeat: Infinity,
                    duration: isActive ? 2 : 4,
                    ease: "easeInOut"
                }
            }
        })
    };

    const colorRed = "235, 0, 27";    // Mastercard Red (#EB001B)
    const colorOrange = "255, 95, 0"; // Mastercard Orange (#FF5F00)
    const colorYellow = "247, 158, 27"; // Mastercard Yellow (#F79E1B)

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-transparent">
            {/* Background Glow - Dynamic based on active state */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.4, 1] : 1.1,
                    opacity: isActive ? 0.3 : 0.1,
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                }}
                className="absolute inset-x-[-20%] inset-y-[-20%] mc-gradient rounded-full blur-[60px] opacity-20"
            />

            {/* Main Animated Orb Body */}
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center">
                {/* Outer Ring 1: Red */}
                <motion.div
                    custom={0}
                    variants={circleVariants}
                    animate="animate"
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle, rgba(0,0,0,0) 65%, rgba(${colorRed}, 1) 73%, rgba(${colorRed}, 1) 100%)`,
                        boxShadow: `0 0 30px 5px rgba(${colorRed}, 0.2)`,
                    }}
                />

                {/* Outer Ring 2: Orange (Offset Rotation) */}
                <motion.div
                    custom={1}
                    variants={circleVariants}
                    animate="animate"
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle, rgba(0,0,0,0) 65%, rgba(${colorOrange}, 1) 73%, rgba(${colorOrange}, 1) 100%)`,
                        boxShadow: `0 0 30px 5px rgba(${colorOrange}, 0.2)`,
                        opacity: 0.8
                    }}
                />

                {/* Outer Ring 3: Yellow (Fast Rotation) */}
                <motion.div
                    custom={2}
                    variants={circleVariants}
                    animate="animate"
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle, rgba(0,0,0,0) 70%, rgba(${colorYellow}, 1) 75%, rgba(${colorYellow}, 1) 100%)`,
                        boxShadow: `0 0 20px 5px rgba(${colorYellow}, 0.3)`,
                        opacity: 0.6
                    }}
                />


            </div>
        </div>
    );
};

export default AIVoiceOrb;

