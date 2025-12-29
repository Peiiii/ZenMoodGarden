
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

  // 阶段化生长曲线
  const stemGrowth = Math.min(1, growth / 0.5); 
  const leafGrowth = Math.max(0, Math.min(1, (growth - 0.25) / 0.45)); 
  const bloomGrowth = Math.max(0, Math.min(1, (growth - 0.6) / 0.4));

  // 1. 根据种类生成叶片几何体 (Shape-based)
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    switch (type) {
      case FlowerType.SUNFLOWER:
        // 阔心形叶
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.4, 0.1, 0.5, 0.6, 0, 0.8);
        shape.bezierCurveTo(-0.5, 0.6, -0.4, 0.1, 0, 0);
        break;
      case FlowerType.TULIP:
        // 狭长披针形叶
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.15, 0.5, 0, 1.2);
        shape.quadraticCurveTo(-0.15, 0.5, 0, 0);
        break;
      case FlowerType.ROSE:
        // 锯齿感卵形叶
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.2, 0.05, 0.3, 0.3, 0, 0.55);
        shape.bezierCurveTo(-0.3, 0.3, -0.2, 0.05, 0, 0);
        break;
      case FlowerType.LOTUS:
        // 盾形圆叶
        shape.absarc(0, 0, 0.6, 0, Math.PI * 2, false);
        break;
      default:
        // 基础椭圆小叶 (雏菊)
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.15, 0.2, 0, 0.4);
        shape.quadraticCurveTo(-0.15, 0.2, 0, 0);
    }
    return new THREE.ShapeGeometry(shape);
  }, [type]);

  // 2. 生成叶片排列数据 (Phyllotaxis)
  const leavesData = useMemo(() => {
    const data = [];
    let count = 2;
    let arrangement: 'alternate' | 'opposite' | 'basal' = 'alternate';
    let baseScale = 0.3;

    switch (type) {
      case FlowerType.SUNFLOWER:
        count = 6; arrangement = 'alternate'; baseScale = 0.6;
        break;
      case FlowerType.TULIP:
        count = 2; arrangement = 'basal'; baseScale = 0.8;
        break;
      case FlowerType.ROSE:
        // Fix: Use 'opposite' arrangement to prevent TypeScript narrowing error in the loop comparison
        count = 8; arrangement = 'opposite'; baseScale = 0.4;
        break;
      case FlowerType.LOTUS:
        count = 2; arrangement = 'alternate'; baseScale = 1.2;
        break;
      case FlowerType.DAISY:
        count = 4; arrangement = 'basal'; baseScale = 0.35;
        break;
    }

    for (let i = 0; i < count; i++) {
      let h, angle, rotX;
      if (arrangement === 'basal') {
        h = 0.05 + i * 0.02; // 集中在底部
        angle = (i / count) * Math.PI * 2 + Math.random();
        rotX = Math.PI * 0.4;
      } else if (arrangement === 'opposite') {
        h = 0.2 + (Math.floor(i/2) * 0.2);
        angle = (i % 2) * Math.PI + (Math.floor(i/2) * 0.5);
        rotX = Math.PI * 0.35;
      } else {
        // 互生 (Alternate)
        h = 0.15 + (i / count) * 0.6;
        angle = i * 2.4; // 黄金角度近似
        rotX = Math.PI * 0.3 + (Math.random() * 0.2);
      }

      data.push({
        h, 
        angle, 
        rotX,
        s: baseScale * (1 - (h * 0.5)) // 越往上叶子越小
      });
    }
    return data;
  }, [type]);

  // 3. 生成花瓣数据
  const petalData = useMemo(() => {
    const petals = [];
    switch (type) {
      case FlowerType.ROSE:
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const angle = i * 2.399; 
          const radius = t * 0.15;
          petals.push({
            pos: [Math.cos(angle) * radius, t * 0.22, Math.sin(angle) * radius] as [number, number, number],
            rot: [Math.PI * (0.15 + t * 0.6), -angle, 0] as [number, number, number],
            scale: [0.12 + t * 0.1, 0.18 + t * 0.1, 0.02] as [number, number, number]
          });
        }
        break;
      case FlowerType.SUNFLOWER:
        for (let i = 0; i < 34; i++) {
          const angle = (i / 34) * Math.PI * 2;
          petals.push({
            pos: [Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38] as [number, number, number],
            rot: [Math.PI * 0.48, -angle, 0] as [number, number, number],
            scale: [0.1, 0.45, 0.02] as [number, number, number]
          });
        }
        break;
      case FlowerType.TULIP:
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const phase = i % 2;
          petals.push({
            pos: [Math.cos(angle) * 0.12, 0.1, Math.sin(angle) * 0.12] as [number, number, number],
            rot: [Math.PI * (phase ? 0.05 : 0.15), -angle, 0] as [number, number, number],
            scale: [0.3, 0.55, 0.05] as [number, number, number]
          });
        }
        break;
      case FlowerType.DAISY:
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          petals.push({
            pos: [Math.cos(angle) * 0.12, 0, Math.sin(angle) * 0.12] as [number, number, number],
            rot: [Math.PI * 0.46, -angle, 0] as [number, number, number],
            scale: [0.06, 0.4, 0.01] as [number, number, number]
          });
        }
        break;
      case FlowerType.LOTUS:
        for (let l = 0; l < 3; l++) {
          const count = 10 + l * 4;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 0.12 + l * 0.12;
            petals.push({
              pos: [Math.cos(angle) * r, l * 0.08, Math.sin(angle) * r] as [number, number, number],
              rot: [Math.PI * (0.25 + l * 0.15), -angle, 0] as [number, number, number],
              scale: [0.25, 0.45, 0.03] as [number, number, number]
            });
          }
        }
        break;
    }
    return petals;
  }, [type]);

  const stemRadius = type === FlowerType.SUNFLOWER ? 0.06 : 0.02;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const h = scale * heightMultiplier * stemGrowth;
      const mass = type === FlowerType.SUNFLOWER ? 2.5 : 0.6;
      const sway = Math.sin(t * windSpeed * (1/mass) + position[0]) * (0.05 * h);
      groupRef.current.rotation.x = sway;
      groupRef.current.rotation.z = Math.cos(t * windSpeed * 0.7 * (1/mass) + position[2]) * (0.03 * h);
      
      if (headRef.current) {
        headRef.current.scale.setScalar(bloomGrowth);
        const pulse = 1 + Math.sin(t * 2.5) * (0.015 * nutrients);
        headRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  const finalStemHeight = scale * heightMultiplier * stemGrowth;

  return (
    <group position={position} rotation={[0, rotation, 0]} ref={groupRef} onClick={onClick}>
      {/* 茎秆 - 增加顶部渐细 */}
      <mesh position={[0, finalStemHeight / 2, 0]}>
        <cylinderGeometry args={[stemRadius * 0.6, stemRadius, finalStemHeight, 10]} />
        <meshStandardMaterial 
          color={hydration > 0.4 ? "#2d4a22" : "#4a4e22"} 
          roughness={0.9} 
        />
      </mesh>

      {/* 叶片系统 - 真实化渲染 */}
      {leavesData.map((leaf, i) => {
        const h = leaf.h * finalStemHeight;
        return (
          <group key={i} position={[0, h, 0]} rotation={[0, leaf.angle, 0]}>
            <mesh 
              geometry={leafGeometry} 
              rotation={[leaf.rotX, 0, 0]}
              scale={[leafGrowth * leaf.s, leafGrowth * leaf.s, 1]}
            >
              <meshStandardMaterial 
                color={hydration > 0.5 ? "#3a5a40" : "#588157"} 
                side={THREE.DoubleSide} 
                roughness={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* 花头 */}
      <group position={[0, finalStemHeight, 0]} ref={headRef}>
        {petalData.map((p, i) => (
          <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.15 + nutrients * 0.25} 
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}

        {/* 花芯 */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[type === FlowerType.SUNFLOWER ? 0.35 : 0.12, 16, 16]} />
          <meshStandardMaterial color={type === FlowerType.SUNFLOWER ? "#2d1e14" : "#ffcc00"} roughness={1} />
        </mesh>
        
        {type === FlowerType.SUNFLOWER && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.38, 32]} />
            <meshStandardMaterial color="#1a0f0a" />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default ProceduralFlower;
