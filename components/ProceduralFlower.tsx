
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

  // 生长阶段精细化
  const stemGrowth = Math.min(1, growth / 0.5); // 前50%长茎
  const leafGrowth = Math.max(0, Math.min(1, (growth - 0.3) / 0.4)); // 30%-70%长叶
  const bloomGrowth = Math.max(0, Math.min(1, (growth - 0.6) / 0.4)); // 60%-100%开花

  // 1. 生成花瓣数据
  const petalData = useMemo(() => {
    const petals = [];
    switch (type) {
      case FlowerType.ROSE:
        // 玫瑰：螺旋多层
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const angle = i * Math.PI * (3 - Math.sqrt(5)); // 黄金角度
          const radius = t * 0.15;
          petals.push({
            pos: [Math.cos(angle) * radius, t * 0.2, Math.sin(angle) * radius] as [number, number, number],
            rot: [Math.PI * (0.2 + t * 0.5), -angle, 0] as [number, number, number],
            scale: [0.1 + t * 0.1, 0.15 + t * 0.1, 0.02] as [number, number, number],
            shape: 'heart'
          });
        }
        break;
      case FlowerType.SUNFLOWER:
        // 向日葵：外圈长花瓣
        for (let i = 0; i < 32; i++) {
          const angle = (i / 32) * Math.PI * 2;
          petals.push({
            pos: [Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35] as [number, number, number],
            rot: [Math.PI * 0.48, -angle, 0] as [number, number, number],
            scale: [0.08, 0.4, 0.02] as [number, number, number],
            shape: 'pointed'
          });
        }
        break;
      case FlowerType.TULIP:
        // 郁金香：6片大花瓣闭合
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          petals.push({
            pos: [Math.cos(angle) * 0.1, 0.2, Math.sin(angle) * 0.1] as [number, number, number],
            rot: [Math.PI * 0.1, -angle, 0] as [number, number, number],
            scale: [0.25, 0.5, 0.05] as [number, number, number],
            shape: 'oval'
          });
        }
        break;
      case FlowerType.DAISY:
        // 雏菊：单层放射
        for (let i = 0; i < 18; i++) {
          const angle = (i / 18) * Math.PI * 2;
          petals.push({
            pos: [Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15] as [number, number, number],
            rot: [Math.PI * 0.45, -angle, 0] as [number, number, number],
            scale: [0.05, 0.35, 0.01] as [number, number, number],
            shape: 'thin'
          });
        }
        break;
      case FlowerType.LOTUS:
        // 莲花：宽层开放
        for (let layer = 0; layer < 3; layer++) {
          const count = 8 + layer * 4;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 0.15 + layer * 0.1;
            petals.push({
              pos: [Math.cos(angle) * r, layer * 0.05, Math.sin(angle) * r] as [number, number, number],
              rot: [Math.PI * (0.3 + layer * 0.1), -angle, 0] as [number, number, number],
              scale: [0.2, 0.4, 0.03] as [number, number, number],
              shape: 'pointed'
            });
          }
        }
        break;
    }
    return petals;
  }, [type]);

  // 2. 根据类型定义茎叶参数
  const stemParams = useMemo(() => {
    switch (type) {
      case FlowerType.SUNFLOWER: return { radius: 0.05, leaves: 4, leafSize: 0.4 };
      case FlowerType.TULIP: return { radius: 0.02, leaves: 2, leafSize: 0.5 };
      default: return { radius: 0.015, leaves: 2, leafSize: 0.25 };
    }
  }, [type]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const h = scale * heightMultiplier * stemGrowth;
      // 风力影响：向日葵重，晃动慢；雏菊轻，晃动快
      const mass = type === FlowerType.SUNFLOWER ? 2 : 0.5;
      const sway = Math.sin(t * windSpeed * (1/mass) + position[0]) * (0.04 * h);
      groupRef.current.rotation.x = sway;
      groupRef.current.rotation.z = Math.cos(t * windSpeed * 0.8 * (1/mass) + position[2]) * (0.02 * h);
      
      if (headRef.current) {
        headRef.current.scale.setScalar(bloomGrowth);
        // 呼吸感
        const pulse = 1 + Math.sin(t * 2) * (0.02 * nutrients);
        headRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  const finalStemHeight = scale * heightMultiplier * stemGrowth;

  return (
    <group position={position} rotation={[0, rotation, 0]} ref={groupRef} onClick={onClick}>
      {/* 茎秆 */}
      <mesh position={[0, finalStemHeight / 2, 0]}>
        <cylinderGeometry args={[stemParams.radius * 0.7, stemParams.radius, finalStemHeight, 12]} />
        <meshStandardMaterial color={hydration > 0.4 ? "#344e41" : "#588157"} roughness={0.9} />
      </mesh>

      {/* 叶片 */}
      {Array.from({ length: stemParams.leaves }).map((_, i) => {
        const h = (i + 1) / (stemParams.leaves + 1) * finalStemHeight;
        return (
          <mesh 
            key={i} 
            position={[0, h, 0]} 
            rotation={[Math.PI * 0.4, (i * Math.PI * 0.7) + rotation, 0]}
            scale={[leafGrowth * stemParams.leafSize, leafGrowth * stemParams.leafSize, 0.01]}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#3a5a40" side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* 花头 */}
      <group position={[0, finalStemHeight, 0]} ref={headRef}>
        {/* 花瓣层 */}
        {petalData.map((p, i) => (
          <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.1 + nutrients * 0.2} 
              transparent
              opacity={0.95}
            />
          </mesh>
        ))}

        {/* 花芯 */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[type === FlowerType.SUNFLOWER ? 0.3 : 0.1, 16, 16]} />
          <meshStandardMaterial color={type === FlowerType.SUNFLOWER ? "#3d2b1f" : "#ffcc00"} roughness={1} />
        </mesh>
        
        {/* 向日葵特有的花盘 */}
        {type === FlowerType.SUNFLOWER && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 32]} />
            <meshStandardMaterial color="#2d1e14" />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default ProceduralFlower;
