import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function WavePoints() {
  const pointsRef = useRef();
  
  // Create a grid of points
  const count = 50;
  const sep = 0.2;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * count * 3);
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const i = (x * count + z) * 3;
        pos[i] = (x - count / 2) * sep;
        pos[i + 1] = 0;
        pos[i + 2] = (z - count / 2) * sep;
      }
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array;
    
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const i = (x * count + z) * 3;
        // Create wave animation
        const xPos = pos[i];
        const zPos = pos[i + 2];
        pos[i + 1] = Math.sin(xPos * 1.5 + time) * 0.5 + Math.cos(zPos * 1.5 + time) * 0.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#0ea5e9" /* Sky Blue */
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingCore() {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1}>
      <mesh>
        <icosahedronGeometry args={[1, 15]} />
        <meshStandardMaterial 
          color="#ff8c00" /* Orange */
          emissive="#ff8c00" 
          emissiveIntensity={3} 
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#0ea5e9" />
        <WavePoints />
        <FloatingCore />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
