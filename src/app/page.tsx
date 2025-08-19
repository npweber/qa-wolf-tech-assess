import React from 'react';

export default function Home() {
  return (
    <>
      {/* Left Panel - Tests List Section */}
      <div className="flex-1 border-2 p-6">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Tests List Section
            </h2>
            <p className="text-gray-500">
              Content will be displayed here
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Console Output Section */}
      <div className="flex-1 border-2 p-6">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Console Output Section
            </h2>
            <p className="text-gray-500">
              Content will be displayed here
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
