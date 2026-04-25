import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './Cursor.css';

export default function Cursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Different spring configs for layered lag
  const springFast = { damping: 20, stiffness: 300 };
  const springMed = { damping: 25, stiffness: 150 };
  const springSlow = { damping: 30, stiffness: 80 };

  const cursorX = useSpring(mouseX, springFast);
  const cursorY = useSpring(mouseY, springFast);
  
  const ringX = useSpring(mouseX, springMed);
  const ringY = useSpring(mouseY, springMed);
  
  const trailX = useSpring(mouseX, springSlow);
  const trailY = useSpring(mouseY, springSlow);

  // Calculate tilt based on distance between layers
  const rotateX = useTransform(cursorY, (y) => (y - ringY.get()) * 5);
  const rotateY = useTransform(cursorX, (x) => (x - ringX.get()) * -5);

  useEffect(() => {
    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      document.body.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      document.body.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('card') ||
        target.closest('.card') ||
        target.closest('.magnetic-wrap')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY, ringX, ringY]);

  return (
    <div className="cursor-system">
      {/* 3D ROTATING RING */}
      <motion.div
        className={`cursor-ring-3d ${isHovering ? 'hovering' : ''}`}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          rotateX,
          rotateY,
          perspective: 1000
        }}
      >
        <div className="ring-layer ring-layer--1"></div>
        <div className="ring-layer ring-layer--2"></div>
      </motion.div>

      {/* DELAYED TRAIL RING */}
      <motion.div
        className="cursor-trail"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? 2 : 1
        }}
      />

      {/* CORE DOT */}
      <motion.div
        className="cursor-dot-core"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          scale: isClicking ? 0.5 : 1
        }}
      />
    </div>
  );
}
