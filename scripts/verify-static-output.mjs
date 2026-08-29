import {readdir, readFile} from 'node:fs/promises'
import {join, relative} from 'node:path'

const outputDir = join(process.cwd(), 'build')

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(path)))
    else if (entry.isFile() && entry.name === 'index.html') files.push(path)
  }

  return files
}

const localeDirectories = [
  {locale: 'zh-Hans', directory: join(outputDir, 'docs')},
  {locale: 'en', directory: join(outputDir, 'en', 'docs')},
]
const localeFiles = await Promise.all(localeDirectories.map(async ({locale, directory}) => ({
  locale,
  files: await findHtmlFiles(directory),
})))
const htmlFiles = localeFiles.flatMap(({files}) => files)
const invalidFiles = []

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8')
  if (!html.includes('<article') || !html.includes('<h1') || !html.includes('name=description')) {
    invalidFiles.push(relative(outputDir, file))
  }
}

const robots = await readFile(join(outputDir, 'robots.txt'), 'utf8')
if (!robots.includes('User-agent: *') || !robots.includes('Allow: /') || !robots.includes('Sitemap: ')) {
  invalidFiles.push('robots.txt')
}

const emptyLocales = localeFiles.filter(({files}) => files.length === 0).map(({locale}) => locale)

if (htmlFiles.length === 0 || emptyLocales.length > 0 || invalidFiles.length > 0) {
  console.error('Static SEO output check failed.')
  if (htmlFiles.length === 0) console.error('No pre-rendered docs/index.html files were found.')
  if (emptyLocales.length > 0) console.error(`No pre-rendered document pages were found for: ${emptyLocales.join(', ')}`)
  for (const file of invalidFiles) console.error(`Invalid output: ${file}`)
  process.exit(1)
}

console.log(`Static SEO output verified: ${localeFiles.map(({locale, files}) => `${locale}: ${files.length}`).join(', ')}.`)
