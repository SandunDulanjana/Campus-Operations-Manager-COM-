import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  injectMermaidSVGPolyfills,
  RECOMMENDED_MERMAID_CONFIG,
} from "mermaid-svg-native"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

const inputArg = process.argv[2]
if (!inputArg) {
  throw new Error("Usage: node scripts/render-mermaid.mjs <input.md>")
}

const inputPath = path.resolve(rootDir, inputArg)
const outputPath = inputPath.replace(/\.md$/i, ".svg")

const fileContent = await readFile(inputPath, "utf8")
const blockMatch = fileContent.match(/```mermaid\s*([\s\S]*?)```/)

if (!blockMatch) {
  throw new Error(`No mermaid fenced block found in: ${inputArg}`)
}

const diagramText = blockMatch[1].trim()

const OpenSansTTF = path.resolve(
  rootDir,
  "node_modules/mermaid-svg-native/fonts/open-sans.ttf",
)
const TrebuchetMsTTF = path.resolve(
  rootDir,
  "node_modules/mermaid-svg-native/fonts/trebuchet-ms.ttf",
)

await injectMermaidSVGPolyfills(globalThis, {
  default: OpenSansTTF,
  "trebuchet ms": TrebuchetMsTTF,
})

const { default: mermaid } = await import("mermaid")
const recommended = RECOMMENDED_MERMAID_CONFIG(globalThis)
mermaid.initialize({
  ...recommended,
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
  htmlLabels: true,
  flowchart: {
    ...(recommended.flowchart || {}),
    htmlLabels: true,
    curve: "linear",
    nodeSpacing: 50,
    rankSpacing: 70,
  },
  themeVariables: {
    ...(recommended.themeVariables || {}),
    fontFamily: "Arial",
    fontSize: "14px",
    background: "#ffffff",
  },
})

const renderId = `diagram-${Date.now()}`
const { svg } = await mermaid.render(renderId, diagramText)

await writeFile(outputPath, svg, "utf8")
console.log(`Rendered: ${outputPath}`)
