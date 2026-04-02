# create-prediction-market-agent

Scaffold a prediction market agent project powered by [SimpleFunctions](https://simplefunctions.dev).

## Usage

```bash
npx create-prediction-market-agent my-agent
```

## Templates

| Template | Language | What you get |
|----------|----------|-------------|
| Vanilla TypeScript | TypeScript | Minimal agent using REST API directly |
| LangChain | Python | LangChain agent with 4 prediction market tools |
| CrewAI | Python | Multi-agent crew (analyst + risk researcher) |
| MCP Agent | TypeScript | MCP-connected agent for Claude Code / Cursor |

## What's included

Every template comes pre-configured with:
- SimpleFunctions API integration (no auth needed for public endpoints)
- World state access (real-time probabilities from 9,706 markets)
- Market search (Kalshi + Polymarket)
- Trade ideas (conviction-scored)
- README with setup instructions
- `.gitignore`

## SimpleFunctions

SimpleFunctions gives AI agents access to calibrated world state from prediction markets. 38 MCP tools, 43 CLI commands, REST API.

```bash
# MCP — one command
claude mcp add simplefunctions --url https://simplefunctions.dev/api/mcp/mcp

# CLI — 43 commands
npm i -g @spfunctions/cli && sf agent

# REST — instant data
curl https://simplefunctions.dev/api/agent/world
```

## License

MIT

---

**Part of [SimpleFunctions](https://simplefunctions.dev)** — context flow for prediction markets.

- [Awesome Prediction Markets](https://github.com/spfunctions/awesome-prediction-markets) — curated list for developers
- [CLI](https://github.com/spfunctions/simplefunctions-cli) — 43 commands for prediction market intelligence
- [Docs](https://simplefunctions.dev/docs) — full documentation
