import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './SpotlightCard.css';

export default function SpotlightCard({ children, className = "" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`spotlight-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="spotlight-pointer"
        style={{
          background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.15), transparent 40%)`,
        }}
      />
      <motion.div
        className="spotlight-hologram"
        style={{
          background: `radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.05), rgba(79, 70, 229, 0.05), rgba(236, 72, 153, 0.05), transparent 60%)`,
          mixBlendMode: 'plus-lighter'
        }}
      />
      <div className="spotlight-content">
        {children}
      </div>
    </div>
  );
}
