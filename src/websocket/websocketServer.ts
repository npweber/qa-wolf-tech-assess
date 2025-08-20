import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage } from '@/app/types/websocketMessage';

// TestWebSocketServer class: Handle communication between the test runner and the client console output
export class TestWebSocketServer {
  /* WebSocketServer instance */
  private wss: WebSocketServer;
  /* Set of connected clients */
  private clients: Set<WebSocket> = new Set();

  // Constructor: Creates a web socket server instance
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
            // Log the new web socket client connection and add it to the clients set
            console.log('New WebSocket client connected');
            this.clients.add(ws);

            // Send connection status to the client
            this.sendToClient(ws, {
                type: 'connection_status',
                data: { status: 'connected' },
                timestamp: new Date().toISOString()
            });

            // Handle incoming messages from the client
            ws.on('message', (message: string) => {
                try {
                    // Parse the message from the client
                    const parsedMessage = JSON.parse(message);
                    // Handle the message from the client
                    this.handleMessage(ws, parsedMessage);
                } catch (error) {
                    // If the message is invalid, send an error message to the client
                    console.error('Error parsing WebSocket message:', error);
                    this.sendToClient(ws, {
                        type: 'test_output',
                        data: { error: 'Invalid message' },
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });

            // Handle connection errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        } else {
            // If the number of connected clients is greater than or equal to 2, send an error message to the new client
            console.error('TestWebSocketServer: Maximum number of clients reached, closing connection');
            this.sendToClient(ws, {
                type: 'test_output',
                data: { error: 'Maximum number of clients reached, closing connection' },
                timestamp: new Date().toISOString()
            });
            // Close the connection to the new client
            ws.close();
        }
    });
    console.log(`WebSocket server started on port ${this.wss.options.port}`);
  }

  // TODO: Handle a message from a client
  private handleMessage(ws: WebSocket, message: any) {
        switch (message.type) {
            // If the message is a test output, send it to the other client, 
            // aka, the test process output listener
            case 'test_output': {
                this.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN)
                        this.sendToClient(client, message);
                });
                break;
            }
            case 'test_status':
                // TODO: Handle a test status message
                break;
            case 'connection_status':
                // TODO: Handle a connection status message
                break;
            default:
                console.warn('TestWebSocketServer: Unknown message type:', message.type);
        }
    }

  // Send a message to a client
  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast a message to all clients
  private broadcast(message: WebSocketMessage) {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  // Get the number of connected clients
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Close the web socket server
  public close() {
    this.wss.close();
    console.log('WebSocket server closed');
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
export function closeWebSocketServer() {
  if (websocketServer) {
    websocketServer.close();
    websocketServer = null;
  }
}
