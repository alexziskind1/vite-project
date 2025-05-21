import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { RamFormState } from '../../types/calculator';

interface RamCalculatorFormProps {
  onFormChange: (formData: RamFormState) => void;
  initialState: RamFormState;
}

const RamCalculatorForm: React.FC<RamCalculatorFormProps> = ({ onFormChange, initialState }) => {
  const [formState, setFormState] = useState<RamFormState>(initialState);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onFormChange(formState);
  }, [formState, onFormChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value); // Store undefined for empty optional fields
      if (name === 'batchSize' && processedValue !== undefined && processedValue < 1) {
        processedValue = 1;
      } else if (processedValue !== undefined && processedValue < 0) {
        processedValue = 0;
      }
    } else if (type === 'select-one' && name === 'kvCacheQuantizationBits') {
        processedValue = value === 'same' ? 'same' : (value === '' ? undefined : parseInt(value, 10));
    } else if (type === 'select-one' && name === 'quantizationBits') {
        processedValue = value === '' ? undefined : parseInt(value, 10);
    }


    setFormState(prevState => ({
      ...prevState,
      [name]: processedValue,
    }));
  };
  
  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      {/* Model Parameters */}
      <div>
        <label htmlFor="modelParamsB" className="block text-sm font-medium text-gray-700">Model Parameters (Billions):</label>
        <input 
          type="number" 
          name="modelParamsB" 
          id="modelParamsB" 
          aria-label="Model Parameters in Billions"
          value={formState.modelParamsB === undefined ? '' : formState.modelParamsB} 
          onChange={handleChange} 
          min="0" 
          step="any" 
          placeholder="e.g., 7"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
        />
        <p className="text-xs text-gray-500 mt-1">Total number of parameters in the model, in billions (e.g., 7 for a 7B model).</p>
      </div>

      {/* Quantization */}
      <div>
        <label htmlFor="quantizationBits" className="block text-sm font-medium text-gray-700">Quantization (Bits):</label>
        <select 
          name="quantizationBits" 
          id="quantizationBits" 
          aria-label="Quantization in Bits"
          value={formState.quantizationBits === undefined ? '' : formState.quantizationBits} 
          onChange={handleChange} 
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select Precision...</option>
          <option value="4">4-bit</option>
          <option value="8">8-bit</option>
          <option value="16">16-bit (FP16/BF16)</option>
          <option value="32">32-bit (FP32)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Precision of model weights. Lower values reduce RAM (e.g., 16 for FP16, 8 for INT8, 4 for INT4/NF4).</p>
      </div>

      {/* Context Length */}
      <div>
        <label htmlFor="contextLength" className="block text-sm font-medium text-gray-700">Context Length (Tokens):</label>
        <input 
          type="number" 
          name="contextLength" 
          id="contextLength" 
          aria-label="Context Length in Tokens"
          value={formState.contextLength === undefined ? '' : formState.contextLength} 
          onChange={handleChange} 
          min="0" 
          placeholder="e.g., 4096"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
        />
        <p className="text-xs text-gray-500 mt-1">Max tokens (input + output) the model processes. Affects KV cache RAM.</p>
      </div>

      {/* Batch Size */}
      <div>
        <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700">Batch Size:</label>
        <input 
          type="number" 
          name="batchSize" 
          id="batchSize" 
          aria-label="Batch Size"
          value={formState.batchSize === undefined ? '' : formState.batchSize} 
          onChange={handleChange} 
          min="1" 
          placeholder="e.g., 1"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
        />
        <p className="text-xs text-gray-500 mt-1">Number of input sequences processed in parallel. Often 1 for local inference. Affects KV cache.</p>
      </div>

      {/* GPU VRAM */}
      <div>
        <label htmlFor="gpuVramGb" className="block text-sm font-medium text-gray-700">Available GPU VRAM (GB):</label>
        <input 
          type="number" 
          name="gpuVramGb" 
          id="gpuVramGb" 
          aria-label="Available GPU VRAM in GB"
          value={formState.gpuVramGb === undefined ? '' : formState.gpuVramGb} 
          onChange={handleChange} 
          min="0" 
          step="any" 
          placeholder="e.g., 24"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
        />
        <p className="text-xs text-gray-500 mt-1">VRAM on your GPU (if any). Model and KV cache can be offloaded here, reducing system RAM.</p>
      </div>
      
      {/* Advanced Options Toggle */}
      <div className="mt-6">
        <label htmlFor="showAdvanced" className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            name="showAdvanced" 
            id="showAdvanced" 
            aria-label="Toggle Advanced KV Cache Options"
            checked={showAdvanced} 
            onChange={() => setShowAdvanced(!showAdvanced)} 
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Show Advanced Options (for KV Cache)</span>
        </label>
      </div>

      {showAdvanced && (
        <div className="space-y-4 mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <p className="text-xs text-gray-600 italic">These values are typically found in the model's configuration file (e.g., config.json). Providing them allows for a more accurate KV cache estimation.</p>
          {/* Hidden Size */}
          <div>
            <label htmlFor="hiddenSize" className="block text-sm font-medium text-gray-700">Hidden Size (d_model):</label>
            <input 
              type="number" 
              name="hiddenSize" 
              id="hiddenSize" 
              aria-label="Hidden Size (d_model)"
              value={formState.hiddenSize === undefined ? '' : formState.hiddenSize} 
              onChange={handleChange} 
              min="0" 
              placeholder="e.g., 4096"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            />
            <p className="text-xs text-gray-500 mt-1">Dimensionality of hidden states. From model's `config.json`.</p>
          </div>

          {/* Number of Layers */}
          <div>
            <label htmlFor="numLayers" className="block text-sm font-medium text-gray-700">Number of Layers:</label>
            <input 
              type="number" 
              name="numLayers" 
              id="numLayers" 
              aria-label="Number of Layers"
              value={formState.numLayers === undefined ? '' : formState.numLayers} 
              onChange={handleChange} 
              min="0" 
              placeholder="e.g., 32"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            />
            <p className="text-xs text-gray-500 mt-1">Total transformer layers. From model's `config.json`.</p>
          </div>

          {/* KV Cache Precision */}
          <div>
            <label htmlFor="kvCacheQuantizationBits" className="block text-sm font-medium text-gray-700">KV Cache Precision (Bits):</label>
            <select 
              name="kvCacheQuantizationBits" 
              id="kvCacheQuantizationBits" 
              aria-label="KV Cache Precision in Bits"
              value={formState.kvCacheQuantizationBits === undefined ? '' : formState.kvCacheQuantizationBits} 
              onChange={handleChange} 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="same">Same as Model</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit (FP16)</option>
              {/* Add more options if necessary, e.g., 4-bit for KV cache if supported */}
            </select>
            <p className="text-xs text-gray-500 mt-1">Precision for KV cache. 'Same as Model', 8-bit, or 16-bit. Affects KV cache RAM.</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default RamCalculatorForm;
