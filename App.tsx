
import React, { useState, useEffect, useCallback } from 'react';
import GardenCanvas from './components/GardenCanvas';
import Sidebar from './components/Sidebar';
import { FlowerData, FlowerType, GardenSettings, GardenTheme, ToolType } from './types';
import { getMoodGardenTheme } from './services/geminiService';

const INITIAL_SETTINGS: GardenSettings = {
  windSpeed: 1.5,
  flowerHeight: 1.5,
  colorRichness: 0.8,
  bloomIntensity: 0.5,
  timeOfDay: 10,
  gardenStyle: 'wild'
};

const INITIAL_THEME: GardenTheme = {
  primaryColor: '#ff7eb9',
  secondaryColor: '#ffb7ff',
  groundColor: '#2d4a22',
  skyColor: '#a5f3fc',
  moodDescription: '沉浸在宁静的数字自然中。'
};

const App: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [settings, setSettings] = useState<GardenSettings>(INITIAL_SETTINGS);
  const [theme, setTheme] = useState<GardenTheme>(INITIAL_THEME);
  const [moodInput, setMoodInput] = useState('');
  const [selectedFlower, setSelectedFlower] = useState<FlowerType>(FlowerType.ROSE);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SOW);
  const [isGenerating, setIsGenerating] = useState(false);

  // Daily seed logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const dailyFlowers: FlowerData[] = [];
    const types = Object.values(FlowerType);
    for (let i = 0; i < 20; i++) {
      const flowerType = types[Math.floor(random(seed + i) * types.length)];
      dailyFlowers.push({
        id: `daily-${i}`,
        type: flowerType,
        position: [
          (random(seed + i * 2) - 0.5) * 40,
          0,
          (random(seed + i * 3) - 0.5) * 40
        ],
        color: i % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
        scale: 0.8 + random(seed + i * 4) * 0.7,
        rotation: random(seed + i * 5) * Math.PI * 2,
        growth: 1,
        hydration: 0.6 + random(seed + i * 6) * 0.4,
        nutrients: 0.6 + random(seed + i * 7) * 0.4
      });
    }
    setFlowers(dailyFlowers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlant = useCallback((position: [number, number, number]) => {
    const flowerId = Math.random().toString(36).substr(2, 9);
    const targetScale = 0.8 + Math.random() * 0.7;
    
    const newFlower: FlowerData = {
      id: flowerId,
      type: selectedFlower,
      position,
      color: Math.random() > 0.5 ? theme.primaryColor : theme.secondaryColor,
      scale: targetScale, 
      rotation: Math.random() * Math.PI * 2,
      growth: 0,
      hydration: 0.8,
      nutrients: 0.8
    };
    
    setFlowers((prev) => [...prev, newFlower]);

    // Multi-stage growth animation (slower and more organic)
    let growthValue = 0;
    const growthStep = 0.02;
    const interval = setInterval(() => {
      growthValue += growthStep;
      
      setFlowers(prev => prev.map(f => 
        f.id === flowerId ? { ...f, growth: Math.min(1, growthValue) } : f
      ));

      if (growthValue >= 1) {
        clearInterval(interval);
      }
    }, 40); // Total growth takes about 2 seconds
  }, [selectedFlower, theme]);

  const handleInteractFlower = useCallback((id: string) => {
    setFlowers(prev => prev.map(f => {
      if (f.id !== id) return f;
      
      if (activeTool === ToolType.WATER) {
        return { ...f, hydration: Math.min(1, f.hydration + 0.2) };
      } else if (activeTool === ToolType.FERTILIZE) {
        // Fertilizing now also triggers a tiny growth spurt if not fully grown
        return { 
          ...f, 
          nutrients: Math.min(1, f.nutrients + 0.2), 
          scale: f.scale * 1.02 
        };
      }
      return f;
    }));
  }, [activeTool]);

  const handleMoodSubmit = async () => {
    if (!moodInput.trim()) return;
    setIsGenerating(true);
    const newTheme = await getMoodGardenTheme(moodInput);
    setTheme(newTheme);
    setIsGenerating(false);
    
    const lowerMood = moodInput.toLowerCase();
    if (lowerMood.includes('angry') || lowerMood.includes('storm') || lowerMood.includes('狂风')) {
      setSettings(s => ({ ...s, windSpeed: 8 }));
    } else if (lowerMood.includes('calm') || lowerMood.includes('peace') || lowerMood.includes('宁静')) {
      setSettings(s => ({ ...s, windSpeed: 0.5 }));
    }
  };

  const handleClear = () => {
    setFlowers([]);
    setTheme(INITIAL_THEME);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <div className="relative w-screen h-screen">
      <Sidebar 
        settings={settings}
        setSettings={setSettings}
        theme={theme}
        moodInput={moodInput}
        setMoodInput={setMoodInput}
        onMoodSubmit={handleMoodSubmit}
        onClearGarden={handleClear}
        selectedFlower={selectedFlower}
        setSelectedFlower={setSelectedFlower}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isGenerating={isGenerating}
      />

      <div className="fixed bottom-8 right-8 pointer-events-none z-10 text-white/40 text-xs text-right space-y-1">
        <p>左键旋转 • 右键平移 • 滚轮缩放</p>
        {activeTool === ToolType.SOW && <p className="text-pink-300 font-bold">点击地面播种: {selectedFlower}</p>}
        {activeTool === ToolType.WATER && <p className="text-blue-300 font-bold">点击花朵浇水</p>}
        {activeTool === ToolType.FERTILIZE && <p className="text-yellow-300 font-bold">点击花朵施肥</p>}
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
