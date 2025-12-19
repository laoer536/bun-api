import { t } from 'elysia'
import { UserPlain } from '@generated/prismabox/User.ts'

export const UserModel = {
  users: t.Array(UserPlain),
} as const

// 对应的类型导出
export type UserModelType = {
  users: typeof UserModel.users.static
}
