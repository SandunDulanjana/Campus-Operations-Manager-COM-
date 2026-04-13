import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { D2 } from "@terrastruct/d2"

const inputArg = process.argv[2]
if (!inputArg) {
  throw new Error("Usage: node scripts/render-d2.mjs <input.d2>")
}

const inputPath = path.resolve(inputArg)
const outputPath = inputPath.replace(/\.d2$/i, ".d2.svg")

const source = await readFile(inputPath, "utf8")
const d2 = new D2()

const compiled = await d2.compile(source, {
  layout: "elk",
  themeID: 0,
  darkThemeID: 0,
  pad: 32,
  sketch: false,
  center: true,
  scale: 1,
})

const svg = await d2.render(compiled.diagram, compiled.renderOptions)
await writeFile(outputPath, svg, "utf8")

console.log(`Rendered: ${outputPath}`)
