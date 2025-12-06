import { t } from 'elysia'

export const PostResponse = t.Object({
  id: t.Number({ description: "自增" }),
  createdAt: t.Date({ description: "创建时间" }),
  updatedAt: t.Date({ description: "更新时间" }),
  title: t.String({ description: "文章标题" }),
  content: t.Nullable(t.String({ description: "文章内容" })),
  published: t.Boolean({ description: "发布状态" }),
  authorId: t.Number({ description: "作者id" }),
})

export const PostListResponse = t.Object({
  list: t.Array(PostResponse),
  total: t.Number(),
})

export const PostModel = {
  params: t.Object({ id: t.Numeric({ description: 'Post ID' }) }),

  listQuery: t.Intersect([
    t.Object({ page: t.Optional(t.Numeric()), pageSize: t.Optional(t.Numeric()) }),
    t.Partial(t.Object({
      title: t.Optional(t.String({ description: "文章标题" })),
      content: t.Optional(t.String({ description: "文章内容" })),
      published: t.Optional(t.Boolean({ description: "发布状态" })),
      authorId: t.Optional(t.Number({ description: "作者id" })),
    })),
  ]),

  createBody: t.Object({
    title: t.String({ description: "文章标题" }),
    content: t.Nullable(t.String({ description: "文章内容" })),
    published: t.Boolean({ description: "发布状态" }),
    authorId: t.Number({ description: "作者id" }),
  }),

  updateBody: t.Object({
    title: t.String({ description: "文章标题" }),
    content: t.Nullable(t.String({ description: "文章内容" })),
    published: t.Boolean({ description: "发布状态" }),
    authorId: t.Number({ description: "作者id" }),
  }),

  patchBody: t.Partial(t.Object({
    title: t.String({ description: "文章标题" }),
    content: t.Nullable(t.String({ description: "文章内容" })),
    published: t.Boolean({ description: "发布状态" }),
    authorId: t.Number({ description: "作者id" }),
  })),

  response: PostResponse,
  listResponse: PostListResponse,

  relations: {
    User: { model: 'User', type: 'one', fk: 'authorId' },
  },
} as const

export type PostIncludes = {
  includeUser?: boolean
}

export type PostModelType = {
  params: typeof PostModel.params.static
  listQuery: typeof PostModel.listQuery.static
  createBody: typeof PostModel.createBody.static
  updateBody: typeof PostModel.updateBody.static
  patchBody: typeof PostModel.patchBody.static
  response: typeof PostModel.response.static
  listResponse: typeof PostModel.listResponse.static
}
