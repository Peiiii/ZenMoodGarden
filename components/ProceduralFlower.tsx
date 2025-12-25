
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerType } from '../types';

interface ProceduralFlowerProps {
  id: string;
  type: FlowerType;
  position: [number, number, number];
  color: string;
  scale: number;
  rotation: number;
  windSpeed: number;
  heightMultiplier: number;
  growth: number;
  hydration: number;
  nutrients: number;
  onClick: (e: any) => void;
}

const ProceduralFlower: React.FC<ProceduralFlowerProps> = ({
  type,
  position,
  color,
  scale,
  rotation,
  windSpeed,
  heightMultiplier,
  growth,
  hydration,
  nutrients,
  onClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const stemRef = useRef<THREE.Mesh>(null);

  // Growth Phases:
  // 0.0 -> 0.6: Stem growth
  // 0.4 -> 0.8: Leaf unfurling
  // 0.6 -> 1.0: Flower head blooming
  
  const stemGrowth = Math.min(1, growth / 0.6);
  const leafGrowth = Math.max(0, Math.min(1, (growth - 0.4) / 0.4));
  const bloomGrowth = Math.max(0, Math.min(1, (growth - 0.6) / 0.4));

  // Base Geometries
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(0.015, 0.03, 1, 8), []);
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.1, 0.1, 0.3, 0, 0.4);
    shape.bezierCurveTo(-0.1, 0.3, -0.1, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  // Flower structure logic (same as before but using bloomGrowth)
  const flowerStructure = useMemo(() => {
    const layers = [];
    switch (type) {
      case FlowerType.ROSE:
        for (let l = 0; l < 4; l++) {
          const count = 5 + l * 3;
          for (let i = 0; i < count; i++) {
            layers.push({
              rotation: [Math.PI * 0.15 * (l + 1), (i / count) * Math.PI * 2 + (l * 0.5), 0],
              scale: [0.3 - l * 0.04, 0.4 - l * 0.05, 0.1],
              offset: 0.05 + l * 0.02,
            });
          }
        }
        break;
      case FlowerType.TULIP:
        for (let i = 0; i < 6; i++) {
          layers.push({
            rotation: [Math.PI * 0.1, (i / 6) * Math.PI * 2, 0],
            scale: [0.35, 0.6, 0.1],
            offset: 0.1,
          });
        }
        break;
      case FlowerType.DAISY:
        for (let i = 0; i < 16; i++) {
          layers.push({
            rotation: [Math.PI * 0.45, (i / 16) * Math.PI * 2, 0],
            scale: [0.1, 0.5, 0.02],
            offset: 0.12,
          });
        }
        break;
      case FlowerType.SUNFLOWER:
        for (let i = 0; i < 24; i++) {
          layers.push({
            rotation: [Math.PI * 0.48, (i / 24) * Math.PI * 2, 0],
            scale: [0.15, 0.6, 0.05],
            offset: 0.3,
          });
        }
        break;
      case FlowerType.LOTUS:
        for (let l = 0; l < 3; l++) {
          const count = 8 + l * 4;
          for (let i = 0; i < count; i++) {
            layers.push({
              rotation: [Math.PI * (0.3 + l * 0.1), (i / count) * Math.PI * 2, 0],
              scale: [0.25, 0.7, 0.05],
              offset: 0.1,
            });
          }
        }
        break;
    }
    return layers;
  }, [type]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const currentHeight = scale * heightMultiplier * stemGrowth;
      
      // Wind sway based on current stem height
      const swayStrength = 0.03 * currentHeight;
      const swayX = Math.sin(time * windSpeed * 0.6 + position[0]) * swayStrength;
      const swayZ = Math.cos(time * windSpeed * 0.5 + position[2]) * swayStrength;
      groupRef.current.rotation.x = swayX;
      groupRef.current.rotation.z = swayZ;

      if (headRef.current) {
        // Bloom animation: head expands and pulses
        const pulse = 1 + Math.sin(time * 2) * (0.02 * nutrients * bloomGrowth);
        const finalScale = bloomGrowth * pulse;
        headRef.current.scale.set(finalScale, finalScale, finalScale);
        
        // Tilt the head slightly as it grows
        headRef.current.rotation.x = Math.sin(time * 0.5) * 0.1 * bloomGrowth;
      }
    }
  });

  const stemHeight = scale * heightMultiplier * stemGrowth;

  return (
    <group position={position} rotation={[0, rotation, 0]} ref={groupRef} onClick={onClick}>
      {/* Stem Mesh */}
      <mesh 
        ref={stemRef}
        geometry={stemGeometry} 
        position={[0, stemHeight / 2, 0]} 
        scale={[1, stemHeight, 1]}
      >
        <meshStandardMaterial color={hydration > 0.4 ? "#3a5a40" : "#6d6d4a"} />
      </mesh>

      {/* Leaves - Appear as stem reaches mid-height */}
      {[0.3, 0.6].map((h, i) => (
        <mesh 
          key={i} 
          geometry={leafGeometry} 
          position={[0, stemHeight * h, 0]} 
          rotation={[Math.PI * 0.4, i * Math.PI * 0.8, 0.2]}
          scale={[leafGrowth, leafGrowth, leafGrowth]}
          visible={growth > 0.3}
        >
          <meshStandardMaterial color="#4f772d" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Flower Head - Starts blooming after stem is significantly grown */}
      <group position={[0, stemHeight, 0]} ref={headRef}>
        {/* Petal Layers */}
        {flowerStructure.map((p, i) => (
          <group key={i} rotation={p.rotation}>
            <mesh position={[0, p.offset, 0]} scale={p.scale}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.2 + nutrients * 0.3}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}

        {/* Pistil / Center */}
        <mesh scale={type === FlowerType.SUNFLOWER ? 2.5 : 1}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial 
            color={type === FlowerType.SUNFLOWER ? "#3d2b1f" : "#ffcc00"} 
            roughness={0.9}
          />
        </mesh>

        {type === FlowerType.SUNFLOWER && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <circleGeometry args={[0.25, 12]} />
            <meshStandardMaterial color="#2d1e14" />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default ProceduralFlower;
