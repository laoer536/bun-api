import { t } from 'elysia'

export const UserModel = {
  users: t.Array(
    t.Object({
      id: t.Number(),
      email: t.String(),
      name: t.Nullable(t.String()),
    }),
  ),
} as const

// 对应的类型导出
export type UserModelType = {
  users: typeof UserModel.users.static
}
