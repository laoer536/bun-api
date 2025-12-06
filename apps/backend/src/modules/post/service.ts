import { prisma } from '../../collection/db'
import type { PostModelType, PostIncludes } from './model'

export type PostIncludeOptions = PostIncludes | undefined

export abstract class PostService {
  static async list(query: PostModelType['listQuery'], options?: { include?: PostIncludeOptions }): Promise<PostModelType['listResponse']> {
    const { page = 1, pageSize = 20, ...where } = query
    const include = options?.include ? {
      ...(options.include?.includeUser ? { User: true } : {}),
    } : undefined
    const [list, total] = await Promise.all([
      prisma.post.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, include }),
      prisma.post.count({ where })
    ])
    return { list, total }
  }

  static async detail(id: number, options?: { include?: PostIncludeOptions }): Promise<PostModelType['response'] | null> {
    const include = options?.include ? {
      ...(options.include?.includeUser ? { User: true } : {}),
    } : undefined
    return prisma.post.findUnique({ where: { id }, include })
  }

  static async create(data: PostModelType['createBody']): Promise<PostModelType['response']> {
    return prisma.post.create({ data })
  }

  static async update(id: number, data: PostModelType['updateBody']): Promise<PostModelType['response']> {
    return prisma.post.update({ where: { id }, data })
  }

  static async patch(id: number, data: PostModelType['patchBody']): Promise<PostModelType['response']> {
    return prisma.post.update({ where: { id }, data })
  }

  static async delete(id: number): Promise<PostModelType['response']> {
    return prisma.post.delete({ where: { id } })
  }

}