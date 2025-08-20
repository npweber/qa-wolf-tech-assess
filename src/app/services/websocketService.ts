import { WebSocketMessage } from '../types/websocketMessage';

// WebSocketService class: Handles the web socket connection
export class WebSocketService {
  /* WebSocket object */
  private ws: WebSocket | null = null;
  /* URL of the web socket server */
  private url: string;

  /* Constructor: Sets the URL of the web socket server */
  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  /* Connect to the web socket server */
  connect(onMessage: (message: WebSocketMessage) => void, onStatusChange: (connected: boolean) => void) {
    /* Try to connect to the web socket server */
    try {
      this.ws = new WebSocket(this.url);

      /* If the web socket is connected, log the connection and update the connection status */
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        onStatusChange(true);
      };

      /* If the web socket receives a message, parse the message and call the onMessage callback */
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      /* If the web socket is closed, log the disconnection and update the connection status */
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        onStatusChange(false);
      };

      /* If the web socket encounters an error, update the connection status */
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onStatusChange(false);
      };

    /* If the web socket connection fails, update the connection status and log the error */
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onStatusChange(false);
    }
  }

  /* Disconnect from the web socket server */
  disconnect() {
    /* If the web socket is connected, close the connection */
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /* Send a message to the web socket server */
  send(message: any) {
    /* If the web socket is connected, send the message */
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      /* If the web socket is not connected, log a warning */
      console.warn('WebSocketService: WebSocket is not connected');
    }
  }

  /* Check if the web socket is connected */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
