import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Get all tests from the tests directory
export async function GET(request: NextRequest) {
    // Initialize an empty array to store the tests
    const tests: any[] = [];

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