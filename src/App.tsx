import { useState } from 'react'
import './App.css'

function calculateRam(
  paramsBillions: number,
  precisionBits: number,
  layers: number,
  hiddenSize: number,
  seqLen: number,
) {
  const bytesPerParam = precisionBits / 8
  const weights =
    (paramsBillions * 1e9 * bytesPerParam) / Math.pow(1024, 3)
  const kvCache =
    (layers * seqLen * hiddenSize * 2 * bytesPerParam) /
    Math.pow(1024, 3)
  return weights + kvCache
}

function App() {
  const [params, setParams] = useState(7)
  const [precision, setPrecision] = useState(16)
  const [layers, setLayers] = useState(32)
  const [hiddenSize, setHiddenSize] = useState(4096)
  const [seqLen, setSeqLen] = useState(2048)

  const requiredRam = calculateRam(
    params,
    precision,
    layers,
    hiddenSize,
    seqLen,
  )

  return (
    <div className="container">
      <h1>LLM Inference RAM Calculator</h1>
      <div className="calculator">
        <label>
          Model Parameters (billions)
          <input
            type="number"
            step="0.1"
            value={params}
            onChange={(e) => setParams(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label>
          Precision (bits)
          <select
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
          >
            <option value={16}>16</option>
            <option value={8}>8</option>
            <option value={4}>4</option>
          </select>
        </label>
        <label>
          Number of Layers
          <input
            type="number"
            value={layers}
            onChange={(e) => setLayers(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Hidden Size
          <input
            type="number"
            value={hiddenSize}
            onChange={(e) => setHiddenSize(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Sequence Length
          <input
            type="number"
            value={seqLen}
            onChange={(e) => setSeqLen(parseInt(e.target.value) || 0)}
          />
        </label>
      </div>
      <p className="result">Estimated Required RAM: {requiredRam.toFixed(2)} GiB</p>
    </div>
  )
}

export default App
