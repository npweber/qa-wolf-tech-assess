'use client';

import React, { useEffect, useRef } from 'react';

interface ConsoleOutputProps {
  output: string[];
  isConnected: boolean;
}

// ConsoleOutput component: Displays the console output of a test
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, isConnected }) => {

  /* Reference to the console div */
  const consoleRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom when new output is added */
  useEffect(() => {
    /* If the console div is not null, scroll to the bottom */
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Console Output</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Console Content */}
      <div 
        ref={consoleRef}
        className="flex-1 bg-black text-green-400 font-mono text-sm p-4 rounded-lg overflow-y-auto"
        style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
      >
        {
        /* If there is no output, display a waiting message */
        output.length === 0 ? (
          <div className="text-gray-500 italic">
            Waiting for test output...
          </div>
        ) : (
          /* If there is output, map each line of output to a div with a key and a whitespace-pre-wrap class */
          output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))
        )}
      </div>

      {/* Console Footer */}
      <div className="mt-2 text-xs text-gray-500">
        {output.length > 0 && (
          <span>{output.length} line{output.length !== 1 ? 's' : ''} of output</span>
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
