'use client';

import React, { useState, useEffect } from 'react';
import StatusDisplay from '@/app/component/statusDisplay';
import ConsoleOutput from '@/app/component/consoleOutput';
import { Test } from '@/types/test';
import { WebSocketMessage } from '@/types/websocketMessage';
import { TestWebSocketService } from '@/app/services/websocketService';

// Home component: Main page of the application
export default function Home() {
  /* State variables: tests and running all flag */
  const [tests, setTests] = useState<Test[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  /* Console output, connection status, 
  and web socket service state variables */
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [consoleOutputListener] = useState(() => new TestWebSocketService());

  /* Fetch tests from server */
  useEffect(() => {
    fetch('/api/tests').then(res => res.json()).then(data => setTests(data as Test[]));
  }, []);

  /* WebSocket connection setup */
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketMessage) => {
      /* Handle the message based on the type */
      switch (message.type) {
        /* If the message is type test_output, append it to the console output */
        case 'test_output': {
          setConsoleOutput(prev => [...prev, `[${message.timestamp}] ${message.data.message}`]);
          break;
        }
        /* If the message is type error, handle the error */
        case 'error': {
          /* If the error is that the web socket server is full, disconnect and log an error */
          if (message.data.message === 'MAX_CLIENTS_REACHED') {
            consoleOutputListener.disconnect();
            console.error('TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.');
          }
          /* If the error is any other type, disconnect and log the error */
          else {
            consoleOutputListener.disconnect();
            console.error(`TestWebSocketService: ERROR: ${message.data.message}`);
          }
          break;
        }
        // TODO: Handle test status
        case 'test_status': {
          
        }
      }
    };

    /* If the connection status changes, update the connection status state variable */
    const handleWebSocketStatusChange = (connected: boolean) => setIsWebSocketConnected(connected);

    /* Connect to the web socket server */
    consoleOutputListener.connect(handleWebSocketMessage, handleWebSocketStatusChange);

    /* Disconnect from the web socket server when the component unmounts */
    return () => {
      consoleOutputListener.disconnect();
    };
  }, [consoleOutputListener]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const runTest = async (testId: string) => {
    /* Find the test in the tests array */
    const test = tests.find(t => t.id === testId) as Test;
    /* If the test is not found, return */
    if (!test) {   
      console.error(`Run test failed: Test not found: ${testId}`);
      return;
    }

    /* Update the test status to running */
    tests.map(test => test.id === testId ? { ...test, status: 'running' } : test);
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running' } : test
    ));

    try {
      /* Update the test status to running on the server */
      fetch(`/api/tests`, {
        method: 'POST',
        body: JSON.stringify({ test: test as Test })
      });

      /* Run the test on the server */
      fetch(`/api/run-test`, {
        method: 'POST',
        body: JSON.stringify({ testName: test.name })
      });

      /* Simulate API call to run test */
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      /* Use random pass/fail */
      const isPassed = Math.random() > 0.3;

      /* Format the timestamp passedAt or failedAt at this moment */
      const timestamp = formatTimestamp(new Date());
      
      /* Update the test status to passed or failed */
      tests.map(test => test.id === testId ? {
        ...test, 
        status: isPassed ? 'passed' : 'failed', 
        passedAt: isPassed ? timestamp : undefined, 
        failedAt: !isPassed ? timestamp : undefined 
      } : test);
      setTests(prev => prev.map(test => 
        test.id === testId ? {
          ...test,
          status: isPassed ? 'passed' : 'failed',
          passedAt: isPassed ? timestamp : undefined,
          failedAt: !isPassed ? timestamp : undefined,
        } : test
      ));
    } catch (error) {
      /* Update the test status to failed if an error occurs */
      // TODO: Handle error
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'failed', failedAt: formatTimestamp(new Date()) } : test
      ));
    }

    fetch(`/api/tests`, {
      method: 'POST',
      body: JSON.stringify({ test: test as Test })
    });
  };

  const runAllTests = async () => {
    /* Set the running all flag to true */
    setIsRunningAll(true);
    
    /* Run each test sequentially */
    for (const test of tests) {
      await runTest(test.id);
      /* Small delay between tests */
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningAll(false);
  };

  return (
    <>
      {/* Left Panel - Tests List Section */}
      <div className="flex-1 border-2 p-6">
        <div className="h-full flex flex-col">
          {/* Header with Title and Run All Button */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Tests
            </h2>
            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isRunningAll ? 'Running All...' : 'Run All'}
            </button>
          </div>

          {/* Horizontal Rule */}
          <hr className="my-4 border-1"></hr>

          {/* Tests List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  {/* Script Icon */}
                  <div className="flex items-center w-8">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Test Name */}
                  <div className="flex-1 ml-4">
                    <span className="font-mono text-sm text-gray-800">{test.name}</span>
                  </div>

                  {/* Test Status */}
                  <div className="flex-1 text-center">
                    <StatusDisplay status={test.status} failedAt={test.failedAt} passedAt={test.passedAt} />
                  </div>

                  {/* Run Button */}
                  <div className="flex items-center w-20 justify-end">
                    <button
                      onClick={() => runTest(test.id)}
                      disabled={test.status === 'running' || isRunningAll}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                    >
                      {test.status === 'running' ? 'Running' : 'Run'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Console Output Section */}
      <div className="flex-1 border-2 p-6">
        <ConsoleOutput 
          output={consoleOutput} 
          isConnected={isWebSocketConnected} 
        />
      </div>
    </>
  );
}
