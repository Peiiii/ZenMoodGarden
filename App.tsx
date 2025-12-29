
import React, { useState, useEffect, useCallback } from 'react';
import GardenCanvas from './components/GardenCanvas';
import Sidebar from './components/Sidebar';
import { FlowerData, FlowerType, GardenSettings, GardenTheme, ToolType } from './types';
import { getMoodGardenTheme } from './services/geminiService';

const INITIAL_SETTINGS: GardenSettings = {
  windSpeed: 1.2,
  flowerHeight: 1.4,
  colorRichness: 0.8,
  bloomIntensity: 0.5,
  timeOfDay: 9,
  gardenStyle: 'wild'
};

const INITIAL_THEME: GardenTheme = {
  primaryColor: '#ff7eb9',
  secondaryColor: '#ffea00',
  groundColor: '#1a2e1a',
  skyColor: '#87ceeb',
  moodDescription: '晨曦中的秘密花园。'
};

const App: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [settings, setSettings] = useState<GardenSettings>(INITIAL_SETTINGS);
  const [theme, setTheme] = useState<GardenTheme>(INITIAL_THEME);
  const [moodInput, setMoodInput] = useState('');
  const [selectedFlower, setSelectedFlower] = useState<FlowerType>(FlowerType.ROSE);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SOW);
  const [isGenerating, setIsGenerating] = useState(false);

  // 核心布局逻辑：根据风格生成每日花园
  const generateDailyGarden = useCallback((style: 'wild' | 'ordered' | 'zen', themeData: GardenTheme) => {
    const today = new Date().toISOString().split('T')[0];
    const seedStr = today + style;
    let seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const newFlowers: FlowerData[] = [];
    const types = Object.values(FlowerType);

    if (style === 'ordered') {
      // 庄园风：网格阵列
      for (let x = -4; x <= 4; x++) {
        for (let z = -4; z <= 4; z++) {
          const type = types[Math.floor(random() * types.length)];
          newFlowers.push({
            id: `grid-${x}-${z}`,
            type,
            position: [x * 4, 0, z * 4],
            color: random() > 0.5 ? themeData.primaryColor : themeData.secondaryColor,
            scale: 0.9 + random() * 0.4,
            rotation: random() * Math.PI,
            growth: 1,
            hydration: 0.8,
            nutrients: 0.8
          });
        }
      }
    } else if (style === 'zen') {
      // 禅意：稀疏聚集
      const clusters = 3;
      for (let c = 0; c < clusters; c++) {
        const centerX = (random() - 0.5) * 30;
        const centerZ = (random() - 0.5) * 30;
        const type = types[Math.floor(random() * types.length)];
        for (let i = 0; i < 6; i++) {
          newFlowers.push({
            id: `zen-${c}-${i}`,
            type,
            position: [centerX + (random() - 0.5) * 5, 0, centerZ + (random() - 0.5) * 5],
            color: themeData.primaryColor,
            scale: 0.7 + random() * 0.8,
            rotation: random() * Math.PI,
            growth: 1,
            hydration: 0.9,
            nutrients: 0.9
          });
        }
      }
    } else {
      // 野生：随机 meadow
      for (let i = 0; i < 45; i++) {
        newFlowers.push({
          id: `wild-${i}`,
          type: types[Math.floor(random() * types.length)],
          position: [(random() - 0.5) * 50, 0, (random() - 0.5) * 50],
          color: random() > 0.3 ? themeData.primaryColor : themeData.secondaryColor,
          scale: 0.6 + random() * 1.2,
          rotation: random() * Math.PI * 2,
          growth: 1,
          hydration: 0.6 + random() * 0.4,
          nutrients: 0.6 + random() * 0.4
        });
      }
    }
    setFlowers(newFlowers);
  }, []);

  useEffect(() => {
    generateDailyGarden(settings.gardenStyle, theme);
  }, [settings.gardenStyle, generateDailyGarden, theme]);

  const handlePlant = useCallback((position: [number, number, number]) => {
    const flowerId = Math.random().toString(36).substr(2, 9);
    const newFlower: FlowerData = {
      id: flowerId,
      type: selectedFlower,
      position,
      color: Math.random() > 0.5 ? theme.primaryColor : theme.secondaryColor,
      scale: 0.8 + Math.random() * 0.6, 
      rotation: Math.random() * Math.PI * 2,
      growth: 0,
      hydration: 1.0,
      nutrients: 1.0
    };
    
    setFlowers((prev) => [...prev, newFlower]);

    let growthValue = 0;
    const interval = setInterval(() => {
      growthValue += 0.015;
      setFlowers(prev => prev.map(f => f.id === flowerId ? { ...f, growth: Math.min(1, growthValue) } : f));
      if (growthValue >= 1) clearInterval(interval);
    }, 30);
  }, [selectedFlower, theme]);

  const handleInteractFlower = useCallback((id: string) => {
    setFlowers(prev => prev.map(f => {
      if (f.id !== id) return f;
      if (activeTool === ToolType.WATER) return { ...f, hydration: Math.min(1, f.hydration + 0.3) };
      if (activeTool === ToolType.FERTILIZE) return { ...f, nutrients: Math.min(1, f.nutrients + 0.3), scale: f.scale * 1.05 };
      return f;
    }));
  }, [activeTool]);

  const handleMoodSubmit = async () => {
    if (!moodInput.trim()) return;
    setIsGenerating(true);
    const newTheme = await getMoodGardenTheme(moodInput);
    setTheme(newTheme);
    setIsGenerating(false);
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950">
      <Sidebar 
        settings={settings}
        setSettings={setSettings}
        theme={theme}
        moodInput={moodInput}
        setMoodInput={setMoodInput}
        onMoodSubmit={handleMoodSubmit}
        onClearGarden={() => setFlowers([])}
        selectedFlower={selectedFlower}
        setSelectedFlower={setSelectedFlower}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isGenerating={isGenerating}
      />

      {/* 底部操作面板 - 移动端自适应 */}
      <div className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-72 lg:bottom-8 lg:right-8 pointer-events-none z-10 flex flex-col gap-2">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-4 rounded-3xl text-right">
          <p className="font-bold text-white/90 text-xs mb-1">
            {activeTool === ToolType.SOW && <span className="text-pink-400">正在播种: {selectedFlower}</span>}
            {activeTool === ToolType.WATER && <span className="text-blue-400">正在灌溉</span>}
            {activeTool === ToolType.FERTILIZE && <span className="text-yellow-400">正在施肥</span>}
          </p>
          <p className="text-[9px] text-white/40 uppercase tracking-tighter lg:tracking-widest">
            {window.innerWidth < 1024 ? '单指旋转 • 双指缩放 • 点击交互' : '左键旋转 • 右键平移 • 滚轮缩放'}
          </p>
        </div>
      </div>

      <GardenCanvas 
        flowers={flowers} 
        settings={settings} 
        theme={theme}
        activeTool={activeTool}
        onPlant={handlePlant}
        onInteractFlower={handleInteractFlower}
      />
    </div>
  );
};

export default App;
