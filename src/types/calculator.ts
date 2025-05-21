export interface RamFormState {
  modelParamsB: number; // billions of parameters
  quantizationBits: number; // e.g., 4, 8, 16
  contextLength?: number; // for tokens
  batchSize?: number;
  gpuVramGb?: number; // GPU VRAM in GB
  hiddenSize?: number;
  numLayers?: number;
  kvCacheQuantizationBits?: number | string; // e.g., 8, 16, or a string like 'same'
}

export interface RamCalculationResults {
  modelRamGb: number;
  kvCacheRamGb: number;
  overheadRamGb: number;
  gpuRamUsedGb: number;
  systemRamGb: number;
  warnings: string[]; // to hold any warnings or notes for the user
}
