import './App.css'; // Keep or modify for global styles
import RamCalculator from './components/RamCalculator/RamCalculator';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">LLM RAM Requirement Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Estimate the System RAM needed to run Large Language Models locally.
          </p>
        </header>
        <main>
          <RamCalculator />
        </main>
        <footer className="mt-8 text-center text-xs text-gray-500">
          <p>Note: Calculations are estimates. Actual RAM usage can vary based on specific model architecture, software, and other system factors.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
