import { NextRequest, NextResponse } from 'next/server';
import { execCommandRealtime, RealtimeOutput } from '@/app/lib/execRealtime';
import { TestWebSocketService } from '@/app/services/websocketService';
import { WebSocketMessage } from '@/types/websocketMessage';
import { formatTimestampTestOutput } from '@/app/lib/util';

// Run a test by name
export async function POST(request: NextRequest) : Promise<NextResponse<{ message: string } | { error: string }>> {
    let response: NextResponse<{ message: string } | { error: string }>;

    // If no request body is provided, return a 400 error
    if (!request.body) {
        console.error('POST /api/run-test: Failed to run test: No request body provided');
        response = NextResponse.json({ error: 'No request body provided' }, { status: 400 });
    }
    // If the request body is provided, get the test name
    else {
        const requestBody = await request.json();
        const testName = requestBody.testName as string;
        // If no test name is provided, return a 400 error
        if (!testName) {
            console.error('POST /api/run-test: Failed to run test: No test name provided');
            response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
        }
        // If the test name is provided, run the test
        else {
            // Run the test and return the response
            response = await runTestServer(testName.concat('.spec.ts'));

            // If the test is successful, log the message
            if (response.status == 200) 
                console.log(`POST /api/run-test: Test "${testName}" ran successfully`);
        }
    }
    return response;
}

// Run a test by file name
async function runTestServer(testFile: string): Promise<NextResponse<{ message: string } | { error: string }>> {
    // Return a response when the test result is ready
    return new Promise<NextResponse<{ message: string } | { error: string }>>((resolve, reject) => {
        // ConsoleOutputPoster: Posts test output to the web socket server
        const consoleOutputPoster: TestWebSocketService = new TestWebSocketService();

        // Handle web socket messages
        const handleWebSocketMessage = (message: WebSocketMessage) => {
            // Only needs to handle errors from the web socket server.
            // All other message types are not sent to the console output listener.
            if (message.type === 'error') {
                // If the server says it is full, disconnect, log an error and reject the promise
                if (message.data.message === 'MAX_CLIENTS_REACHED') {
                    consoleOutputPoster.disconnect();
                    console.error('TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.');
                    reject(NextResponse.json({ error: 'TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.' }, { status: 500 }));
                }
                // If any other error occurs, disconnect, log an error and reject the promise
                else {
                    consoleOutputPoster.disconnect();
                    console.error(`TestWebSocketService: ERROR: ${message.data.message}`);
                    reject(NextResponse.json({ error: `TestWebSocketService: ERROR: ${message.data.message}` }, { status: 500 }));
                }
            }
        };

        // On web socket status change, run the test if the web socket is connected
        const handleWebSocketStatusChange = (connected: boolean) => {
            if (connected && consoleOutputPoster.isConnected()) {
                // Run the test using the playwright test <file> command
                const command = `npx playwright test ${testFile}`;

                // Run the test and post the console output to the web socket server
                execCommandRealtime(command, (onOutput: RealtimeOutput) => {
                    // If the connection is still open, post the console output to the web socket server
                    if (connected && consoleOutputPoster.isConnected()) 
                        // Post the console output to the web socket server
                        consoleOutputPoster.send({
                            type: 'test_output',
                            data: { message: onOutput.line },
                            timestamp: formatTimestampTestOutput(new Date())
                        });
                // If the test is finished, disconnect from the web socket server and resolve the promise
                }).then(() => {
                    consoleOutputPoster.disconnect();
                    resolve(NextResponse.json({ message: 'Test run successfully' }, { status: 200 }));
                // If the test fails, disconnect from the web socket server and reject the promise
                }).catch((error: any) => {
                    consoleOutputPoster.disconnect();
                    reject(NextResponse.json({ error: `Failed to run test "${testFile}": ${error.message}` }, { status: 500 }));
                });
            }
        }

        // Connect to the web socket server to run the test while 
        // posting the console output to the web socket server
        consoleOutputPoster.connect(handleWebSocketMessage, handleWebSocketStatusChange);
    });
}