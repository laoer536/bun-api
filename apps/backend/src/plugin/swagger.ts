import { swagger } from '@elysiajs/swagger'

export const swaggerPlugin = swagger({
  scalarConfig: { darkMode: true },
  path: '/v1/swagger',
  documentation: {
    info: { version: '1.0.0', title: 'bun-api', description: 'bun-api for bun fullstack' },
    tags: [
      { name: 'Authority', description: 'User login authentication' },
      { name: 'User', description: 'User Services' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})
