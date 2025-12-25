
import React from 'react';
import { 
  Wind, 
  Maximize2, 
  Palette, 
  Sun, 
  Trash2, 
  Sparkles,
  Flower2,
  Send,
  Droplets,
  Zap,
  Sprout
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
  const updateSetting = (key: keyof GardenSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const flowerTypes = [
    { id: FlowerType.DAISY, label: 'Daisy' },
    { id: FlowerType.TULIP, label: 'Tulip' },
    { id: FlowerType.ROSE, label: 'Rose' },
    { id: FlowerType.SUNFLOWER, label: 'Sunflower' },
    { id: FlowerType.LOTUS, label: 'Lotus' },
  ];

  const tools = [
    { id: ToolType.SOW, label: 'Sow Seeds', icon: <Sprout size={16} /> },
    { id: ToolType.WATER, label: 'Water', icon: <Droplets size={16} /> },
    { id: ToolType.FERTILIZE, label: 'Fertilize', icon: <Zap size={16} /> },
  ];

  return (
    <div className="fixed left-4 top-4 bottom-4 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-6 text-white shadow-2xl overflow-y-auto z-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Mood Garden</h1>
        <p className="text-sm text-white/60 italic">"{theme.moodDescription}"</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
          <Sparkles size={14} />
          Mood Weaver
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="How are you feeling?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
            value={moodInput}
            onChange={(e) => setMoodInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onMoodSubmit()}
          />
          <button 
            onClick={onMoodSubmit}
            disabled={isGenerating}
            className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
          <Palette size={14} />
          Garden Tools
        </div>
        <div className="flex flex-col gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTool === tool.id 
                  ? 'bg-white text-black scale-105' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tool.icon}
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {activeTool === ToolType.SOW && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
            <Flower2 size={14} />
            Seed Selection
          </div>
          <div className="grid grid-cols-2 gap-2">
            {flowerTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFlower(type.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedFlower === type.id 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
          <Wind size={14} />
          Environment
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-2"><Wind size={12} /> Wind Speed</span>
            <span>{Math.round(settings.windSpeed * 10)}</span>
          </div>
          <input 
            type="range" min="0" max="10" step="0.1" 
            value={settings.windSpeed}
            onChange={(e) => updateSetting('windSpeed', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-2"><Maximize2 size={12} /> Flower Height</span>
            <span>{settings.flowerHeight.toFixed(1)}x</span>
          </div>
          <input 
            type="range" min="0.5" max="3" step="0.1" 
            value={settings.flowerHeight}
            onChange={(e) => updateSetting('flowerHeight', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-2"><Sun size={12} /> Time of Day</span>
            <span>{Math.floor(settings.timeOfDay)}:00</span>
          </div>
          <input 
            type="range" min="0" max="24" step="0.5" 
            value={settings.timeOfDay}
            onChange={(e) => updateSetting('timeOfDay', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex gap-2">
        <button 
          onClick={onClearGarden}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-sm font-medium transition-all"
        >
          <Trash2 size={16} /> Reset
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
