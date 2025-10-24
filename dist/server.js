"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const server = new mcp_js_1.McpServer({ name: 'demo-server', version: '1.0.0' });
// Register tools
server.registerTool('add', {
    title: 'Addition Tool',
    description: 'Add two numbers',
    inputSchema: { a: zod_1.z.number(), b: zod_1.z.number() },
    outputSchema: { result: zod_1.z.number() }
}, async ({ a, b }) => ({
    content: [{ type: 'text', text: JSON.stringify({ result: a + b }) }],
    structuredContent: { result: a + b }
}));
// Register resources
server.registerResource('greeting', new mcp_js_1.ResourceTemplate('greeting://{name}', { list: undefined }), {
    title: 'Greeting Resource',
    description: 'Dynamic greeting generator'
}, async (uri, { name }) => ({
    contents: [{ uri: uri.href, text: `Hello, ${name}!` }]
}));
// Simple tool with parameters
server.registerTool('calculate-bmi', {
    title: 'BMI Calculator',
    description: 'Calculate Body Mass Index',
    inputSchema: {
        weightKg: zod_1.z.number(),
        heightM: zod_1.z.number()
    },
    outputSchema: { bmi: zod_1.z.number() }
}, async ({ weightKg, heightM }) => {
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
});
// Async tool with external API call
server.registerTool('fetch-weather', {
    title: 'Weather Fetcher',
    description: 'Get weather data for a city',
    inputSchema: { city: zod_1.z.string() },
    outputSchema: { temperature: zod_1.z.number(), conditions: zod_1.z.string() }
}, async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.json();
    const output = { temperature: data.temp, conditions: data.conditions };
    return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output
    };
});
// Tool that returns ResourceLinks
server.registerTool('list-files', {
    title: 'List Files',
    description: 'List project files',
    inputSchema: { pattern: zod_1.z.string() },
    outputSchema: {
        count: zod_1.z.number(),
        files: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), uri: zod_1.z.string() }))
    }
}, async ({ pattern }) => {
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
});
// Use stdio transport for MCP Inspector compatibility
const transport = new stdio_js_1.StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=server.js.map