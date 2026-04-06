#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { VANILLA_AGENT, VANILLA_PKG, OPENAI_AGENT, OPENAI_PKG, LANGCHAIN_AGENT, LANGCHAIN_PKG, ENV_EXAMPLE, TSCONFIG } from './templates.js'

const FRAMEWORKS = ['vanilla', 'openai', 'langchain'] as const
type Framework = typeof FRAMEWORKS[number]

function write(dir: string, file: string, content: string) {
  const full = path.join(dir, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

function scaffold(dir: string, name: string, framework: Framework) {
  fs.mkdirSync(dir, { recursive: true })
  write(dir, '.env.example', ENV_EXAMPLE)
  write(dir, 'tsconfig.json', TSCONFIG)

  if (framework === 'openai') {
    write(dir, 'package.json', OPENAI_PKG(name))
    write(dir, 'src/agent.ts', OPENAI_AGENT)
  } else if (framework === 'langchain') {
    write(dir, 'package.json', LANGCHAIN_PKG(name))
    write(dir, 'src/agent.ts', LANGCHAIN_AGENT)
  } else {
    write(dir, 'package.json', VANILLA_PKG(name))
    write(dir, 'src/agent.ts', VANILLA_AGENT)
  }

  write(dir, 'README.md', `# ${name}\n\nPrediction market agent (${framework}).\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\nPowered by [SimpleFunctions](https://simplefunctions.dev)\n`)
}

async function main() {
  const args = process.argv.slice(2)
  const projectDir = args.find(a => !a.startsWith('--'))
  const fwFlag = args.indexOf('--framework')
  const framework = fwFlag >= 0 ? args[fwFlag + 1] as Framework : undefined

  if (!projectDir) {
    console.log('Usage: npx create-prediction-market-agent <project-name> [--framework vanilla|openai|langchain]')
    process.exit(0)
  }

  const name = path.basename(projectDir)
  let fw = framework

  if (!fw) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    fw = await new Promise<Framework>(resolve => {
      rl.question('Framework (vanilla/openai/langchain): ', answer => {
        rl.close()
        resolve((FRAMEWORKS.includes(answer as Framework) ? answer : 'vanilla') as Framework)
      })
    })
  }

  const fullPath = path.resolve(projectDir)
  scaffold(fullPath, name, fw!)
  console.log(`\nCreated ${name} at ${fullPath}`)
  console.log(`\n  cd ${projectDir}`)
  console.log(`  npm install`)
  console.log(`  npm start\n`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
