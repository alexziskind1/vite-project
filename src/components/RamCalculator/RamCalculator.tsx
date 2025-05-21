import React, { useState } from 'react';
import { RamFormState, RamCalculationResults } from '../../types/calculator';
import RamCalculatorForm from './RamCalculatorForm';
import RamDisplay from './RamDisplay';
import { estimateTotalRam } from '../../utils/ramCalculatorLogic';

const initialRamFormState: RamFormState = {
  modelParamsB: 7,       // Default to a 7B model
  quantizationBits: 16,  // Default to 16-bit
  contextLength: 2048,
  batchSize: 1,
  gpuVramGb: 0,
  // Optional advanced fields can be undefined or have defaults if preferred
  hiddenSize: 4096, // Example: Common for 7B models
  numLayers: 32,    // Example: Common for 7B models
  kvCacheQuantizationBits: 'same', // Default to 'same' as model
};

const RamCalculator: React.FC = () => {
  // Initialize formState separately to allow form to manage its own copy for inputs
  // but RamCalculator also needs to know the latest to pass to estimateTotalRam
  const [currentFormState, setCurrentFormState] = useState<RamFormState>(initialRamFormState);
  const [calculationResults, setCalculationResults] = useState<RamCalculationResults | null>(
    estimateTotalRam(initialRamFormState) // Calculate initial results
  );

  const handleFormChange = (newFormData: RamFormState) => {
    setCurrentFormState(newFormData); // Keep track of the latest form state
    const newResults = estimateTotalRam(newFormData);
    setCalculationResults(newResults);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">LLM RAM Usage Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Model Configuration:</h2>
          <RamCalculatorForm
            initialState={initialRamFormState} // Form initializes with this
            onFormChange={handleFormChange}    // Parent gets updates
          />
        </div>
        <div>
          {/* The RamDisplay component includes its own "Calculation Results:" heading */}
          <RamDisplay results={calculationResults} />
        </div>
      </div>
    </div>
  );
};

export default RamCalculator;
