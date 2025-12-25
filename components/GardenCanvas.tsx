
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Stars, ContactShadows } from '@react-three/drei';
import ProceduralFlower from './ProceduralFlower';
import { FlowerData, GardenSettings, GardenTheme, ToolType } from '../types';

interface GardenCanvasProps {
  flowers: FlowerData[];
  settings: GardenSettings;
  theme: GardenTheme;
  activeTool: ToolType;
  onPlant: (position: [number, number, number]) => void;
  onInteractFlower: (id: string) => void;
}

const GardenCanvas: React.FC<GardenCanvasProps> = ({ 
  flowers, 
  settings, 
  theme, 
  activeTool,
  onPlant, 
  onInteractFlower 
}) => {
  const sunPosition: [number, number, number] = [
    Math.sin((settings.timeOfDay / 24) * Math.PI * 2) * 50,
    Math.cos((settings.timeOfDay / 24) * Math.PI * 2) * 50,
    20
  ];

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas 
        shadows 
        camera={{ position: [10, 10, 10], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Sky 
            sunPosition={sunPosition} 
            turbidity={0.1}
            rayleigh={2}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
          />
          {settings.timeOfDay > 18 || settings.timeOfDay < 6 ? <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /> : null}
          
          <ambientLight intensity={settings.timeOfDay > 18 || settings.timeOfDay < 6 ? 0.2 : 0.6} />
          <directionalLight 
            position={sunPosition} 
            intensity={settings.timeOfDay > 18 || settings.timeOfDay < 6 ? 0.1 : 1.5} 
            castShadow 
          />
          
          <Environment preset="park" />

          {/* Ground Mesh with Click Handler for Sowing */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow 
            name="ground"
            onClick={(e) => {
              // In R3F, events on meshes include raycaster data like e.point.
              // We use e.stopPropagation to prevent the event from triggering other handlers.
              if (activeTool === ToolType.SOW) {
                e.stopPropagation();
                // Use the precise intersection point to plant the flower
                onPlant([e.point.x, 0, e.point.z]);
              }
            }}
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color={theme.groundColor} 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Shadows */}
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={40} 
            blur={2} 
            far={10} 
            resolution={256} 
            color="#000000" 
          />

          {/* Flowers */}
          {flowers.map((flower) => (
            <ProceduralFlower
              key={flower.id}
              id={flower.id}
              type={flower.type}
              position={flower.position}
              color={flower.color}
              scale={flower.scale}
              rotation={flower.rotation}
              windSpeed={settings.windSpeed}
              heightMultiplier={settings.flowerHeight}
              growth={flower.growth}
              hydration={flower.hydration}
              nutrients={flower.nutrients}
              onClick={(e) => {
                // Ensure the interaction doesn't also trigger the ground click handler
                e.stopPropagation();
                onInteractFlower(flower.id);
              }}
            />
          ))}

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1} 
            enableDamping 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GardenCanvas;
