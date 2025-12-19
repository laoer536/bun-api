/// Just demo the CRUD interface

import { Elysia, t } from 'elysia'
import { PostService } from './service'
import { PostModel } from './model'

export const post = new Elysia({ prefix: '/posts' })
  .get('/', ({ query }) => PostService.list(query), { query: PostModel.listQuery, response: PostModel.listResponse })
  .get('/:id', ({ params }) => PostService.detail(params.id), {
    params: PostModel.params,
    response: t.Nullable(PostModel.response),
  })
  .post('/', ({ body }) => PostService.create(body), { body: PostModel.createBody, response: PostModel.response })
  .put('/:id', ({ params, body }) => PostService.update(params.id, body), {
    params: PostModel.params,
    body: PostModel.updateBody,
    response: PostModel.response,
  })
  .patch('/:id', ({ params, body }) => PostService.patch(params.id, body), {
    params: PostModel.params,
    body: PostModel.patchBody,
    response: PostModel.response,
  })
  .delete('/:id', ({ params }) => PostService.delete(params.id), {
    params: PostModel.params,
    response: PostModel.response,
  })
