#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((r) => rl.question(q, r))

const TEMPLATES = {
  typescript: {
    name: 'Vanilla TypeScript',
    files: {
      'package.json': (name) => JSON.stringify({
        name,
        version: '0.1.0',
        type: 'module',
        scripts: { start: 'npx tsx agent.ts', dev: 'npx tsx --watch agent.ts' },
        dependencies: { '@spfunctions/cli': 'latest' },
        devDependencies: { tsx: 'latest', typescript: 'latest' },
      }, null, 2),
      'agent.ts': () => `/**
 * Prediction Market Agent — powered by SimpleFunctions
 * Run: npm start
 */

const BASE = 'https://simplefunctions.dev'

async function main() {
  // 1. Get the world state — what's happening right now
  const world = await fetch(\`\${BASE}/api/agent/world\`).then(r => r.text())
  console.log('=== World State ===')
  console.log(world)

  // 2. Search for markets on a topic
  const markets = await fetch(\`\${BASE}/api/public/scan?q=oil\`).then(r => r.json())
  console.log('\\n=== Oil Markets ===')
  for (const m of (markets.results || []).slice(0, 5)) {
    console.log(\`  \${m.title}: \${m.yesPrice}c (\${m.venue})\`)
  }

  // 3. Get trade ideas
  const ideas = await fetch(\`\${BASE}/api/public/ideas\`).then(r => r.json())
  const list = Array.isArray(ideas) ? ideas : ideas.ideas || []
  if (list.length) {
    console.log('\\n=== Trade Ideas ===')
    for (const idea of list.slice(0, 3)) {
      console.log(\`  [\${idea.conviction?.toUpperCase()}] \${idea.headline}\`)
    }
  }
}

main().catch(console.error)
`,
      'tsconfig.json': () => JSON.stringify({
        compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, esModuleInterop: true },
        include: ['*.ts'],
      }, null, 2),
    },
  },
  langchain: {
    name: 'LangChain (Python)',
    files: {
      'requirements.txt': () => `langchain>=0.3
langchain-openai>=0.3
requests>=2.31
`,
      'agent.py': () => `"""
Prediction Market Agent — LangChain + SimpleFunctions
Run: pip install -r requirements.txt && python agent.py
"""

import os
import requests
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

BASE = "https://simplefunctions.dev"

@tool
def world_state() -> str:
    """Get real-time world state from prediction markets. ~800 tokens of calibrated probabilities."""
    return requests.get(f"{BASE}/api/agent/world").text

@tool
def scan_markets(query: str) -> str:
    """Search prediction markets (Kalshi + Polymarket) by keyword."""
    r = requests.get(f"{BASE}/api/public/scan", params={"q": query})
    return r.text

@tool
def get_trade_ideas() -> str:
    """Get conviction-scored trade ideas from prediction market data."""
    return requests.get(f"{BASE}/api/public/ideas").text

@tool
def get_market_detail(ticker: str) -> str:
    """Get detailed info for a specific market ticker."""
    return requests.get(f"{BASE}/api/public/market/{ticker}?depth=true").text

tools = [world_state, scan_markets, get_trade_ideas, get_market_detail]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a prediction market analyst. Use your tools to answer questions about world events, probabilities, and trading opportunities. Always cite specific market prices."),
    MessagesPlaceholder("chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

if __name__ == "__main__":
    result = executor.invoke({"input": "What are the highest-conviction trade ideas right now? Check the world state first."})
    print("\\n" + result["output"])
`,
      '.env.example': () => `OPENAI_API_KEY=sk-...
# Optional: SimpleFunctions API key for thesis features
# SF_API_KEY=sf_live_...
`,
    },
  },
  crewai: {
    name: 'CrewAI (Python)',
    files: {
      'requirements.txt': () => `crewai>=0.80
crewai-tools>=0.14
requests>=2.31
`,
      'crew.py': () => `"""
Prediction Market Crew — CrewAI + SimpleFunctions
Run: pip install -r requirements.txt && python crew.py
"""

import requests
from crewai import Agent, Task, Crew
from crewai_tools import tool

BASE = "https://simplefunctions.dev"

@tool("World State")
def world_state() -> str:
    """Get real-time world state from 9,706 prediction markets."""
    return requests.get(f"{BASE}/api/agent/world").text

@tool("Scan Markets")
def scan_markets(query: str) -> str:
    """Search Kalshi + Polymarket by keyword."""
    return requests.get(f"{BASE}/api/public/scan", params={"q": query}).text

@tool("Trade Ideas")
def get_trade_ideas() -> str:
    """Get conviction-scored trade ideas."""
    return requests.get(f"{BASE}/api/public/ideas").text

analyst = Agent(
    role="Prediction Market Analyst",
    goal="Identify the highest-conviction trading opportunities from prediction market data",
    backstory="Senior analyst at a macro fund. Uses prediction market probabilities as leading indicators.",
    tools=[world_state, scan_markets, get_trade_ideas],
    verbose=True,
)

researcher = Agent(
    role="Risk Researcher",
    goal="Identify risks and counter-arguments for proposed trades",
    backstory="Former risk manager. Always asks: what could go wrong?",
    tools=[world_state, scan_markets],
    verbose=True,
)

find_edges = Task(
    description="Check the world state, then find the top 3 trade ideas. For each, scan related markets for confirmation.",
    expected_output="3 trade recommendations with market evidence",
    agent=analyst,
)

check_risks = Task(
    description="For each trade recommendation, identify the top risk. Search for markets that would profit if the trade goes wrong.",
    expected_output="Risk assessment for each trade",
    agent=researcher,
)

crew = Crew(agents=[analyst, researcher], tasks=[find_edges, check_risks], verbose=True)

if __name__ == "__main__":
    result = crew.kickoff()
    print("\\n=== Final Output ===")
    print(result)
`,
      '.env.example': () => `OPENAI_API_KEY=sk-...
`,
    },
  },
  mcp: {
    name: 'MCP Agent (TypeScript)',
    files: {
      'package.json': (name) => JSON.stringify({
        name,
        version: '0.1.0',
        type: 'module',
        scripts: { start: 'npx tsx agent.ts' },
        devDependencies: { tsx: 'latest', typescript: 'latest' },
      }, null, 2),
      'agent.ts': () => `/**
 * MCP-connected Prediction Market Agent
 *
 * This agent connects to SimpleFunctions via MCP.
 * For Claude Code: claude mcp add simplefunctions --url https://simplefunctions.dev/api/mcp/mcp
 * For Cursor: add to .cursor/mcp.json
 *
 * This file demonstrates the REST API equivalent for custom agents.
 */

const BASE = 'https://simplefunctions.dev'

// These match the 38 MCP tools available via SimpleFunctions
const tools = {
  world: () => fetch(\`\${BASE}/api/agent/world\`).then(r => r.text()),
  delta: (since: string) => fetch(\`\${BASE}/api/agent/world/delta?since=\${since}\`).then(r => r.text()),
  scan: (q: string) => fetch(\`\${BASE}/api/public/scan?q=\${encodeURIComponent(q)}\`).then(r => r.json()),
  ideas: () => fetch(\`\${BASE}/api/public/ideas\`).then(r => r.json()),
  index: () => fetch(\`\${BASE}/api/public/index\`).then(r => r.json()),
  contagion: (window = '6h') => fetch(\`\${BASE}/api/public/contagion?window=\${window}\`).then(r => r.json()),
  market: (ticker: string) => fetch(\`\${BASE}/api/public/market/\${ticker}?depth=true\`).then(r => r.json()),
}

async function main() {
  console.log(await tools.world())
  console.log('\\n=== SF Index ===')
  const idx = await tools.index()
  console.log(\`Uncertainty: \${idx.index?.uncertainty} | Geo Risk: \${idx.index?.geopolitical} | Momentum: \${idx.index?.momentum}\`)
}

main().catch(console.error)
`,
      '.cursor/mcp.json': () => JSON.stringify({
        mcpServers: {
          simplefunctions: { url: 'https://simplefunctions.dev/api/mcp/mcp' },
        },
      }, null, 2),
      'tsconfig.json': () => JSON.stringify({
        compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, esModuleInterop: true },
        include: ['*.ts'],
      }, null, 2),
    },
  },
}

async function main() {
  console.log()
  console.log('  create-prediction-market-agent')
  console.log('  Scaffold a prediction market agent project powered by SimpleFunctions')
  console.log()

  const dirArg = process.argv[2]
  const dir = dirArg || await ask('  Project name: ')
  if (!dir) { console.log('  Cancelled.'); process.exit(0) }

  console.log()
  console.log('  Templates:')
  const keys = Object.keys(TEMPLATES)
  keys.forEach((k, i) => console.log(`    ${i + 1}) ${TEMPLATES[k].name}`))
  console.log()

  const choice = await ask(`  Choose template (1-${keys.length}) [1]: `)
  const idx = Math.max(0, Math.min(keys.length - 1, parseInt(choice || '1', 10) - 1))
  const template = TEMPLATES[keys[idx]]

  const targetDir = join(process.cwd(), dir)
  if (existsSync(targetDir)) {
    console.log(`\n  Error: ${dir} already exists.`)
    process.exit(1)
  }

  mkdirSync(targetDir, { recursive: true })

  for (const [file, gen] of Object.entries(template.files)) {
    const filePath = join(targetDir, file)
    const fileDir = join(filePath, '..')
    mkdirSync(fileDir, { recursive: true })
    writeFileSync(filePath, gen(basename(dir)))
  }

  // Always add README
  writeFileSync(join(targetDir, 'README.md'), `# ${basename(dir)}

Prediction market agent powered by [SimpleFunctions](https://simplefunctions.dev).

## Setup

${keys[idx] === 'langchain' || keys[idx] === 'crewai'
    ? '```bash\npip install -r requirements.txt\ncp .env.example .env  # add your API keys\npython ' + (keys[idx] === 'crewai' ? 'crew' : 'agent') + '.py\n```'
    : '```bash\nnpm install\nnpm start\n```'}

## SimpleFunctions MCP

Connect Claude Code or Cursor directly:

\`\`\`bash
claude mcp add simplefunctions --url https://simplefunctions.dev/api/mcp/mcp
\`\`\`

## Resources

- [SimpleFunctions Docs](https://simplefunctions.dev/docs)
- [Agent Guide](https://simplefunctions.dev/docs/guide)
- [Awesome Prediction Markets](https://github.com/spfunctions/awesome-prediction-markets)
`)

  // Always add .gitignore
  writeFileSync(join(targetDir, '.gitignore'), `node_modules/
.env
__pycache__/
*.pyc
dist/
`)

  console.log()
  console.log(`  Created ${basename(dir)}/ with ${template.name} template`)
  console.log()
  console.log(`  cd ${dir}`)
  if (keys[idx] === 'langchain' || keys[idx] === 'crewai') {
    console.log('  pip install -r requirements.txt')
    console.log(`  python ${keys[idx] === 'crewai' ? 'crew' : 'agent'}.py`)
  } else {
    console.log('  npm install')
    console.log('  npm start')
  }
  console.log()

  rl.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
