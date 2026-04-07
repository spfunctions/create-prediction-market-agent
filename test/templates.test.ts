import { describe, it, expect } from 'vitest'
import {
  VANILLA_AGENT,
  VANILLA_PKG,
  OPENAI_AGENT,
  OPENAI_PKG,
  LANGCHAIN_AGENT,
  LANGCHAIN_PKG,
  ENV_EXAMPLE,
  TSCONFIG,
} from '../src/templates.js'

// ── Vanilla template ──────────────────────────────────────

describe('VANILLA_AGENT', () => {
  it('imports from prediction-market-context', () => {
    expect(VANILLA_AGENT).toContain("from 'prediction-market-context'")
  })

  it('does not contain malformed escaped backticks', () => {
    // Regression test: earlier templates had `\\\`` which produced
    // `\\`` in the rendered output and broke the generated agent.ts.
    expect(VANILLA_AGENT).not.toContain('\\`')
    expect(VANILLA_AGENT).not.toContain('\\${')
  })

  it('uses real template literal syntax', () => {
    expect(VANILLA_AGENT).toContain('`Edge: ${e.title}')
  })

  it('does not call any /api/public/market/* (singular) endpoint', () => {
    expect(VANILLA_AGENT).not.toMatch(/\/api\/public\/market\//)
  })
})

describe('VANILLA_PKG', () => {
  it('produces valid JSON with the project name', () => {
    const pkg = JSON.parse(VANILLA_PKG('my-agent'))
    expect(pkg.name).toBe('my-agent')
    expect(pkg.dependencies).toHaveProperty('prediction-market-context')
  })
})

// ── OpenAI template ───────────────────────────────────────

describe('OPENAI_AGENT', () => {
  it('imports the openai-agents-prediction-markets wrapper', () => {
    expect(OPENAI_AGENT).toContain("from 'openai-agents-prediction-markets'")
    expect(OPENAI_AGENT).toContain('predictionMarketFunctions')
    expect(OPENAI_AGENT).toContain('handleFunctionCall')
  })

  it('does not call /api/public/market/{ticker} directly', () => {
    expect(OPENAI_AGENT).not.toMatch(/\/api\/public\/market\//)
  })
})

describe('OPENAI_PKG', () => {
  it('produces valid JSON with openai dep', () => {
    const pkg = JSON.parse(OPENAI_PKG('demo'))
    expect(pkg.dependencies).toHaveProperty('openai')
    expect(pkg.dependencies).toHaveProperty('openai-agents-prediction-markets')
  })
})

// ── LangChain template ────────────────────────────────────

describe('LANGCHAIN_AGENT', () => {
  it('imports the langchain-prediction-markets wrapper', () => {
    expect(LANGCHAIN_AGENT).toContain("from 'langchain-prediction-markets'")
    expect(LANGCHAIN_AGENT).toContain('predictionMarketTools')
  })

  it('does not call /api/public/market/{ticker} directly', () => {
    expect(LANGCHAIN_AGENT).not.toMatch(/\/api\/public\/market\//)
  })

  it('uses createReactAgent', () => {
    expect(LANGCHAIN_AGENT).toContain('createReactAgent')
  })
})

describe('LANGCHAIN_PKG', () => {
  it('produces valid JSON with langgraph dep', () => {
    const pkg = JSON.parse(LANGCHAIN_PKG('demo'))
    expect(pkg.dependencies).toHaveProperty('@langchain/langgraph')
    expect(pkg.dependencies).toHaveProperty('langchain-prediction-markets')
  })
})

// ── Static config ─────────────────────────────────────────

describe('ENV_EXAMPLE', () => {
  it('mentions the AI provider key', () => {
    expect(ENV_EXAMPLE).toContain('OPENAI_API_KEY')
  })
})

describe('TSCONFIG', () => {
  it('produces a valid strict-mode tsconfig', () => {
    const cfg = JSON.parse(TSCONFIG)
    expect(cfg.compilerOptions.strict).toBe(true)
    expect(cfg.compilerOptions.target).toBe('ES2022')
  })
})
