import { isValidWebSocketMessage, WebSocketMessage } from '@/types/websocketMessage';
import { safeJsonParse, safeJsonStringify } from '@/app/lib/util';

// TestWebSocketService class: Handles the web socket connection for the 
// console output listener and console output poster
export class TestWebSocketService {
  /* WebSocket object */
  private ws: WebSocket | null = null;
  /* URL of the web socket server */
  private url: string;

  /* Constructor: Sets the URL of the web socket server */
  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  /* Connect to the web socket server */
  connect(onMessage: (message: WebSocketMessage) => void, onStatusChange: (connected: boolean) => void) : void {
    /* Try to connect to the web socket server */
    try {
      this.ws = new WebSocket(this.url);

      /* If the web socket is connected, log the connection and update the connection status */
      this.ws.onopen = () => {
        console.log('TestWebSocketService: Connected');
        onStatusChange(true);
      };

      /* 
         If the web socket receives a message, safe JSON parse the message and call the onMessage callback
         If the message cannot be parsed, log a warning and continue
      */
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = safeJsonParse(event.data);
          console.log(`TestWebSocketService: Received message: ${message.type} from web socket server. Message: ${message.data}`);
          onMessage(message);
        } catch (error) {
          console.warn(`TestWebSocketService: WARNING: Could not handle message: ${error}. Message: ${event.data}`);
        }
      };

      /* If the web socket is closed, log the disconnection and update the connection status */
      this.ws.onclose = () => {
        console.log('TestWebSocketService: Disconnected');
        onStatusChange(false);
      };

      /* If the web socket encounters an error, update the connection status and log the error */
      this.ws.onerror = (error) => {
        this.disconnect();
        onStatusChange(false);
        console.error(`TestWebSocketService: ERROR: WebSocket error: ${error}`);
      };

    /* If the web socket connection fails, update the connection status, disconnect and log the error */
    } catch (error: any) {
      this.disconnect();
      onStatusChange(false);
      console.error(`TestWebSocketService: ERROR: Failed to create connection: ${error.message}`);
    }
  }

  /* Disconnect from the web socket server */
  disconnect() : void {
    /* If the web socket is connected, close the connection */
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /* Send a message to the web socket server */
  send(message: WebSocketMessage) : void {
    /* 
     * If the web socket is connected and valid, 
     * send the message, after safe JSON stringifying it.
     */
    if (this.ws && this.isConnected()) {
      if (isValidWebSocketMessage(message)) {
          try {
            this.ws.send(safeJsonStringify(message));
            console.log('TestWebSocketService: Sent message to web socket server.');
          } catch (error) {
            console.warn(`TestWebSocketService: WARNING: Could not send message: ${error}`);
          }
      /* If the message is invalid, log a warning */
      } else {
        console.warn('TestWebSocketService: WARNING: Cannot send message. Invalid message format');
      }
    /* If the web socket is not connected, log a warning */
    } else {
      console.warn('TestWebSocketService: WARNING: Cannot send message. Not connected');
    }
  }

  /* Check if the web socket is connected */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
