// WebSocketMessage interface: Represents a web socket message
export interface WebSocketMessage {
    /* Type of message: test output, test status, or connection status */
    type: 'test_output' | 'test_status' | 'connection_status';
    /* Data of the message */
    data: any;
    /* Timestamp of the message */
    timestamp: string;
  }