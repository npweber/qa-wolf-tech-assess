import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { Test } from '@/types/test';
import { safeJsonParse, safeJsonStringify } from '@/app/lib/util';

// Get all tests from the tests directory
export async function GET() : Promise<NextResponse<{ tests: Test[] } | { error: string }>> {
    let response: NextResponse<{ tests: Test[] } | { error: string }>;

    // Initialize an empty array to store the tests
    const tests: Test[] = [];

    try {
        // Try to read the tests directory
        const testsDirFiles: fs.Dirent[] = fs.readdirSync(path.join(process.cwd(), 'src/tests'), {
            encoding: 'utf8',
            withFileTypes: true
        });

        // If there are tests, parse the JSON data and add it to the tests array
        if (testsDirFiles.length > 0) {
            testsDirFiles.forEach((file: fs.Dirent) => {
                if (file.isFile() && file.name.endsWith('.json')) {
                    const testData: Test = safeJsonParse(fs.readFileSync(path.join(process.cwd(), 'src/tests', file.name), 'utf8'));
                    tests.push(testData);
                }
            });
        }
        response = NextResponse.json({ tests: tests }, { status: 200 });
    // If there is an error, return a 500 error and the error message
    } catch (error) {
        response = NextResponse.json({ error: `Failed to read tests directory: ${error}` }, { status: 500 });
    }
    return response;
}

// Update a test by name
export async function POST(request: NextRequest) : Promise<NextResponse<{ message: string } | { error: string }>> {
    let response: NextResponse<{ message: string } | { error: string }>;

    // If no request body is provided, return a 400 error
    if (!request.body) {
        response = NextResponse.json({ error: 'No body provided' }, { status: 400 });
    }
    else {
        // If the request body is provided, get the test
        const { test } : { test: Test } = await request.json();
        // If no test is provided, return a 400 error
        if (!test) {
            response = NextResponse.json({ error: 'No test provided' }, { status: 400 });
        }
        // If the test is provided, get the test name
        else {
            // If the test name is not provided, return a 400 error
            if (!test.name) {
                response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
            }
            // If the test name is provided, try to update the test file
            else {
                // Get the test file path
                const testFile: string = path.join(process.cwd(), 'src/tests', test.name + '.json');

                // Try to update the test file
                try {
                    // If the test file does not exist, return a 404 error
                    if (!fs.existsSync(testFile)) {
                        response = NextResponse.json({ error: 'Test file not found' }, { status: 404 });
                    }
                    // If the test file exists, try to update the test file
                    else {
                        fs.writeFileSync(testFile, safeJsonStringify(test));
                        response = NextResponse.json({ message: `Test "${test.name}" updated successfully` }, { status: 200 });
                    }
                // If there is an error, return a 500 error
                } catch (error) {
                    response = NextResponse.json({ error: `Failed to update test file: ${error}` }, { status: 500 });
                }
            }
        }    
    }
    return response;
}