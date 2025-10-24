const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

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
server.registerPrompt(
    'team-greeting',
    {
        title: 'Team Greeting',
        description: 'Generate a greeting for team members',
        argsSchema: {
            department: z.string(),
            name: z.string()
        }
    },
    ({ department, name }) => ({
        messages: [
            {
                role: 'assistant',
                content: {
                    type: 'text',
                    text: `Hello ${name}, welcome to the ${department} team!`
                }
            }
        ]
    })
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

// Fake Motivational Quotes Resource
server.registerResource('fake-quotes', new ResourceTemplate('quotes://fake', { list: undefined }), {
  title: 'Fake Motivational Quotes',
  description: 'Collection of motivational quotes that make no sense'
}, async (uri) => ({
  contents: [{ 
    uri: uri.href, 
    text: `Fake Motivational Quotes Collection:
    
"If life gives you lemons, trade them for Bitcoin."
"Success is 99% perspiration and 1% remembering to hydrate."
"The early bird gets the worm, but the second mouse gets the cheese."
"You miss 100% of the shots you don't take, but you also miss 100% of the shots you do take if you're blindfolded."
"Dream big, but not so big that you wake up in a different time zone."
"Failure is not an option, but neither is success if you don't have Wi-Fi."
"The only way to do great work is to love what you do, especially if what you do is nap."
"Be yourself, unless you can be Batman, then be Batman."
"Life is what happens when you're busy making other plans, and those plans involve more coffee."
"Don't count your chickens before they hatch, but do count your eggs before they become chickens."`
  }]
}));

// Fake Motivational Quotes Tool
server.registerTool(
  'get-fake-quote',
  {
      title: 'Get Fake Motivational Quote',
      description: 'Return a random motivational quote that makes no sense',
      inputSchema: {},
      outputSchema: { 
          quote: z.string(),
          author: z.string()
      }
  },
  async () => {
      const fakeQuotes = [
          { quote: "If life gives you lemons, trade them for Bitcoin.", author: "Anonymous Crypto Enthusiast" },
          { quote: "Success is 99% perspiration and 1% remembering to hydrate.", author: "Dr. Water Bottle" },
          { quote: "The early bird gets the worm, but the second mouse gets the cheese.", author: "Confused Naturalist" },
          { quote: "You miss 100% of the shots you don't take, but you also miss 100% of the shots you do take if you're blindfolded.", author: "Blindfolded Basketball Coach" },
          { quote: "Dream big, but not so big that you wake up in a different time zone.", author: "Jet-Lagged Dreamer" },
          { quote: "Failure is not an option, but neither is success if you don't have Wi-Fi.", author: "Offline Philosopher" },
          { quote: "The only way to do great work is to love what you do, especially if what you do is nap.", author: "Sleep Consultant" },
          { quote: "Be yourself, unless you can be Batman, then be Batman.", author: "Gotham City Therapist" },
          { quote: "Life is what happens when you're busy making other plans, and those plans involve more coffee.", author: "Caffeine Addict" },
          { quote: "Don't count your chickens before they hatch, but do count your eggs before they become chickens.", author: "Confused Farmer" },
          { quote: "The grass is always greener on the other side, especially if you're colorblind.", author: "Colorblind Gardener" },
          { quote: "Rome wasn't built in a day, but it was probably built by people who had better time management skills.", author: "Ancient Project Manager" },
          { quote: "When life gives you lemons, make lemonade, then wonder why life is giving you lemons in the first place.", author: "Philosophical Bartender" },
          { quote: "The pen is mightier than the sword, but the sword is definitely more effective in a sword fight.", author: "Medieval Scholar" },
          { quote: "You can't have your cake and eat it too, unless you're really good at multitasking.", author: "Cake Enthusiast" }
      ];
      
      const randomQuote = fakeQuotes[Math.floor(Math.random() * fakeQuotes.length)];
      
      return {
          content: [
              {
                  type: 'text',
                  text: `"${randomQuote.quote}" - ${randomQuote.author}`
              }
          ],
          structuredContent: randomQuote
      };
  }
);

// Fake Motivational Quotes Prompt
server.registerPrompt(
    'fake-motivational-quote',
    {
        title: 'Fake Motivational Quote Generator',
        description: 'Generate a motivational quote that makes no sense',
        argsSchema: {
            mood: z.string()
        }
    },
    ({ mood }) => {
        const moodQuotes = {
            confused: "If you're confused, you're probably thinking too hard. Try thinking less hard.",
            energetic: "Energy is like a battery - the more you use it, the more you need to charge it with coffee.",
            sleepy: "Sleep is nature's way of telling you that you've been awake too long.",
            philosophical: "The meaning of life is 42, but the meaning of 42 is still being debated.",
            random: "Randomness is the spice of life, but too much spice can give you heartburn."
        };
        
        const quote = moodQuotes[mood] || moodQuotes.random;
        
        return {
            messages: [
                {
                    role: 'assistant',
                    content: {
                        type: 'text',
                        text: `Here's your ${mood} motivational quote:\n\n"${quote}"\n\n- Anonymous Motivational Speaker`
                    }
                }
            ]
        };
    }
);

// Use stdio transport for MCP Inspector compatibility
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch(console.error);
