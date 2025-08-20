import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { Test } from '@/app/types/test';

// Get all tests from the tests directory
export async function GET(request: NextRequest) {
    // Initialize an empty array to store the tests
    const tests: Test[] = [];

    try {
        // Try to read the tests directory
        const testsDirFiles = fs.readdirSync(path.join(process.cwd(), 'src/tests'), {
            encoding: 'utf8',
            withFileTypes: true
        });

        // If there are tests, parse the JSON data and add it to the tests array
        if (testsDirFiles.length > 0) {
            testsDirFiles.forEach(file => {
                if (file.isFile() && file.name.endsWith('.json')) {
                    const testData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/tests', file.name), 'utf8'));
                    tests.push(testData);
                }
            });
        }
    // If there is an error, return a 500 error and log the error
    } catch (error) {
        console.error('Failed to read tests directory:', error);
        return NextResponse.json({ error: 'Failed to read tests directory' }, { status: 500 });
    }

    return NextResponse.json(tests);
}

export async function POST(request: NextRequest) {
    let response: NextResponse;

    // Get the test & test json file from the request body
    if (!request.body) {
        console.error('Failed to update test file: No test provided');
        response = NextResponse.json({ error: 'No test provided' }, { status: 400 });
    }

    const { test } : { test: Test } = await request.json();
    if (!test) {
        console.error('Failed to update test file: No test provided');
        response = NextResponse.json({ error: 'No test provided' }, { status: 400 });
    }
    else if (!test.name) {
        console.error('Failed to update test file: No test name provided');
        response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
    }
    // If the test is valid, update the test file
    else {
        const testFile = path.join(process.cwd(), 'src/tests', test.name + '.json');
        // Try to update the test file
        try {
            fs.writeFileSync(testFile, JSON.stringify(test, null, 2));
            response = NextResponse.json({ message: 'Test file updated successfully' }, { status: 200 });
        // If there is an error, return a 500 error and log the error
        } catch (error) {
            console.error('Failed to update test file:', error);
            response = NextResponse.json({ error: 'Failed to update test file' }, { status: 500 });
        }
    }    
    return response;
}