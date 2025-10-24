import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'demo-server', version: '1.0.0' });

// Register tools
server.registerTool('add', {
  title: 'Addition Tool',
  description: 'Add two numbers',
  inputSchema: { a: z.number(), b: z.number() },
  outputSchema: { result: z.number() }
}, async ({ a, b }) => ({
  content: [{ type: 'text', text: JSON.stringify({ result: a + b }) }],
  structuredContent: { result: a + b }
}));

// Register resources
server.registerResource('greeting', new ResourceTemplate('greeting://{name}', { list: undefined }), {
  title: 'Greeting Resource',
  description: 'Dynamic greeting generator'
}, async (uri, { name }) => ({
  contents: [{ uri: uri.href, text: `Hello, ${name}!` }]
}));



// Simple tool with parameters
server.registerTool(
  'calculate-bmi',
  {
      title: 'BMI Calculator',
      description: 'Calculate Body Mass Index',
      inputSchema: {
          weightKg: z.number(),
          heightM: z.number()
      },
      outputSchema: { bmi: z.number() }
  },
  async ({ weightKg, heightM }) => {
      const output = { bmi: weightKg / (heightM * heightM) };
      return {
          content: [
              {
                  type: 'text',
                  text: JSON.stringify(output)
              }
          ],
          structuredContent: output
      };
  }
);

// Async tool with external API call
server.registerTool(
  'fetch-weather',
  {
      title: 'Weather Fetcher',
      description: 'Get weather data for a city',
      inputSchema: { city: z.string() },
      outputSchema: { temperature: z.number(), conditions: z.string() }
  },
  async ({ city }) => {
      const response = await fetch(`https://api.weather.com/${city}`);
      const data = await response.json();
      const output = { temperature: data.temp, conditions: data.conditions };
      return {
          content: [{ type: 'text', text: JSON.stringify(output) }],
          structuredContent: output
      };
  }
);

// Tool that returns ResourceLinks
server.registerTool(
  'list-files',
  {
      title: 'List Files',
      description: 'List project files',
      inputSchema: { pattern: z.string() },
      outputSchema: {
          count: z.number(),
          files: z.array(z.object({ name: z.string(), uri: z.string() }))
      }
  },
  async ({ pattern }) => {
      const output = {
          count: 2,
          files: [
              { name: 'README.md', uri: 'file:///project/README.md' },
              { name: 'index.ts', uri: 'file:///project/src/index.ts' }
          ]
      };
      return {
          content: [
              { type: 'text', text: JSON.stringify(output) },
              // ResourceLinks let tools return references without file content
              {
                  type: 'resource_link',
                  uri: 'file:///project/README.md',
                  name: 'README.md',
                  mimeType: 'text/markdown',
                  description: 'A README file'
              },
              {
                  type: 'resource_link',
                  uri: 'file:///project/src/index.ts',
                  name: 'index.ts',
                  mimeType: 'text/typescript',
                  description: 'An index file'
              }
          ],
          structuredContent: output
      };
  }
);









// Use stdio transport for MCP Inspector compatibility
const transport = new StdioServerTransport();
await server.connect(transport);
