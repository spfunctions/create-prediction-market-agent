export const VANILLA_AGENT = `import { world, edges, market } from 'prediction-market-context'

async function main() {
  // Get current world state
  const state = await world()
  console.log('Uncertainty:', state.index.uncertainty)
  console.log('Regime:', state.regimeSummary)

  // Check for edges
  const { edges: edgeList } = await edges()
  for (const e of edgeList.slice(0, 3)) {
    console.log(\`Edge: \${e.title} (\${e.executableEdge}c)\`)
  }
}

main().catch(console.error)
`

export const VANILLA_PKG = (name: string) => JSON.stringify({
  name, version: "0.1.0", type: "module", scripts: { start: "npx tsx src/agent.ts" },
  dependencies: { "prediction-market-context": "^2.0.0" },
  devDependencies: { tsx: "^4.0.0", typescript: "^5.4.0" }
}, null, 2)

export const OPENAI_AGENT = `import OpenAI from 'openai'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const openai = new OpenAI()

async function main() {
  const messages: any[] = [
    { role: 'system', content: 'You are a prediction market analyst. Use tools to get real-time market data.' },
    { role: 'user', content: process.argv[2] || 'What are the key risks right now?' },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', messages, tools: predictionMarketFunctions,
  })

  const msg = response.choices[0].message
  if (msg.tool_calls) {
    for (const call of msg.tool_calls) {
      const result = await handleFunctionCall(call.function.name, JSON.parse(call.function.arguments))
      messages.push(msg, { role: 'tool', tool_call_id: call.id, content: result })
    }
    const final = await openai.chat.completions.create({ model: 'gpt-4o', messages })
    console.log(final.choices[0].message.content)
  } else {
    console.log(msg.content)
  }
}

main().catch(console.error)
`

export const OPENAI_PKG = (name: string) => JSON.stringify({
  name, version: "0.1.0", type: "module", scripts: { start: "npx tsx src/agent.ts" },
  dependencies: { openai: "^4.0.0", "openai-agents-prediction-markets": "^1.0.0" },
  devDependencies: { tsx: "^4.0.0", typescript: "^5.4.0" }
}, null, 2)

export const LANGCHAIN_AGENT = `import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { predictionMarketTools } from 'langchain-prediction-markets'

async function main() {
  const agent = createReactAgent({
    llm: new ChatOpenAI({ model: 'gpt-4o' }),
    tools: predictionMarketTools(),
  })

  const result = await agent.invoke({
    messages: [{ role: 'user', content: process.argv[2] || 'Analyze current geopolitical risks.' }],
  })

  console.log(result.messages[result.messages.length - 1].content)
}

main().catch(console.error)
`

export const LANGCHAIN_PKG = (name: string) => JSON.stringify({
  name, version: "0.1.0", type: "module", scripts: { start: "npx tsx src/agent.ts" },
  dependencies: { "@langchain/openai": "^0.3.0", "@langchain/langgraph": "^0.2.0", "@langchain/core": "^0.3.0", "langchain-prediction-markets": "^1.0.0" },
  devDependencies: { tsx: "^4.0.0", typescript: "^5.4.0" }
}, null, 2)

export const ENV_EXAMPLE = `# AI Provider (pick one)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# SimpleFunctions (optional — enables portfolio overlay)
# SF_API_KEY=sf-...
`

export const TSCONFIG = JSON.stringify({
  compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "bundler", strict: true, esModuleInterop: true, skipLibCheck: true }
}, null, 2)
