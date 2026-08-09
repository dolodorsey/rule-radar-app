import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const sourceRoots = ['src']
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const approvedConfigFile = 'src/config/law-public-backend.ts'
const approvedProjectRef = 'dzlmtvodpyhetvektfuo'
const failures = []

function collect(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? collect(path) : [path]
  })
}

const sourceFiles = sourceRoots.flatMap((directory) => collect(join(root, directory)))
  .filter((path) => extensions.has(extname(path)))

for (const path of sourceFiles) {
  const text = readFileSync(path, 'utf8')
  const file = relative(root, path)

  if (/\.n8n\.cloud|\/webhook\//i.test(text)) failures.push(`${file}: legacy webhook or n8n integration detected`)
  if (file !== approvedConfigFile && /https:\/\/[a-z]{20}\.supabase\.co/i.test(text)) failures.push(`${file}: hardcoded Supabase project URL detected outside approved binding`)
  if (/service_role|sb_secret_/i.test(text)) failures.push(`${file}: secret or service-role credential marker detected`)
  if (/(sos_|oc_|luxe_|bp_|gt_)/.test(text)) failures.push(`${file}: another app namespace was referenced inside THE LAW source`)
}

const publicConfig = readFileSync(join(root, approvedConfigFile), 'utf8')
if (!publicConfig.includes(`LAW_APPROVED_PROJECT_REF = '${approvedProjectRef}'`)) {
  failures.push(`${approvedConfigFile}: approved project reference changed unexpectedly`)
}

const supabaseModule = readFileSync(join(root, 'src/lib/supabase.ts'), 'utf8')
for (const requiredName of [
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'LAW_APPROVED_SUPABASE_URL',
  'assertLawPublicBackend',
]) {
  if (!supabaseModule.includes(requiredName)) failures.push(`src/lib/supabase.ts: missing ${requiredName} guard or binding`)
}

const page = readFileSync(join(root, 'src/app/page.tsx'), 'utf8')
for (const rpc of [
  'rr_get_public_law_catalog',
  'rr_get_public_research_catalog',
  'rr_get_public_official_sources',
  'rr_get_public_catalog_health',
]) {
  if (!page.includes(rpc)) failures.push(`src/app/page.tsx: required bounded RPC ${rpc} is missing`)
}
if (/\.from\("rr_/.test(page)) failures.push('src/app/page.tsx: direct rr_* table access detected; use bounded public RPCs')
for (const disclosure of ['Verified sources', 'Research index', 'Research only', 'Source review required']) {
  if (!page.includes(disclosure)) failures.push(`src/app/page.tsx: trust disclosure "${disclosure}" is missing`)
}

if (failures.length) {
  console.error('THE LAW backend isolation verification failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
    console.error(`::error title=THE LAW backend isolation::${failure.replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A')}`)
  }
  process.exit(1)
}

console.log(`THE LAW backend isolation and trust contract verified across ${sourceFiles.length} source files.`)
