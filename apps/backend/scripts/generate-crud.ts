#!/usr/bin/env bun
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * scripts/generate-crud.ts — FIXED VERSION (with description support)
 *
 * Usage:
 *   bun run scripts/generate-crud.ts Post User ...
 */

import fsPromises from 'fs/promises'
import path from 'path'
import { getSchema } from '@mrleebo/prisma-ast'

const PRISMA_SCHEMA_PATH = './prisma/schema.prisma'
const OUT_DIR = 'src/modules'
const PRISMA_CLIENT_IMPORT = '../../collection/db'

if (process.argv.length < 3) {
  console.error('Usage: bun run scripts/generate-crud.ts <ModelName> [OtherModelName ...]')
  process.exit(1)
}

const models = process.argv.slice(2)

// ---------------- util ----------------
const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const isAutoField = (n: string) => ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(n)

function cleanComment(raw?: string) {
  if (!raw) return ''
  return String(raw)
    .replace(/^\s*\/{2,}\s*/, '')
    .trim()
}

function pluralize(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('s')) return name
  if (/^(.*)(s|x|z|ch|sh)$/i.test(lower)) return `${name}es`
  if (/[^aeiou]y$/i.test(lower)) return name.replace(/y$/i, 'ies')
  return `${name}s`
}

// TODO Ast type
type Ast = unknown

function mapType(type: string, ast: Ast) {
  // detect enum
  const enumNode = ast.list.find((n) => n.type === 'enum' && n.name === type)
  if (enumNode) {
    const vals = enumNode.enumerators.map((v) => v.name)
    const items = vals.map((v) => `t.Literal(${JSON.stringify(v)})`).join(', ')
    return { validator: `t.Union([${items}])`, ts: vals.map((v) => `'${v}'`).join(' | '), kind: 'enum' }
  }

  switch (type) {
    case 'String':
      return { validator: 't.String()', ts: 'string', kind: 'scalar' }
    case 'Int':
    case 'Float':
      return { validator: 't.Number()', ts: 'number', kind: 'scalar' }
    case 'Boolean':
      return { validator: 't.Boolean()', ts: 'boolean', kind: 'scalar' }
    case 'DateTime':
      return { validator: 't.Date()', ts: 'string', kind: 'scalar' }
    case 'Json':
      return { validator: 't.Any()', ts: 'unknown', kind: 'scalar' }
    default:
      return { validator: 't.String()', ts: 'string', kind: 'scalar' }
  }
}

/**
 * formatValidator
 * - 如果没有 comment 或者 mapped.kind !== 'scalar'，返回原 validator
 * - 如果 mapped.validator 形如 t.String() (即以 () 结尾)，替换成 t.String({ description: "..." })
 * - 这不会对 t.Union([...])（enum）做自动修改，避免破坏表达式
 */
function formatValidator(mapped: { validator: string; ts: string; kind?: string }, comment?: string) {
  const desc = comment ? String(comment).trim() : ''
  if (!desc) return mapped.validator
  // only attach description for scalar kinds to avoid breaking unions
  if (mapped.kind && mapped.kind !== 'scalar') return mapped.validator
  // safe replace: only replace the exact ending "()"
  if (/\(\)$/.test(mapped.validator)) {
    return mapped.validator.replace(/\(\)$/, `({ description: ${JSON.stringify(desc)} })`)
  }
  // fallback: append options if it's not standard; but prefer to return original
  return mapped.validator
}

async function parseAst(schemaPath: string): Promise<Ast> {
  const prismaCode = await fsPromises.readFile(schemaPath, 'utf-8')
  return getSchema(prismaCode)
}

function extractModel(ast: Ast, modelName: string) {
  const modelNode = ast.list.find((n) => n.type === 'model' && n.name === modelName)
  if (!modelNode) throw new Error(`Model ${modelName} not found in prisma schema`)

  const fields = (modelNode.properties || [])
    .filter((p) => p.type === 'field')
    .map((f) => {
      const relAttr = (f.attributes || []).find((a) => a.name === 'relation')
      let relationFk: string | undefined = undefined

      if (relAttr?.args) {
        for (const arg of relAttr.args) {
          if (arg.value?.type === 'keyValue' && arg.value.key === 'fields') {
            const arr = arg.value.value
            if (arr?.args?.length > 0) relationFk = arr.args[0]
          }
        }
      }

      return {
        name: f.name,
        fieldType: typeof f.fieldType === 'string' ? f.fieldType : f.fieldType.name,
        optional: !!f.optional,
        isList: !!f.array,
        isRelation:
          !!relAttr ||
          (/^[A-Z]/.test(String(f.fieldType)) &&
            !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'].includes(String(f.fieldType))),
        relationFk,
        comment: cleanComment(f.comment || f.documentation),
      }
    })

  return { modelNode, fields }
}

async function exists(p: string) {
  try {
    const st = await fsPromises.stat(p)
    return st.isFile()
  } catch {
    return false
  }
}

// ----------------------------------- generate ----------------------------------
async function generateModel(ast: Ast, modelName: string) {
  const { fields } = extractModel(ast, modelName)

  const moduleKebab = kebab(modelName)
  const moduleDir = path.join(OUT_DIR, moduleKebab)
  await fsPromises.mkdir(moduleDir, { recursive: true })

  const targetFiles = ['model.ts', 'service.ts', 'index.ts'].map((f) => path.join(moduleDir, f))
  for (const f of targetFiles) {
    if (await exists(f)) {
      console.warn(`⚠️ Skip ${modelName}: file exists: ${f}`)
      return
    }
  }

  const responseFields = fields.filter((f) => !f.isRelation)
  const writableFields = fields.filter((f) => !isAutoField(f.name) && !f.isRelation)
  const relations = fields.filter((f) => f.isRelation)

  // ------------------- model.ts -------------------
  const modelLines: string[] = []
  modelLines.push(`import { t } from 'elysia'\n`)

  // response
  const responseConst = `${modelName}Response`
  modelLines.push(`export const ${responseConst} = t.Object({`)
  for (const f of responseFields) {
    const mapped = mapType(f.fieldType, ast)
    const base = formatValidator(mapped, f.comment)
    const val = f.optional ? `t.Nullable(${base})` : base
    modelLines.push(`  ${f.name}: ${val},`)
  }
  modelLines.push(`})\n`)

  // listResponse
  const listResponseConst = `${modelName}ListResponse`
  modelLines.push(`export const ${listResponseConst} = t.Object({`)
  modelLines.push(`  list: t.Array(${responseConst}),`)
  modelLines.push(`  total: t.Number(),`)
  modelLines.push(`})\n`)

  // model root const
  const modelConst = `${modelName}Model`
  modelLines.push(`export const ${modelConst} = {`)

  // params
  modelLines.push(`  params: t.Object({ id: t.Numeric({ description: '${modelName} ID' }) }),\n`)

  // listQuery
  modelLines.push(`  listQuery: t.Intersect([`)
  modelLines.push(`    t.Object({ page: t.Optional(t.Numeric()), pageSize: t.Optional(t.Numeric()) }),`)
  modelLines.push(`    t.Partial(t.Object({`)
  for (const f of writableFields) {
    const mapped = mapType(f.fieldType, ast)
    const base = formatValidator(mapped, f.comment)
    modelLines.push(`      ${f.name}: t.Optional(${base}),`)
  }
  modelLines.push(`    })),`)
  modelLines.push(`  ]),\n`)

  // create / update / patch bodies
  const writeBody = (name: string, isPatch = false) => {
    if (isPatch) {
      modelLines.push(`  ${name}: t.Partial(t.Object({`)
    } else {
      modelLines.push(`  ${name}: t.Object({`)
    }

    for (const f of writableFields) {
      const mapped = mapType(f.fieldType, ast)
      const base = formatValidator(mapped, f.comment)
      // for create/update bodies, if field is optional in prisma (nullable), we should keep Nullable in body
      const val = f.optional ? `t.Nullable(${base})` : base
      modelLines.push(`    ${f.name}: ${val},`)
    }

    modelLines.push(isPatch ? `  })),\n` : `  }),\n`)
  }

  writeBody('createBody')
  writeBody('updateBody')
  writeBody('patchBody', true)

  // response refs
  modelLines.push(`  response: ${responseConst},`)
  modelLines.push(`  listResponse: ${listResponseConst},\n`)

  // relations meta
  if (relations.length) {
    modelLines.push(`  relations: {`)
    for (const r of relations) {
      modelLines.push(
        `    ${r.name}: { model: '${r.fieldType}', type: '${r.isList ? 'many' : 'one'}', fk: '${r.relationFk ?? ''}' },`,
      )
    }
    modelLines.push(`  },`)
  }

  modelLines.push(`} as const\n`)

  // Includes type
  if (relations.length) {
    modelLines.push(`export type ${modelName}Includes = {`)
    for (const r of relations) {
      modelLines.push(`  include${capitalize(r.name)}?: boolean`)
    }
    modelLines.push(`}\n`)
  }

  // TS types
  modelLines.push(`export type ${modelName}ModelType = {`)
  modelLines.push(`  params: typeof ${modelConst}.params.static`)
  modelLines.push(`  listQuery: typeof ${modelConst}.listQuery.static`)
  modelLines.push(`  createBody: typeof ${modelConst}.createBody.static`)
  modelLines.push(`  updateBody: typeof ${modelConst}.updateBody.static`)
  modelLines.push(`  patchBody: typeof ${modelConst}.patchBody.static`)
  modelLines.push(`  response: typeof ${modelConst}.response.static`)
  modelLines.push(`  listResponse: typeof ${modelConst}.listResponse.static`)
  modelLines.push(`}\n`)

  await fsPromises.writeFile(path.join(moduleDir, 'model.ts'), modelLines.join('\n'), 'utf8')

  // ------------------- service.ts -------------------
  const serviceLines: string[] = []
  const prismaVar = lowerFirst(modelName)

  serviceLines.push(`import { prisma } from '${PRISMA_CLIENT_IMPORT}'`)
  serviceLines.push(
    `import type { ${modelName}ModelType${relations.length ? `, ${modelName}Includes` : ''} } from './model'\n`,
  )

  serviceLines.push(
    `export type ${modelName}IncludeOptions = ${relations.length ? `${modelName}Includes | undefined` : 'undefined'}\n`,
  )

  serviceLines.push(`export abstract class ${modelName}Service {`)

  // list
  serviceLines.push(
    `  static async list(query: ${modelName}ModelType['listQuery'], options?: { include?: ${modelName}IncludeOptions }): Promise<${modelName}ModelType['listResponse']> {`,
  )
  serviceLines.push(`    const { page = 1, pageSize = 20, ...where } = query`)
  if (relations.length) {
    serviceLines.push(`    const include = options?.include ? {`)
    for (const r of relations)
      serviceLines.push(`      ...(options.include?.include${capitalize(r.name)} ? { ${r.name}: true } : {}),`)
    serviceLines.push(`    } : undefined`)
  } else {
    serviceLines.push(`    const include = undefined`)
  }
  serviceLines.push(`    const [list, total] = await Promise.all([`)
  serviceLines.push(
    `      prisma.${prismaVar}.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, include }),`,
  )
  serviceLines.push(`      prisma.${prismaVar}.count({ where })`)
  serviceLines.push(`    ])`)
  serviceLines.push(`    return { list, total }`)
  serviceLines.push(`  }\n`)

  // detail
  serviceLines.push(
    `  static async detail(id: number, options?: { include?: ${modelName}IncludeOptions }): Promise<${modelName}ModelType['response'] | null> {`,
  )
  if (relations.length) {
    serviceLines.push(`    const include = options?.include ? {`)
    for (const r of relations) {
      serviceLines.push(`      ...(options.include?.include${capitalize(r.name)} ? { ${r.name}: true } : {}),`)
    }
    serviceLines.push(`    } : undefined`)
  } else {
    serviceLines.push(`    const include = undefined`)
  }
  serviceLines.push(`    return prisma.${prismaVar}.findUnique({ where: { id }, include })`)
  serviceLines.push(`  }\n`)

  // create — FIXED: no id
  serviceLines.push(
    `  static async create(data: ${modelName}ModelType['createBody']): Promise<${modelName}ModelType['response']> {`,
  )
  serviceLines.push(`    return prisma.${prismaVar}.create({ data })`)
  serviceLines.push(`  }\n`)

  // update
  serviceLines.push(
    `  static async update(id: number, data: ${modelName}ModelType['updateBody']): Promise<${modelName}ModelType['response']> {`,
  )
  serviceLines.push(`    return prisma.${prismaVar}.update({ where: { id }, data })`)
  serviceLines.push(`  }\n`)

  // patch
  serviceLines.push(
    `  static async patch(id: number, data: ${modelName}ModelType['patchBody']): Promise<${modelName}ModelType['response']> {`,
  )
  serviceLines.push(`    return prisma.${prismaVar}.update({ where: { id }, data })`)
  serviceLines.push(`  }\n`)

  // delete
  serviceLines.push(`  static async delete(id: number): Promise<${modelName}ModelType['response']> {`)
  serviceLines.push(`    return prisma.${prismaVar}.delete({ where: { id } })`)
  serviceLines.push(`  }\n`)

  serviceLines.push(`}`)

  await fsPromises.writeFile(path.join(moduleDir, 'service.ts'), serviceLines.join('\n'), 'utf8')

  // ------------------- index.ts -------------------
  const pluralKebab = kebab(pluralize(modelName))
  const routerVar = moduleKebab.replace(/-/g, '')

  const indexLines: string[] = []
  indexLines.push(`import { Elysia, t } from 'elysia'`)
  indexLines.push(`import { ${modelName}Service } from './service'`)
  indexLines.push(`import { ${modelName}Model } from './model'\n`)

  indexLines.push(`export const ${routerVar} = new Elysia({ prefix: '/${pluralKebab}' })`)
  indexLines.push(
    `  .get('/', ({ query }) => ${modelName}Service.list(query), { query: ${modelName}Model.listQuery, response: ${modelName}Model.listResponse })`,
  )
  indexLines.push(
    `  .get('/:id', ({ params }) => ${modelName}Service.detail(params.id), { params: ${modelName}Model.params, response: t.Nullable(${modelName}Model.response) })`,
  )
  indexLines.push(
    `  .post('/', ({ body }) => ${modelName}Service.create(body), { body: ${modelName}Model.createBody, response: ${modelName}Model.response })`,
  )
  indexLines.push(
    `  .put('/:id', ({ params, body }) => ${modelName}Service.update(params.id, body), { params: ${modelName}Model.params, body: ${modelName}Model.updateBody, response: ${modelName}Model.response })`,
  )
  indexLines.push(
    `  .patch('/:id', ({ params, body }) => ${modelName}Service.patch(params.id, body), { params: ${modelName}Model.params, body: ${modelName}Model.patchBody, response: ${modelName}Model.response })`,
  )
  indexLines.push(
    `  .delete('/:id', ({ params }) => ${modelName}Service.delete(params.id), { params: ${modelName}Model.params, response: ${modelName}Model.response })`,
  )

  await fsPromises.writeFile(path.join(moduleDir, 'index.ts'), indexLines.join('\n'), 'utf8')

  console.log(`✅ Generated ${modelName} -> ${moduleDir}`)
}

// ---------------- main ----------------
async function main() {
  const ast = await parseAst(PRISMA_SCHEMA_PATH)
  for (const m of models) {
    try {
      await generateModel(ast, m)
    } catch (e) {
      console.error(`❌ Failed to generate ${m}: ${e?.message ?? e}`)
    }
  }
  console.log('✨ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
