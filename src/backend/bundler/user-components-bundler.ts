import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import bundler from './bundler'
import generateEntry from './generate-user-component-entry'
import { ADMIN_BRO_TMP_DIR } from '../../constants'

const entryPath = path.join(ADMIN_BRO_TMP_DIR, '.entry.js')
const outPath = path.join(ADMIN_BRO_TMP_DIR, 'bundle.js')

async function build(admin, { write = false, watch = false } = {}): Promise<string> {
  const entryFile = generateEntry(admin, ADMIN_BRO_TMP_DIR)

  try {
    await util.promisify(fs.mkdir)(ADMIN_BRO_TMP_DIR, { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') { throw error }
  }

  // if components bundle was requested and there are already bundled - return
  // that instead of bundling them again
  if (!write) {
    try {
      const existingBundle = await util.promisify(fs.readFile)(outPath, 'utf-8')
      return existingBundle
    } catch (error) {
      if (error.code !== 'ENOENT') { throw error }
    }
  }

  await util.promisify(fs.writeFile)(entryPath, entryFile)

  return bundler({
    name: 'AdminBroCustom',
    input: entryPath,
    watch,
    file: write ? outPath : null,
    minify: process.env.NODE_ENV === 'production',
  })
}

export {
  build as default,
  outPath,
}
