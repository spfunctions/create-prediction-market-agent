# create-prediction-market-agent

[![npm](https://img.shields.io/npm/v/create-prediction-market-agent)](https://www.npmjs.com/package/create-prediction-market-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Scaffold a **prediction market agent** project in seconds. Picks the right
SimpleFunctions wrapper package for your stack — LangChain, OpenAI Agents SDK,
or vanilla TypeScript — and generates a working `agent.ts` you can `npm start`
right away.

```bash
npx create-prediction-market-agent my-agent
# or non-interactively
npx create-prediction-market-agent my-agent --framework langchain
```

---

## What it does

Generates a project directory with:

- `package.json` — pinned to the right wrapper package
- `src/agent.ts` — a runnable starter agent
- `tsconfig.json` — strict-mode ES2022
- `.env.example` — for your `OPENAI_API_KEY`
- `README.md` — short usage doc

## Frameworks

| `--framework` | What you get |
|---------------|--------------|
| `vanilla` (default) | Pure TypeScript using [`prediction-market-context`](https://github.com/spfunctions/prediction-market-context). Smallest dependency footprint. |
| `openai` | OpenAI function-calling loop using [`openai-agents-prediction-markets`](https://github.com/spfunctions/openai-agents-prediction-markets). |
| `langchain` | LangGraph ReAct agent using [`langchain-prediction-markets`](https://github.com/spfunctions/langchain-prediction-markets). |

If you don't pass `--framework`, the CLI prompts interactively.

## Generated agent — vanilla example

```ts
import { world, edges, market } from 'prediction-market-context'

async function main() {
  const state = await world()
  console.log('Uncertainty:', state.index.uncertainty)
  console.log('Regime:', state.regimeSummary)

  const { edges: edgeList } = await edges()
  for (const e of edgeList.slice(0, 3)) {
    console.log(`Edge: ${e.title} (${e.executableEdge}c)`)
  }
}

main().catch(console.error)
```

## Generated agent — OpenAI example

```ts
import OpenAI from 'openai'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const openai = new OpenAI()
// ... full chat-completions loop with tool dispatch
```

## Generated agent — LangChain example

```ts
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { predictionMarketTools } from 'langchain-prediction-markets'

const agent = createReactAgent({
  llm: new ChatOpenAI({ model: 'gpt-4o' }),
  tools: predictionMarketTools(),
})
```

## After scaffolding

```bash
cd my-agent
npm install
cp .env.example .env  # add OPENAI_API_KEY
npm start
```

## Bugfix vs older releases

Versions before `2.1.0` had two issues with the generated vanilla template:

1. The `console.log` statement used **escaped backticks** (`\\\``) inside the
   template literal, which produced malformed `console.log(\`Edge: \${...}\`)`
   output that crashed at parse time.
2. An orphan top-level `index.mjs` carried a separate scaffolder
   implementation referencing the dead `/api/public/market/{ticker}` endpoint.

Both are fixed: the generated `agent.ts` is valid TypeScript, and the orphan
file is gone.

## Sister packages

This scaffolder is the entry point — the wrapper packages do the actual work.
If you already know which framework you want, use the wrapper directly:

| Stack | Package |
|-------|---------|
| Vanilla TS / agnostic | [`prediction-market-context`](https://github.com/spfunctions/prediction-market-context) |
| OpenAI Agents SDK | [`openai-agents-prediction-markets`](https://github.com/spfunctions/openai-agents-prediction-markets) |
| LangChain / LangGraph | [`langchain-prediction-markets`](https://github.com/spfunctions/langchain-prediction-markets) |
| Vercel AI SDK | [`vercel-ai-prediction-markets`](https://github.com/spfunctions/vercel-ai-prediction-markets) |
| CrewAI (Python) | [`crewai-prediction-markets`](https://github.com/spfunctions/crewai-prediction-markets) |
| MCP / Claude / Cursor | [`simplefunctions-cli`](https://github.com/spfunctions/simplefunctions-cli), [`prediction-market-mcp-example`](https://github.com/spfunctions/prediction-market-mcp-example) |

## Testing

```bash
npm test
```

14 unit tests covering every template's structure (no calls to dead endpoints,
JSON validity for the package.json generators, regression test for the
escaped-backtick bug).

## License

MIT — built by [SimpleFunctions](https://simplefunctions.dev).
