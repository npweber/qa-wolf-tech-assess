import { NextRequest, NextResponse } from 'next/server';
import { execCommandRealtime, RealtimeOutput } from '@/app/lib/execRealtime';

// Run a test by name
export async function POST(request: NextRequest) {
    let response: NextResponse;

    // If no request body is provided, return a 400 error
    if (!request.body) {
        console.error('Failed to run test: No request body provided');
        response = NextResponse.json({ error: 'No request body provided' }, { status: 400 });
    }
    // If the request body is provided, get the test name
    else {
        const requestBody = await request.json();
        const testName = requestBody.testName as string;
        // If no test name is provided, return a 400 error
        if (!testName) {
            console.error('Failed to run test: No test name provided');
            response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
        }
        // If the test name is provided, run the test
        else {
            const testFile = testName.concat('.spec.ts');
            // Try to run the test
            try {
                runTestServer(testFile);
                response = NextResponse.json({ message: 'Test run successfully' }, { status: 200 });
            // If an error occurs, return a 500 error and log the error
            } catch (error) {
                console.error('Failed to run test:', error);
                response = NextResponse.json({ error: 'Failed to run test' }, { status: 500 });
            }
        }
    }
    return response;
}

// Run a test by file name
function runTestServer(testFile: string): void {
    // Run the test using the playwright test <file> command
    const command = `npx playwright test ${testFile}`;

    // Try to run the test using the a realtime console executor
    try {
        // Run the test and log the output
        execCommandRealtime(command, (onOutput: RealtimeOutput) => console.log(onOutput.line));
    // If an error occurs, throw it
    } catch (error) {
        throw error;
    }
}