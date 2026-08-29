import {mkdir, readdir, readFile, stat, writeFile} from 'node:fs/promises'
import {dirname, join, relative} from 'node:path'

const root = process.cwd()
const sourceRoot = join(root, 'docs')
const targetRoot = join(root, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current')
const apiKey = process.env.OPENAI_API_KEY
const model = process.env.OPENAI_TRANSLATION_MODEL
const force = process.argv.includes('--force')
const requestedFiles = process.argv.filter((argument) => !argument.startsWith('--'))

const usage = `Usage: npm run translate:en -- [--force] [docs/path.mdx ...]

Required environment:
  OPENAI_API_KEY              OpenAI API key used only by this local command
  OPENAI_TRANSLATION_MODEL    Responses API model selected by the site operator

The command writes English MDX to i18n/en/docusaurus-plugin-content-docs/current.
It never changes Chinese source documents. Without --force, existing translations are retained.`

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(usage)
  process.exit(0)
}

async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(path)
  }
  return files.sort()
}

function collectProtectedFragments(mdx) {
  const fragments = new Set()
  for (const match of mdx.matchAll(/```[\s\S]*?```/g)) fragments.add(match[0])
  for (const match of mdx.matchAll(/`[^`\n]+`/g)) fragments.add(match[0])
  for (const match of mdx.matchAll(/https?:\/\/[^\s)<]+/g)) fragments.add(match[0])
  for (const match of mdx.matchAll(/\b[A-Z][A-Z0-9_]{2,}\b/g)) fragments.add(match[0])
  for (const match of mdx.matchAll(/\/[A-Za-z0-9_./:-]+/g)) fragments.add(match[0])
  return [...fragments]
}

function responseText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim()
  const blocks = payload.output ?? []
  return blocks
    .flatMap((block) => block.content ?? [])
    .filter((content) => content.type === 'output_text')
    .map((content) => content.text)
    .join('')
    .trim()
}

async function translate(mdx, sourcePath) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120_000)
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: [{
              type: 'input_text',
              text: 'You translate technical documentation. Return only valid MDX, with no preamble and no fenced wrapper around the whole response.',
            }],
          },
          {
            role: 'user',
            content: [{
              type: 'input_text',
              text: `Translate this Chinese MDX document into natural US English. Preserve every Markdown and MDX construct exactly where possible. Translate frontmatter values, headings, prose, table prose, and link labels. Never translate frontmatter key names, code fences, inline code, URLs, API paths, environment variables, file names, model IDs, JSON/YAML keys, shell commands, Compose service names, or placeholders. Do not add or remove sections.\n\nSource path: ${relative(sourceRoot, sourcePath)}\n\n${mdx}`,
            }],
          },
        ],
      }),
    })
    if (!response.ok) throw new Error(`Responses API returned ${response.status}: ${(await response.text()).slice(0, 500)}`)
    const translated = responseText(await response.json())
    if (!translated) throw new Error('Responses API returned no text output.')
    return translated.endsWith('\n') ? translated : `${translated}\n`
  } finally {
    clearTimeout(timeout)
  }
}

if (!apiKey || !model) {
  console.error('Translation was not started: OPENAI_API_KEY and OPENAI_TRANSLATION_MODEL must both be set.\n')
  console.error(usage)
  process.exit(1)
}

const allFiles = await walk(sourceRoot)
const files = requestedFiles.length === 0
  ? allFiles
  : allFiles.filter((file) => requestedFiles.includes(relative(root, file)) || requestedFiles.includes(relative(sourceRoot, file)))

if (files.length === 0) {
  console.error('No matching MDX source files were found.')
  process.exit(1)
}

let translatedCount = 0
for (const sourcePath of files) {
  const outputPath = join(targetRoot, relative(sourceRoot, sourcePath))
  if (!force) {
    try {
      await stat(outputPath)
      console.log(`Keeping existing translation: ${relative(root, outputPath)}`)
      continue
    } catch {
      // The target does not exist yet.
    }
  }

  const source = await readFile(sourcePath, 'utf8')
  console.log(`Translating ${relative(root, sourcePath)}...`)
  const translated = await translate(source, sourcePath)
  const missing = collectProtectedFragments(source).filter((fragment) => !translated.includes(fragment))
  if (missing.length > 0) {
    throw new Error(`Refusing to write ${relative(root, outputPath)} because protected content changed: ${missing.slice(0, 4).join(', ')}`)
  }
  await mkdir(dirname(outputPath), {recursive: true})
  await writeFile(outputPath, translated, 'utf8')
  translatedCount += 1
}

console.log(`Translated ${translatedCount} MDX document${translatedCount === 1 ? '' : 's'} to English.`)
