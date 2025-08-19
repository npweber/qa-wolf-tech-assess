import React, { Component } from 'react';

interface StatusDisplayProps {
  status: 'not run' | 'running' | 'failed' | 'passed';
  failedAt?: string;
  passedAt?: string;
}

// StatusDisplay component: Displays the status of a test
class StatusDisplay extends Component<StatusDisplayProps> {
    render() {
        switch (this.props.status) {
            case 'not run':
              return (
                /* Not run */
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">Not run</span>
                  <svg className="w-4 h-4 text-gray-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              );
            case 'running':
              /* Running */
              return <span className="text-blue-500 animate-pulse">Running...</span>;
            case 'failed':
              /* Failed */
              return (
                <div className="flex items-center justify-center">
                  <span className="text-red-500">Failed at {this.props.failedAt}</span>
                  <svg className="w-4 h-4 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              );
            case 'passed':
              /* Passed */
              return (
                <div className="flex items-center justify-center">
                  <span className="text-green-500">Passed at {this.props.passedAt}</span>
                  <svg className="w-4 h-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              );
            default:
              /* Unknown */
              return <span className="text-gray-500">Unknown</span>;
        }
    }
}

export default StatusDisplay;