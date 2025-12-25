
export enum FlowerType {
  DAISY = 'DAISY',
  TULIP = 'TULIP',
  ROSE = 'ROSE',
  SUNFLOWER = 'SUNFLOWER',
  LOTUS = 'LOTUS'
}

export enum ToolType {
  SOW = 'SOW',
  WATER = 'WATER',
  FERTILIZE = 'FERTILIZE'
}

export interface FlowerData {
  id: string;
  type: FlowerType;
  position: [number, number, number];
  color: string;
  scale: number;
  rotation: number;
  growth: number;
  hydration: number; // 0 to 1
  nutrients: number; // 0 to 1
}

export interface GardenSettings {
  windSpeed: number;
  flowerHeight: number;
  colorRichness: number;
  bloomIntensity: number;
  timeOfDay: number; // 0-24
  gardenStyle: 'wild' | 'ordered' | 'zen';
}

export interface GardenTheme {
  primaryColor: string;
  secondaryColor: string;
  groundColor: string;
  skyColor: string;
  moodDescription: string;
}
