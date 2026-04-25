import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function PerspectiveSection({ children }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <div ref={container} style={{ perspective: "1500px", zIndex: 1, position: 'relative' }}>
      {/* SCANNER LINE */}
      <motion.div 
        style={{ opacity: scrollYProgress }}
        className="scanner-line animate-scan"
        key={Math.floor(scrollYProgress * 10)}
      />

      <motion.div
        style={{
          rotateX,
          opacity,
          scale,
          transformStyle: "preserve-3d"
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
