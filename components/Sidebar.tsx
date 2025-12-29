
import React, { useState } from 'react';
import { 
  Wind, 
  Palette, 
  Trash2, 
  Sparkles,
  Flower2,
  Send,
  Droplets,
  Zap,
  Sprout,
  LayoutGrid,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { GardenSettings, GardenTheme, FlowerType, ToolType } from '../types';

interface SidebarProps {
  settings: GardenSettings;
  setSettings: (settings: GardenSettings) => void;
  theme: GardenTheme;
  moodInput: string;
  setMoodInput: (val: string) => void;
  onMoodSubmit: () => void;
  onClearGarden: () => void;
  selectedFlower: FlowerType;
  setSelectedFlower: (type: FlowerType) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  theme,
  moodInput,
  setMoodInput,
  onMoodSubmit,
  onClearGarden,
  selectedFlower,
  setSelectedFlower,
  activeTool,
  setActiveTool,
  isGenerating
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof GardenSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const flowerTypes = [
    { id: FlowerType.DAISY, label: '雏菊' },
    { id: FlowerType.TULIP, label: '郁金香' },
    { id: FlowerType.ROSE, label: '玫瑰' },
    { id: FlowerType.SUNFLOWER, label: '向日葵' },
    { id: FlowerType.LOTUS, label: '莲花' },
  ];

  const gardenStyles: Array<{id: 'wild' | 'ordered' | 'zen', label: string}> = [
    { id: 'wild', label: '原野' },
    { id: 'ordered', label: '庄园' },
    { id: 'zen', label: '禅意' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 移动端菜单开关 (FAB) */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-4 bg-slate-900/80 border border-white/20 rounded-2xl text-white lg:hidden shadow-2xl backdrop-blur-xl"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 侧边栏容器 */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[85vw] sm:w-80 bg-slate-950/80 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col gap-6 text-white shadow-2xl transition-transform duration-500 ease-out
        lg:translate-x-0 lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-[2.5rem] lg:border
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* 头部 */}
        <div className="flex flex-col gap-1 mt-12 lg:mt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">Mood Garden</h1>
            {isOpen && <button onClick={toggleSidebar} className="lg:hidden text-white/40"><ChevronRight size={20} /></button>}
          </div>
          <p className="text-[11px] text-white/40 italic leading-relaxed pr-4">"{theme.moodDescription}"</p>
        </div>

        {/* 情绪输入 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <Sparkles size={12} />
            情绪编织
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="今天的心情是...?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm placeholder:text-white/20"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onMoodSubmit()}
            />
            <button 
              onClick={() => { onMoodSubmit(); if(window.innerWidth < 1024) setIsOpen(false); }}
              disabled={isGenerating}
              className="absolute right-2 top-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* 风格切换 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <LayoutGrid size={12} />
            花园风格
          </div>
          <div className="grid grid-cols-3 gap-2">
            {gardenStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => updateSetting('gardenStyle', style.id)}
                className={`py-3 rounded-2xl text-[11px] font-bold transition-all border ${
                  settings.gardenStyle === style.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 text-white/60 border-transparent'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* 园艺工具 - 触控友好优化 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <Palette size={12} />
            园艺工具
          </div>
          <div className="flex flex-col gap-2">
            {[
              { id: ToolType.SOW, label: '播种种子', icon: <Sprout size={18} />, color: 'hover:text-pink-400' },
              { id: ToolType.WATER, label: '浇灌生命', icon: <Droplets size={18} />, color: 'hover:text-blue-400' },
              { id: ToolType.FERTILIZE, label: '施肥生养', icon: <Zap size={18} />, color: 'hover:text-yellow-400' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id); if(window.innerWidth < 1024) setIsOpen(false); }}
                className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-sm font-bold transition-all border ${
                  activeTool === tool.id 
                    ? 'bg-white text-black border-white shadow-xl scale-[1.02]' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/5'
                }`}
              >
                {tool.icon}
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        {/* 种子选择 */}
        {activeTool === ToolType.SOW && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              <Flower2 size={12} />
              选择花种
            </div>
            <div className="grid grid-cols-2 gap-2">
              {flowerTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedFlower(type.id)}
                  className={`px-3 py-3 rounded-xl text-[10px] font-bold transition-all ${
                    selectedFlower === type.id 
                      ? 'bg-indigo-500 text-white shadow-lg' 
                      : 'bg-white/5 text-white/50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 环境滑块 */}
        <div className="space-y-6 overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <Wind size={12} />
            自然控制
          </div>

          <div className="space-y-4">
            {[
              { label: '风力强度', key: 'windSpeed', min: 0, max: 5, step: 0.1, unit: '%' },
              { label: '植株高度', key: 'flowerHeight', min: 0.5, max: 2.5, step: 0.1, unit: 'x' },
              { label: '日夜循环', key: 'timeOfDay', min: 0, max: 24, step: 0.5, unit: ':00' },
            ].map((item) => (
              <div key={item.key} className="space-y-3">
                <div className="flex justify-between text-[10px] font-medium text-white/40">
                  <span>{item.label}</span>
                  <span>{item.key === 'windSpeed' ? Math.round(settings[item.key as keyof GardenSettings] as number * 10) : settings[item.key as keyof GardenSettings]}{item.unit}</span>
                </div>
                <input 
                  type="range" min={item.min} max={item.max} step={item.step} 
                  value={settings[item.key as keyof GardenSettings] as number}
                  onChange={(e) => updateSetting(item.key as keyof GardenSettings, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { onClearGarden(); if(window.innerWidth < 1024) setIsOpen(false); }}
          className="mt-auto flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-3xl text-xs font-bold transition-all border border-red-500/20"
        >
          <Trash2 size={16} /> 重置花园
        </button>
      </div>

      {/* 移动端背景遮罩 */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
