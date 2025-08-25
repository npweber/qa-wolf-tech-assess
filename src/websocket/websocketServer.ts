import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, isValidWebSocketMessage } from '@/types/websocketMessage';
import { safeJsonParse, safeJsonStringify } from '@/app/lib/util';

// TestWebSocketServer class: Handle communication between the consoleOutputPoster and the consoleOutputListener
export class TestWebSocketServer {
  /* WebSocketServer instance */
  private wss: WebSocketServer;
  /* Set of connected clients: Maximum of 2 clients */
  private clients: Set<WebSocket> = new Set();

  // Constructor: Creates and sets up a web socket server instance
  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
  }

  // Setup the web socket server
  private setupWebSocketServer(): void {
    // Handle new client connections
    this.wss.on('connection', (ws: WebSocket) => {
        // If the number of connected clients is less than 2, add the new client to the clients set
        if(this.getConnectedClientsCount() < 2) {
            // Add the new web socket client to the clients set
            this.clients.add(ws);
            
            // Log the new web socket client connection and the total number of connected clientss
            console.log('TestWebSocketServer: New client connected. Total clients: ' + this.getConnectedClientsCount());

            // Handle incoming messages from the client
            ws.on('message', (message: string) => {
                // Try to handle the message
                try {
                    // Safe JSON parse the message and handle it
                    this.handleMessage(ws, safeJsonParse(message));
                } catch (error) {
                    // Log a warning if the message handling fails
                    console.warn(`TestWebSocketServer: WARNING: Handling message failed: ${error}. Message: ${message}`);
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                this.clients.delete(ws);  
                console.log(`TestWebSocketServer: Client disconnected. Total clients: ${this.getConnectedClientsCount()}`);
            });

            // Handle connection errors
            ws.on('error', (error) => {
                console.error(`TestWebSocketServer: ERROR: Client error: ${error}`);
                this.clients.delete(ws);
            });
        } else {
            // If the number of connected clients is greater than or equal to 2, 
            // send an error message to the new client, stating that the web socket server is full.
            this.sendToClient(ws, {
                type: 'error',
                data: { message: 'MAX_CLIENTS_REACHED', testName: 'NONE' },
                timestamp: new Date().toISOString()
            });
        }
    });
    console.log(`TestWebSocketServer: Started on port ${this.wss.options.port}`);
  }

  // Handle a message from the ConsoleOutputPoster, and send it to the ConsoleOutputListener
  // (2 clients: ConsoleOutputPoster and ConsoleOutputListener)
  private handleMessage(ws: WebSocket, message: WebSocketMessage) : void {
    // Get the other client (ConsoleOutputListener)
    const otherClient = Array.from(this.clients).find(client => client !== ws);
    // If the other client (ConsoleOutputListener) is found, 
    // send the message to the ConsoleOutputListener.
    if (otherClient) {
        switch (message.type) {
            case 'test_output': {
                console.log(`TestWebSocketServer: Received test output: ${message.data.message} for test: ${message.data.testName} from ConsoleOutputPoster.`);
                this.sendToClient(otherClient, message);
                break;
            }
            case 'test_status': {
                console.log(`TestWebSocketServer: Received test status: ${message.data.message} for test: ${message.data.testName} from ConsoleOutputPoster.`);
                this.sendToClient(otherClient, message);
                break;
            }
            // If the message is an unknown type, throw an error
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    // If the other client (ConsoleOutputListener) is not found, throw an error
    } else {
      throw new Error('No ConsoleOutputListener to send message to.');
    }
  }

  // Send a message to a client
  private sendToClient(ws: WebSocket, message: WebSocketMessage) : void {
    // If the client is open, send the message
    if (ws.readyState === WebSocket.OPEN) {
      // If the message is valid, send it to the client,
      // after safe JSON stringifying it.
      if (isValidWebSocketMessage(message)) {
        try {
          ws.send(safeJsonStringify(message));
          console.log('TestWebSocketServer: Sent message to client.');
        } catch (error) {
          console.warn(`TestWebSocketServer: WARNING: Could not send message: ${error}`);
        }
      // If the message is invalid, log a warning
      } else {
        console.warn('TestWebSocketServer: WARNING: Cannot send message. Invalid message format');
      }
    // If the client is not open, log a warning
    } else {
      console.warn('TestWebSocketServer: WARNING: Client is not open. Could not send message.');
    }
  }

  // Get the number of connected clients
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Close the web socket server
  public close() : void {
    this.wss.close();
    console.log('TestWebSocketServer: Closed');
  }
}

// Export singleton instance
let websocketServer: TestWebSocketServer | null = null;

// Get the web socket server
export function getWebSocketServer(port?: number): TestWebSocketServer {
  if (!websocketServer) {
    websocketServer = new TestWebSocketServer(port);
  }
  return websocketServer;
}

// Close the web socket server
export function closeWebSocketServer() : void {
  if (websocketServer) {
    websocketServer.close();
    websocketServer = null;
  }
}
