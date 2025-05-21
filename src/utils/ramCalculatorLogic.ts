import { RamFormState, RamCalculationResults } from '../types/calculator';

const BYTES_PER_GB = 1024 * 1024 * 1024;
const DEFAULT_OVERHEAD_GB = 2; // For general system and framework overhead

export function calculateModelRamGb(numParametersB: number, quantizationBits: number): number {
  if (numParametersB <= 0 || quantizationBits <= 0) return 0;
  const bytesPerParameter = quantizationBits / 8;
  return (numParametersB * 1_000_000_000 * bytesPerParameter) / BYTES_PER_GB;
}

export function calculateKvCacheRamGb(
  contextLength: number,
  batchSize: number,
  numLayers: number,
  hiddenSize: number,
  kvCacheQuantizationBits: number
): number {
  if (contextLength <= 0 || batchSize <= 0 || numLayers <= 0 || hiddenSize <= 0 || kvCacheQuantizationBits <= 0) return 0;
  const bytesPerKvElement = kvCacheQuantizationBits / 8;
  // The '2' is for Key and Value pairs in the cache
  return (contextLength * batchSize * numLayers * hiddenSize * 2 * bytesPerKvElement) / BYTES_PER_GB;
}

export function estimateTotalRam(inputs: RamFormState): RamCalculationResults {
  const warnings: string[] = [];
  let modelRamGb = 0;
  let kvCacheRamGb = 0;

  // --- Model RAM ---
  if (inputs.modelParamsB > 0 && inputs.quantizationBits > 0) {
    modelRamGb = calculateModelRamGb(inputs.modelParamsB, inputs.quantizationBits);
  } else {
    warnings.push("Model parameters and quantization bits must be positive numbers to calculate model RAM.");
  }

  // --- KV Cache RAM ---
  let derivedKvCacheBits: number;
  const modelQuantBits = inputs.quantizationBits; // This can be undefined if user hasn't selected

  // Determine the KV cache bits to use
  if (typeof inputs.kvCacheQuantizationBits === 'number' && inputs.kvCacheQuantizationBits > 0) {
    derivedKvCacheBits = inputs.kvCacheQuantizationBits;
  } else if (typeof inputs.kvCacheQuantizationBits === 'string') {
    if (inputs.kvCacheQuantizationBits.toLowerCase() === 'same') {
      if (modelQuantBits && modelQuantBits > 0) {
        derivedKvCacheBits = modelQuantBits;
      } else {
        derivedKvCacheBits = 16; // Default if 'same' but modelQuant is not set
        warnings.push("KV cache set to 'Same as Model', but model quantization is not specified or invalid. Defaulted KV cache to 16-bit.");
      }
    } else { // It's a string that should be a number e.g. "8", "16" from a select value
      const parsed = parseInt(inputs.kvCacheQuantizationBits, 10);
      if (!isNaN(parsed) && parsed > 0) {
        derivedKvCacheBits = parsed;
      } else {
        derivedKvCacheBits = 16; // Default if parsing fails
        warnings.push(`Invalid KV cache precision string '${inputs.kvCacheQuantizationBits}'. Defaulted KV cache to 16-bit.`);
      }
    }
  } else { // kvCacheQuantizationBits is undefined or not a positive number if it was a number type initially
    // Default based on model precision, or 16 if model precision is also undefined or too low
    if (modelQuantBits && modelQuantBits > 0) {
      // If model quantization is very low (e.g., 4-bit), KV cache is often kept at a higher precision like 16-bit or at least 8-bit.
      // Let's say if modelQuantBits < 8, default KV to 16, else use modelQuantBits.
      derivedKvCacheBits = modelQuantBits < 8 ? 16 : modelQuantBits;
    } else {
      derivedKvCacheBits = 16; // Absolute fallback if model quantization is also not set
    }
    warnings.push(`KV cache precision not specified or invalid. Defaulted to ${derivedKvCacheBits}-bit.`);
  }

  // Final sanity check, though above logic should prevent this.
  if (derivedKvCacheBits <= 0) {
      derivedKvCacheBits = 16; // Fallback to a sensible default
      warnings.push(`Derived KV cache precision was invalid (<=0). Defaulted to 16-bit.`);
  }

  if (inputs.contextLength && inputs.contextLength > 0 &&
      inputs.batchSize && inputs.batchSize > 0 &&
      inputs.numLayers && inputs.numLayers > 0 &&
      inputs.hiddenSize && inputs.hiddenSize > 0) {
    kvCacheRamGb = calculateKvCacheRamGb(
      inputs.contextLength,
      inputs.batchSize,
      inputs.numLayers,
      inputs.hiddenSize,
      derivedKvCacheBits // Use the new robustly determined variable
    );
  } else if (inputs.contextLength || inputs.batchSize || inputs.numLayers || inputs.hiddenSize) {
    warnings.push("To calculate KV cache RAM, please provide all of Context Length, Batch Size, Num Layers, and Hidden Size as positive numbers.");
  }

  // --- GPU Offloading & System RAM ---
  const gpuVramGb = inputs.gpuVramGb && inputs.gpuVramGb > 0 ? inputs.gpuVramGb : 0;
  let modelRamOnGpu = 0;
  let kvCacheRamOnGpu = 0;

  if (gpuVramGb > 0) {
    modelRamOnGpu = Math.min(gpuVramGb, modelRamGb);
    kvCacheRamOnGpu = Math.min(gpuVramGb - modelRamOnGpu, kvCacheRamGb);
  }

  const gpuRamUsedGb = modelRamOnGpu + kvCacheRamOnGpu;
  const systemModelRam = modelRamGb - modelRamOnGpu;
  const systemKvCacheRam = kvCacheRamGb - kvCacheRamOnGpu;
  const overheadRamGb = DEFAULT_OVERHEAD_GB; // Could be dynamic later
  
  const systemRamGb = systemModelRam + systemKvCacheRam + overheadRamGb;

  return {
    modelRamGb,
    kvCacheRamGb,
    overheadRamGb,
    gpuRamUsedGb,
    systemRamGb,
    warnings
  };
}
