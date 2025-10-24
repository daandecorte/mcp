// Simple test script to verify MCP server works
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP Server...\n');

// Start the server
const server = spawn('npx', ['tsx', 'server.ts'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test message
const testMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

console.log('Sending test message:', JSON.stringify(testMessage, null, 2));

// Send the test message
server.stdin.write(JSON.stringify(testMessage) + '\n');

// Handle responses
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Clean up after 3 seconds
setTimeout(() => {
  console.log('\nTest completed. Closing server...');
  server.kill();
  process.exit(0);
}, 3000);
