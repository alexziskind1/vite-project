import React from 'react';
import { RamCalculationResults } from '../../types/calculator';

interface RamDisplayProps {
  results: RamCalculationResults | null;
}

const RamDisplay: React.FC<RamDisplayProps> = ({ results }) => {
  if (!results) {
    return <div className="p-4 text-center text-gray-500">Enter parameters to see results.</div>;
  }

  const toFixed2 = (num: number) => num.toFixed(2);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-3">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Calculation Results:</h2>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <span className="font-medium text-gray-600">Model RAM:</span>
        <span className="text-gray-900">{toFixed2(results.modelRamGb)} GB</span>

        <span className="font-medium text-gray-600">KV Cache RAM:</span>
        <span className="text-gray-900">{toFixed2(results.kvCacheRamGb)} GB</span>

        <span className="font-medium text-gray-600">Estimated Overhead:</span>
        <span className="text-gray-900">{toFixed2(results.overheadRamGb)} GB</span>
        
        <span className="font-medium text-gray-600">RAM Offloaded to GPU:</span>
        <span className="text-gray-900">{toFixed2(results.gpuRamUsedGb)} GB</span>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-lg font-bold text-indigo-700">
          Total Estimated System RAM: {toFixed2(results.systemRamGb)} GB
        </p>
      </div>

      {results.warnings && results.warnings.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Warnings:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
            {results.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RamDisplay;
