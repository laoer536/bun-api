import { openapi } from '@elysiajs/openapi'
export const openapiPlugin = openapi({
  enabled: true,
  path: '/v1-openai',
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
