import { t } from 'elysia'

export const AuthorityModel = {
  getVerificationCodeBody: t.Object({ email: t.String({ description: 'User email' }) }),
  getVerificationCodeResponse: t.Literal(
    'The verification code was successfully obtained, please check it in your mailbox.',
  ),
  loginBody: t.Object({
    verificationCode: t.String({ description: 'User verification code' }),
    email: t.String({ description: 'User email' }),
  }),
  loginResponse: t.String({ description: 'Generated user token' }),
  loginResponse400: t.Union([
    t.Literal(
      'The verification code is incorrect, please check your email verification code, or get it again after 60s.',
    ),
    t.Literal('Please get a verification code first.'),
  ]),
} as const

// 对应的类型导出
export type AuthorityModelType = {
  getVerificationCodeBody: typeof AuthorityModel.getVerificationCodeBody.static
  getVerificationCodeResponse: typeof AuthorityModel.getVerificationCodeResponse.static
  loginBody: typeof AuthorityModel.loginBody.static
  loginResponse: typeof AuthorityModel.loginResponse.static
}
