import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

interface AnaisAvatarProps {
  src: string;
  variant?: 'oracle' | 'vessel';
}

export const AnaisAvatar: React.FC<AnaisAvatarProps> = ({ src, variant = 'oracle' }) => {
  const driftControls = useAnimation();

  // Subtle neural drift/glance logic
  useEffect(() => {
    let isMounted = true;
    const animateDrift = async () => {
      if (!isMounted) return;

      const driftX = (Math.random() - 0.5) * 6; // Shift -3px to 3px
      const driftY = (Math.random() - 0.5) * 4; // Shift -2px to 2px
      const driftRotate = (Math.random() - 0.5) * 1.5; // -0.75deg to 0.75deg

      await driftControls.start({
        x: driftX,
        y: driftY,
        rotate: driftRotate,
        transition: { duration: 3, ease: "easeInOut" }
      });

      if (isMounted) {
        window.setTimeout(animateDrift, Math.random() * 2000 + 1000);
      }
    };

    animateDrift();
    return () => { isMounted = false; };
  }, [driftControls]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Root Movement Layer: Slow Breathing Pulse */}
      <motion.div
        className="w-full h-full relative"
        animate={{
          scale: [1.1, 1.12, 1.1],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Detail Movement Layer: Neural Shifting */}
        <motion.img
          src={src}
          alt="Anais Avatar"
          referrerPolicy="no-referrer"
          animate={driftControls}
          /* 
             Increasing contrast and slightly lowering brightness deepens blacks (hair) 
             while maintaining the retro grayscale terminal look.
          */
          className={`w-full h-full object-cover transition-all duration-700 opacity-80 mix-blend-screen ${
            variant === 'oracle' 
              ? 'grayscale contrast-150 brightness-50 sepia-[0.3] hue-rotate-[240deg]' // Purplish spectral ink
              : 'grayscale contrast-125 brightness-75 sepia-[0.1] hue-rotate-[90deg]'  // System-green biological
          }`}
        />
      </motion.div>
      
      {/* Scanline Effect Overlay - Varied intensity */}
      <div className={`scanline absolute inset-0 z-10 pointer-events-none ${
        variant === 'oracle' ? 'opacity-40' : 'opacity-20'
      }`}></div>
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
};
